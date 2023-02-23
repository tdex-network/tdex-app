import type { confidential, networks, Pset, TxOutput, UpdaterInput, UpdaterOutput } from 'liquidjs-lib';
import { address, Creator, Transaction, Updater } from 'liquidjs-lib';
import type { Slip77Interface } from 'slip77';
import { SLIP77Factory } from 'slip77';
import * as ecc from 'tiny-secp256k1';

let coinSelect = require('coinselect');

// SwapTransactionInterface defines the minimum needed for implementation to hold data to construct a valid swap transaction.
interface SwapTransactionInterface {
  network: networks.Network;
  pset: Pset;
  inputBlindingKeys: Record<string, Buffer>;
  outputBlindingKeys: Record<string, Buffer>;
  blindingKeyNode: Slip77Interface;
}

export interface Outpoint {
  txid: string;
  vout: number;
}

export declare type Output = Outpoint & {
  prevout: TxOutput;
};

export declare type UnblindedOutput = Output & {
  unblindData: confidential.UnblindOutputResult;
};

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

  async create(
    unspents: (UnblindedOutput & { redeemScript?: Buffer; witnessScript?: Buffer })[],
    amountToBeSent: number,
    amountToReceive: number,
    assetToBeSent: string,
    assetToReceive: string,
    addressForSwapOutput: string,
    addressForChangeOutput: string
  ): Promise<void> {
    const ins: UpdaterInput[] = [];
    const outs: UpdaterOutput[] = [];
    const selectedUtxos: UnblindedOutput[] = [];
    const changeOutputs: { asset: string; amount: number }[] = [];
    const onlyWithUnblindingData = unspents.filter((utxo) => utxo.unblindData);
    const utxos = onlyWithUnblindingData.filter((utxo) => utxo.unblindData?.asset.toString('hex') === assetToBeSent);

    // Coin selection
    const { inputs, outputs } = coinSelect(
      utxos.map((utxo) => ({
        txId: utxo.txid,
        vout: utxo.vout,
        value: utxo.unblindData?.value,
      })),
      [{ address: 'fake', value: amountToBeSent }],
      0
    );
    if (inputs) {
      selectedUtxos.push(
        ...(inputs as { txId: string; vout: number }[]).map(
          (input) =>
            onlyWithUnblindingData.find(
              (utxo) => utxo.txid === input.txId && utxo.vout === input.vout
            ) as UnblindedOutput
        )
      );
    }
    if (outputs) {
      changeOutputs.push(
        ...outputs
          .filter((output: any) => output.address === undefined) // only add change outputs
          .map((output: { value: number }) => ({
            asset: assetToBeSent,
            amount: output.value,
          }))
      );
    }

    // Inputs
    for (const utxo of selectedUtxos) {
      ins.push({
        txid: utxo.txid,
        txIndex: utxo.vout,
        sighashType: Transaction.SIGHASH_ALL,
        witnessUtxo: utxo.prevout,
      });
      const scriptHex = utxo.prevout.script;
      const { privateKey } = this._deriveBlindingKey(scriptHex);
      this.inputBlindingKeys[scriptHex.toString('hex')] = privateKey;
    }

    // Outputs
    // add the receiving output
    const receivingScript = address.toOutputScript(addressForSwapOutput, this.network);
    const updaterOutReceive: UpdaterOutput = {
      asset: assetToReceive,
      amount: amountToReceive,
      script: receivingScript,
    };
    if (address.isConfidential(addressForSwapOutput)) {
      updaterOutReceive.blinderIndex = 0;
      updaterOutReceive.blindingPublicKey = address.fromConfidential(addressForSwapOutput).blindingKey;
      const { privateKey } = this._deriveBlindingKey(receivingScript);
      this.outputBlindingKeys[receivingScript.toString('hex')] = privateKey;
    }
    outs.push(updaterOutReceive);
    // add the changes outputs
    if (changeOutputs.length > 0) {
      const changeScript = address.toOutputScript(addressForChangeOutput, this.network);
      for (const { asset, amount } of changeOutputs) {
        const updaterOutChange: UpdaterOutput = {
          asset: asset,
          amount: amount,
          script: changeScript,
        };
        if (address.isConfidential(addressForSwapOutput)) {
          updaterOutChange.blinderIndex = 0;
          updaterOutChange.blindingPublicKey = address.fromConfidential(addressForSwapOutput).blindingKey;
          const { privateKey } = this._deriveBlindingKey(changeScript);
          this.outputBlindingKeys[changeScript.toString('hex')] = privateKey;
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
