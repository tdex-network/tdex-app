import type { OwnedInput, UpdaterInput, UpdaterOutput } from 'liquidjs-lib';
import { Pset, address, Creator, networks, payments, Transaction, Updater, AssetHash } from 'liquidjs-lib';
import { getScriptType, ScriptType } from 'liquidjs-lib/src/address';
import { varSliceSize, varuint } from 'liquidjs-lib/src/bufferutils';
import { Psbt } from 'liquidjs-lib/src/psbt';
import { ElectrumWS } from 'ws-electrumx-client';

import { WsElectrumChainSource } from '../services/chainSource';
import { useSettingsStore } from '../store/settingsStore';
import type { Recipient, TxHeuristic, ScriptDetails } from '../store/walletStore';
import { useWalletStore } from '../store/walletStore';

import { outpointToString } from './helpers';

const FEE_OUTPUT_SIZE = 33 + 9 + 1 + 1; // unconf fee output size
const INPUT_BASE_SIZE = 40; // 32 bytes for outpoint, 4 bytes for sequence, 4 for index

function txBaseSize(inScriptSigsSize: number[], outNonWitnessesSize: number[]): number {
  const inSize = inScriptSigsSize.reduce((a, b) => a + b + INPUT_BASE_SIZE, 0);
  const outSize = outNonWitnessesSize.reduce((a, b) => a + b, 0) + FEE_OUTPUT_SIZE; // add unconf fee output size
  return (
    9 +
    varuint.encodingLength(inScriptSigsSize.length) +
    inSize +
    varuint.encodingLength(outNonWitnessesSize.length + 1) +
    outSize
  );
}

function txWitnessSize(inWitnessesSize: number[], outWitnessesSize: number[]): number {
  const inSize = inWitnessesSize.reduce((a, b) => a + b, 0);
  const outSize = outWitnessesSize.reduce((a, b) => a + b, 0) + 1 + 1; // add the size of proof for unconf fee output
  return inSize + outSize;
}

function estimateScriptSigSize(type: ScriptType): number {
  switch (type) {
    case ScriptType.P2Pkh:
      return 108;
    case (ScriptType.P2Sh, ScriptType.P2Wsh):
      return 35;
    case (ScriptType.P2Wsh, ScriptType.P2Tr, ScriptType.P2Wpkh):
      return 1;
  }
  return 0;
}

// estimate pset virtual size after signing, take confidential outputs into account
// aims to estimate the fee amount needed to be paid before blinding or signing the pset
function estimateVirtualSize(pset: Pset, withFeeOutput: boolean): number {
  const inScriptSigsSize = [];
  const inWitnessesSize = [];
  for (const input of pset.inputs) {
    const utxo = input.getUtxo();
    if (!utxo) throw new Error('missing input utxo, cannot estimate pset virtual size');
    const type = getScriptType(utxo.script);
    const scriptSigSize = estimateScriptSigSize(type);
    let witnessSize = 1 + 1 + 1; // add no issuance proof + no token proof + no pegin
    if (input.redeemScript) {
      // get multisig
      witnessSize += varSliceSize(input.redeemScript);
      const pay = payments.p2ms({ output: input.redeemScript });
      if (pay && pay.m) {
        witnessSize += pay.m * 75 + pay.m - 1;
      }
    } else {
      // len + witness[sig, pubkey]
      witnessSize += 1 + 107;
    }
    inScriptSigsSize.push(scriptSigSize);
    inWitnessesSize.push(witnessSize);
  }
  const outSizes = [];
  const outWitnessesSize = [];
  for (const output of pset.outputs) {
    let outSize = 33 + 9 + 1; // asset + value + empty nonce
    let witnessSize = 1 + 1; // no rangeproof + no surjectionproof
    if (output.needsBlinding()) {
      outSize = 33 + 33 + 33; // asset commitment + value commitment + nonce
      witnessSize = 3 + 4174 + 1 + 131; // rangeproof + surjectionproof + their sizes
    }
    outSizes.push(outSize);
    outWitnessesSize.push(witnessSize);
  }
  if (withFeeOutput) {
    outSizes.push(FEE_OUTPUT_SIZE);
    outWitnessesSize.push(1 + 1); // no rangeproof + no surjectionproof
  }
  const baseSize = txBaseSize(inScriptSigsSize, outSizes);
  const sizeWithWitness = baseSize + txWitnessSize(inWitnessesSize, outWitnessesSize);
  const weight = baseSize * 3 + sizeWithWitness;
  return (weight + 3) / 4;
}

type MakeSendPsetResult = {
  pset: Pset;
  feeAmount: number; // fee amount in satoshi
};

