import type { networks, Pset, UpdaterInput, UpdaterOutput } from 'liquidjs-lib';
import { address, Creator, Transaction, Updater } from 'liquidjs-lib';
import type { Slip77Interface } from 'slip77';
import { SLIP77Factory } from 'slip77';
import * as ecc from 'tiny-secp256k1';

import type { CoinSelectionForTrade, ScriptDetails } from '../../../store/walletStore';

// SwapTransactionInterface defines the minimum needed for implementation to hold data to construct a valid swap transaction.
interface SwapTransactionInterface {
  network: networks.Network;
  pset: Pset;
  inputBlindingKeys: Record<string, Buffer>;
  outputBlindingKeys: Record<string, Buffer>;
  blindingKeyNode: Slip77Interface;
}

const slip77 = SLIP77Factory(ecc);

// SwapTransaction holds a pset and expose a create method to select coins and build a transaction for a SwapRequest message
export class SwapTransaction implements SwapTransactionInterface {
  blindingKeyNode: Slip77Interface;
  inputBlindingKeys: Record<string, Buffer> = {};
  outputBlindingKeys: Record<string, Buffer> = {};
  network: networks.Network;
  pset: Pset;

  constructor({ network, masterBlindingKey }: { network: networks.Network; masterBlindingKey: string }) {
    this.network = network;
    this.pset = Creator.newPset();
    this.blindingKeyNode = slip77.fromMasterBlindingKey(masterBlindingKey);
  }

  async createProto(
    coinSelectionForTrade: CoinSelectionForTrade,
    amountToBeSent: number,
    amountToReceive: number,
    assetToBeSent: string,
    assetToReceive: string,
    addressForChangeOutput: ScriptDetails,
    addressForSwapOutput: ScriptDetails
  ): Promise<void> {
    const ins: UpdaterInput[] = [];
    const outs: UpdaterOutput[] = [];
    const { changeOutputs, witnessUtxos } = coinSelectionForTrade;

    for (const [outpointStr, witnessUtxo] of Object.entries(witnessUtxos)) {
      const [txid, vout] = outpointStr.split(':');
      ins.push({
        txid: txid,
        txIndex: Number(vout),
        sighashType: Transaction.SIGHASH_ALL,
        witnessUtxo: witnessUtxo,
      });
      const scriptHex = witnessUtxo?.script;
      if (!scriptHex) continue;
      const { privateKey } = this._deriveBlindingKey(scriptHex);
      this.inputBlindingKeys[scriptHex.toString('hex')] = privateKey;
    }

    // Outputs
    // add the receiving output
    const updaterOutReceive: UpdaterOutput = {
      asset: assetToReceive,
      amount: amountToReceive,
      script: Buffer.from(addressForSwapOutput.script, 'hex'),
    };
    if (address.isConfidential(addressForSwapOutput?.confidentialAddress ?? '')) {
      updaterOutReceive.blinderIndex = 0;
      updaterOutReceive.blindingPublicKey = Buffer.from(addressForSwapOutput.blindingPublicKey ?? '', 'hex');
      this.outputBlindingKeys[addressForSwapOutput.script] = Buffer.from(
        addressForSwapOutput.blindingPrivateKey,
        'hex'
      );
    }
    outs.push(updaterOutReceive);
    // add the changes outputs
    if (changeOutputs && changeOutputs.length > 0) {
      for (const { asset, amount } of changeOutputs) {
        const updaterOutChange: UpdaterOutput = {
          asset: asset,
          amount: amount,
          script: Buffer.from(addressForChangeOutput.script, 'hex'),
        };
        if (address.isConfidential(addressForChangeOutput?.confidentialAddress ?? '')) {
          updaterOutChange.blinderIndex = 0;
          updaterOutChange.blindingPublicKey = Buffer.from(addressForChangeOutput?.blindingPublicKey ?? '', 'hex');
          this.outputBlindingKeys[addressForChangeOutput.script] = Buffer.from(
            addressForChangeOutput.blindingPrivateKey,
            'hex'
          );
        }
        outs.push(updaterOutChange);
      }
    }

    // Update pset
    const updater = new Updater(this.pset).addInputs(ins).addOutputs(outs);
    this.pset = updater.pset;
  }

  private _deriveBlindingKey(script: Buffer): { publicKey: Buffer; privateKey: Buffer } {
    if (!this.blindingKeyNode) throw new Error('No blinding key node, Account cannot derive blinding key');
    const derived = this.blindingKeyNode.derive(script);
    if (!derived.publicKey || !derived.privateKey) throw new Error('Could not derive blinding key');
    return { publicKey: derived.publicKey, privateKey: derived.privateKey };
  }
}