// create a pset with the given recipients and data recipients
// select utxos from the main accounts
export async function makeSendPset(
  recipients: Recipient[],
  feeAssetHash: string,
  deductFeeFromAmount = false
): Promise<MakeSendPsetResult> {
  const pset = Creator.newPset();
  let network = useSettingsStore.getState().network;
  const coinSelection = await useWalletStore.getState().selectUtxos(recipients, true);
  const ins: UpdaterInput[] = [];
  const outs: UpdaterOutput[] = [];
  // get witness utxos
  const witnessUtxos = coinSelection.utxos.map(({ txid, vout }) => {
    const txHex = useWalletStore.getState().txs[txid].hex;
    if (txHex) {
      return Transaction.fromHex(txHex).outs[vout];
    } else {
      return undefined;
    }
  });
  // add inputs
  ins.push(
    ...coinSelection.utxos.map((utxo, i) => ({
      txid: utxo.txid,
      txIndex: utxo.vout,
      sighashType: Transaction.SIGHASH_ALL,
      witnessUtxo: witnessUtxos[i],
    }))
  );
  // add recipients
  for (const recipient of recipients) {
    const updaterOut: UpdaterOutput = {
      asset: recipient.asset,
      amount: recipient.value,
      script: address.toOutputScript(recipient.address, networks[network]),
    };
    if (address.isConfidential(recipient.address)) {
      updaterOut.blinderIndex = 0;
      updaterOut.blindingPublicKey = address.fromConfidential(recipient.address).blindingKey;
    }
    outs.push(updaterOut);
  }
  // add the changes outputs
  const changeOutputsStartIndex = outs.length;
  if (coinSelection.changeOutputs && coinSelection.changeOutputs.length > 0) {
    for (const { asset, amount } of coinSelection.changeOutputs) {
      const changeScriptDetail = await useWalletStore.getState().getNextAddress(true);
      outs.push({
        asset,
        amount,
        script: Buffer.from(changeScriptDetail.script, 'hex'),
        blinderIndex: 0,
        blindingPublicKey: changeScriptDetail.blindingPublicKey
          ? Buffer.from(changeScriptDetail.blindingPublicKey, 'hex')
          : undefined,
      });
    }
  }
  const websocketExplorerURL = useSettingsStore.getState().websocketExplorerURL;
  const client = new ElectrumWS(websocketExplorerURL);
  const chainSource = new WsElectrumChainSource(client);
  if (!chainSource) throw new Error('chain source not found, cannot estimate fee');
  // create the updater
  const updater = new Updater(pset).addInputs(ins).addOutputs(outs);
  // we add 50% to the min relay fee in order to be sure that the transaction will be accepted by the network
  // some inputs and outputs may be added later to pay the fees
  const relayFee = (await chainSource.getRelayFee()) * 1.5;
  const sats1000Bytes = relayFee * 10 ** 8;
  const estimatedSize = estimateVirtualSize(updater.pset, true);
  let feeAmount = Math.ceil(estimatedSize * (sats1000Bytes / 1000));
  const newIns = [];
  const newOuts = [];
  if (deductFeeFromAmount) {
    pset.outputs[0].value -= feeAmount;
    // add the fee output
    updater.addOutputs([
      {
        asset: feeAssetHash,
        amount: feeAmount,
      },
    ]);
  } else {
    if (feeAssetHash === networks[network].assetHash) {
      // check if one of the change outputs can cover the fees
      const onlyChangeOuts = outs.slice(changeOutputsStartIndex);
      const lbtcChangeOutputIndex = onlyChangeOuts.findIndex(
        (out) => out.asset === feeAssetHash && out.amount >= feeAmount
      );
      if (lbtcChangeOutputIndex !== -1) {
        pset.outputs[changeOutputsStartIndex + lbtcChangeOutputIndex].value -= feeAmount;
        // add the fee output
        updater.addOutputs([
          {
            asset: feeAssetHash,
            amount: feeAmount,
          },
        ]);
      } else {
        // reselect
        const newCoinSelection = await useWalletStore.getState().selectUtxos(
          [
            {
              asset: networks[network].assetHash,
              value: feeAmount,
              address: '',
            },
          ],
          true
        );
        // get witness utxos
        const newWitnessUtxos = newCoinSelection.utxos.map(({ txid, vout }) => {
          const txHex = useWalletStore.getState().txs[txid].hex;
          if (txHex) {
            return Transaction.fromHex(txHex).outs[vout];
          } else {
            return undefined;
          }
        });
        // add inputs
        newIns.push(
          ...newCoinSelection.utxos.map((utxo, i) => ({
            txid: utxo.txid,
            txIndex: utxo.vout,
            sighashType: Transaction.SIGHASH_ALL,
            witnessUtxo: newWitnessUtxos[i],
          }))
        );
        if (newCoinSelection.changeOutputs && newCoinSelection.changeOutputs.length > 0) {
          const { confidentialAddress: changeAddress } = await useWalletStore.getState().getNextAddress(true);
          if (!changeAddress) {
            throw new Error('change address not found');
          }
          newOuts.push({
            asset: newCoinSelection.changeOutputs[0].asset,
            amount: newCoinSelection.changeOutputs[0].amount,
            script: address.toOutputScript(changeAddress, networks[network]),
            blinderIndex: 0,
            blindingPublicKey: address.fromConfidential(changeAddress).blindingKey,
          });
          const outputIndex = pset.globals.outputCount;
          // reversing the array ensures that the fee output is the last one for consistency
          newOuts.reverse();
          updater.addInputs(newIns).addOutputs(newOuts);
          // re-estimate the size with new selection
          const estimatedSize = estimateVirtualSize(updater.pset, true);
          const newFeeAmount = Math.ceil(estimatedSize * (sats1000Bytes / 1000));
          const diff = newFeeAmount - feeAmount;
          // deduce from change output if possible
          if (pset.outputs[outputIndex].value > diff) {
            pset.outputs[outputIndex].value -= diff;
            feeAmount = newFeeAmount;
          } else {
            // if change cannot cover the fee, remove it and add it to the fee output
            feeAmount += pset.outputs[outputIndex].value;
            pset.outputs.splice(outputIndex, 1);
          }
          // add the fee output
          updater.addOutputs([
            {
              asset: feeAssetHash,
              amount: feeAmount,
            },
          ]);
        }
      }
      // taxi fee
    } else {
      throw new Error('taxi topup not supported');
    }
  }

  return {
    pset: updater.pset,
    feeAmount,
  };
}

// can be used with sort()
export function compareTxDate(a: TxHeuristic, b: TxHeuristic): number {
  return b.blockTime?.diff(a.blockTime) || 0;
}

export function isValidAmount(amount: number): boolean {
  return !(amount <= 0 || !Number.isSafeInteger(amount));
}

export function decodePset(psetBase64: string): Pset {
  let pset: Pset;
  try {
    pset = Pset.fromBase64(psetBase64);
  } catch (ignore) {
    throw new Error('Invalid pset');
  }
  return pset;
}

export function decodePsbt(psetBase64: string): { psbt: Psbt; transaction: Transaction } {
  let psbt: Psbt;
  try {
    psbt = Psbt.fromBase64(psetBase64);
  } catch (ignore) {
    console.log(ignore);
    throw new Error('Invalid psbt');
  }
  const bufferTx = psbt.data.globalMap.unsignedTx.toBuffer();
  const transaction = Transaction.fromBuffer(bufferTx);
  return {
    psbt,
    transaction,
  };
}

export function isPsetV0(tx: string): boolean {
  try {
    Psbt.fromBase64(tx);
    return true;
  } catch (ignore) {
    return false;
  }
}

export function isRawTransaction(tx: string): boolean {
  try {
    Transaction.fromHex(tx);
    return true;
  } catch (ignore) {
    return false;
  }
}

export function psetToOwnedInputs(pset: Pset): { ownedInputs: OwnedInput[]; inputIndexes: number[] } {
  // find input index belonging to this account
  const inputsScripts = pset.inputs
    .map((input) => input.witnessUtxo?.script)
    .filter((script): script is Buffer => !!script)
    .map((script) => script.toString('hex'));
  // Get scriptDetails from inputScripts
  let scriptsDetails: Record<string, ScriptDetails> = {};
  for (const script of inputsScripts) {
    const scriptDetails = useWalletStore.getState().scriptDetails[script];
    if (scriptDetails) {
      scriptsDetails[script] = scriptDetails;
    }
  }
  const inputIndexes = [];
  for (let i = 0; i < pset.inputs.length; i++) {
    const input = pset.inputs[i];
    const script = input.witnessUtxo?.script;
    if (!script) continue;
    const scriptDetails = scriptsDetails[script.toString('hex')];
    if (scriptDetails) {
      inputIndexes.push(i);
    }
  }
  const ownedInputs: OwnedInput[] = [];
  for (const inputIndex of inputIndexes) {
    const input = pset.inputs[inputIndex];
    const unblindOutput =
      useWalletStore.getState().outputHistory[
        outpointToString({
          txid: Buffer.from(input.previousTxid).reverse().toString('hex'),
          vout: input.previousTxIndex,
        })
      ];
    if (!unblindOutput || !unblindOutput.blindingData) continue;
    ownedInputs.push({
      asset: AssetHash.fromHex(unblindOutput.blindingData.asset).bytesWithoutPrefix.reverse(),
      assetBlindingFactor: Buffer.from(unblindOutput.blindingData.assetBlindingFactor, 'hex'),
      valueBlindingFactor: Buffer.from(unblindOutput.blindingData.valueBlindingFactor, 'hex'),
      value: unblindOutput.blindingData.value.toString(),
      index: inputIndex,
    });
  }
  return { ownedInputs, inputIndexes };
}
