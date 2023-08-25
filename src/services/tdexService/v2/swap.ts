import secp256k1 from '@vulpemventures/secp256k1-zkp';
import type { OwnedInput, TxOutput, PsetInput, Pset } from 'liquidjs-lib';
import { confidential, ElementsValue, Transaction } from 'liquidjs-lib';
import { Confidential, confidentialValueToSatoshi } from 'liquidjs-lib/src/confidential';

import * as swapMessages from '../../../api-spec/protobuf/gen/js/tdex/v2/swap_pb';
import type { UnblindedInput } from '../../../api-spec/protobuf/gen/js/tdex/v2/types_pb';
import { isConfidentialOutput, makeid } from '../../../utils/helpers';
import { decodePset } from '../../../utils/transaction';

import Core from './core';

type BlindKeysMap = Record<string, Buffer>;

interface requestOpts {
  assetToBeSent: string;
  amountToBeSent: number;
  assetToReceive: string;
  amountToReceive: number;
  psetBase64: string;
  inputBlindingKeys?: BlindKeysMap;
  outputBlindingKeys?: BlindKeysMap;
  unblindedInputs?: UnblindedInput[];
}

interface acceptOpts {
  message: Uint8Array;
  psetBase64: string;
  inputBlindingKeys?: BlindKeysMap;
  outputBlindingKeys?: BlindKeysMap;
  unblindedInputs?: OwnedInput[];
}

/**
 * The Swap class implements the Swap TDEX protocol i.e swap.request, swap.accept and swap.complete.
 * @see https://github.com/TDex-network/tdex-specs/blob/master/03-swap-protocol.md
 */
export class Swap extends Core {
  static parse = parse;

  /**
   * Create and serialize a SwapRequest Message.
   * @param amountToBeSent the amount of asset to be sent.
   * @param assetToBeSent the asset to be sent.
   * @param amountToReceive the amount of asset to receive.
   * @param assetToReceive the asset to receive.
   * @param psetBase64 the pset base64 string.
   * @param inputBlindingKeys the input blinding keys.
   * @param outputBlindingKeys the output blinding keys.
   * @param unblindedInputs
   */
  async request({
    amountToBeSent,
    assetToBeSent,
    amountToReceive,
    assetToReceive,
    psetBase64,
    inputBlindingKeys,
    outputBlindingKeys,
    unblindedInputs,
  }: requestOpts): Promise<Uint8Array> {
    const msg = swapMessages.SwapRequest.create({
      id: makeid(8),
      amountP: String(amountToBeSent),
      assetP: assetToBeSent,
      amountR: String(amountToReceive),
      assetR: assetToReceive,
      transaction: psetBase64,
      unblindedInputs: unblindedInputs,
    });
    // check the message content and transaction.
    await compareMessagesAndTransaction(msg);
    if (this.verbose) console.log(swapMessages.SwapRequest.toJsonString(msg));
    return swapMessages.SwapRequest.toBinary(msg);
  }

  /**
   * Create and serialize an accept message.
   */
  async accept({
    message,
    psetBase64,
    inputBlindingKeys,
    outputBlindingKeys,
    unblindedInputs,
  }: acceptOpts): Promise<Uint8Array> {
    const msgRequest = swapMessages.SwapRequest.fromBinary(message);
    const msgAccept = swapMessages.SwapAccept.create({
      id: makeid(8),
      requestId: msgRequest.id,
      transaction: psetBase64,
    });
    // set the unblinded inputs
    msgAccept.unblindedInputs =
      unblindedInputs?.map((input) => {
        return {
          index: input.index,
          asset: input.asset.toString('hex'),
          assetBlinder: input.assetBlindingFactor.toString('hex'),
          amount: input.value,
          amountBlinder: input.valueBlindingFactor.toString('hex'),
        };
      }) ?? [];
    // compare messages and transaction data
    await compareMessagesAndTransaction(msgRequest, msgAccept);
    if (this.verbose) console.log(swapMessages.SwapAccept.toJsonString(msgAccept));
    // serialize the SwapAccept message.
    return swapMessages.SwapAccept.toBinary(msgAccept);
  }

  /**
   * create and serialize a SwapComplete message.
   * @param args contains the SwapAccept message + the base64 encoded transaction.
   */
  complete({ message, psetBase64OrHex }: { message: Uint8Array; psetBase64OrHex: string }): Uint8Array {
    const msgAccept = swapMessages.SwapAccept.fromBinary(message);
    //Build SwapComplete
    const msgComplete = swapMessages.SwapComplete.create({
      id: makeid(8),
      acceptId: msgAccept.id,
      transaction: psetBase64OrHex,
    });
    if (this.verbose) console.log(swapMessages.SwapAccept.toJsonString(msgAccept));
    return swapMessages.SwapComplete.toBinary(msgComplete);
  }
}

/**
 * Take a swap messages and check if the message's data is corresponding to the  msg's transaction.
 * @param msgRequest the swap request message.
 * @param msgAccept the swap accept message.
 */
async function compareMessagesAndTransaction(
  msgRequest: swapMessages.SwapRequest,
  msgAccept?: swapMessages.SwapAccept
): Promise<void> {
  const decodedFromRequest = decodePset(msgRequest.transaction);
  decodedFromRequest.inputs.forEach((i: PsetInput, inputIndex: number) => {
    if (!i.witnessUtxo && i.nonWitnessUtxo) {
      const vout: number = decodedFromRequest.unsignedTx().ins[inputIndex].index;
      i.witnessUtxo = Transaction.fromHex(i.nonWitnessUtxo.toHex()).outs[vout];
    }
  });
  const totalP = await countUtxos(decodedFromRequest, msgRequest.assetP, msgRequest.unblindedInputs);
  if (totalP < Number(msgRequest.amountP)) {
    throw new Error('Cumulative utxos count is not enough to cover SwapRequest.amount_p');
  }
  // check if the output if found in the transaction
  const outputRFound: boolean = await outputFoundInTransaction(
    decodedFromRequest.unsignedTx().outs,
    Number(msgRequest.amountR),
    msgRequest.assetR
  );
  if (!outputRFound)
    throw new Error(
      `Either SwapRequest.amount_r or SwapRequest.asset_r do not match the provided psbt (amount: ${msgRequest.amountR.toString()}, asset: ${
        msgRequest.assetR
      })`
    );

  // msg accept
  if (msgAccept) {
    // decode the tx and check the msg's ids
    const decodedFromAccept = decodePset(msgAccept.transaction);
    if (msgRequest.id !== msgAccept.requestId)
      throw new Error('SwapRequest.id and SwapAccept.request_id are not the same');
    // check the amount of utxos.
    const totalR = await countUtxos(decodedFromAccept, msgRequest.assetR, []);
    if (totalR < Number(msgRequest.amountR)) {
      throw new Error('Cumulative utxos count is not enough to cover SwapRequest.amount_r');
    }
    // check if there is an output found in the transaction.
    const outputPFound = outputFoundInTransaction(
      decodedFromAccept.unsignedTx().outs,
      Number(msgRequest.amountP),
      msgRequest.assetP
    );
    if (!outputPFound)
      throw new Error(
        `Either SwapRequest.amount_p or SwapRequest.asset_p do not match the provided psbt amount=${msgRequest.amountP} asset=${msgRequest.assetP}`
      );
  }
}

/**
 * find an output in outputs corresponding to value and asset. Provide outputBlindKeys if output are blinded.
 * @param outputs the outputs to search in.
 * @param value value of the output.
 * @param asset hex encoded asset of the output.
 * @param outputBlindKeys optional, only if blinded outputs. Blinding keys map (scriptPukKey -> blindingKey).
 */
async function outputFoundInTransaction(
  outputs: TxOutput[],
  value: number,
  asset: string,
  outputBlindKeys: BlindKeysMap = {}
): Promise<boolean> {
  return outputs.some(async (o: TxOutput) => {
    // unblind first if confidential ouput
    const isConfidential = isConfidentialOutput(o);
    if (isConfidential) {
      const blindKey: Buffer = outputBlindKeys[o.script.toString('hex')];
      // if no blinding keys for the confidential ouput --> return false
      if (blindKey === undefined) throw new Error(`no blind key for ${o.script.toString('hex')}`);
      try {
        const zkplib = await secp256k1();
        const confidential = new Confidential(zkplib);
        const { value: unblindValue, asset: unblindAsset } = await confidential.unblindOutputWithKey(o, blindKey);
        // check unblind value and unblind asset
        return parseInt(unblindValue, 10) === value && unblindAsset.slice(1).reverse().toString('hex') === asset;
      } catch (_) {
        // if unblind fail --> return false
        return false;
      }
    }
    // check value and asset
    const assetBuffer: Buffer = Buffer.from(asset, 'hex').reverse();
    const isAsset: boolean = assetBuffer.equals(o.asset.slice(1));
    const isValue: boolean = confidential.confidentialValueToSatoshi(o.value) === value;
    return isAsset && isValue;
  });
}

/**
 * Returns the sum of the values of the given inputs' utxos.
 * @param pset the pset to count inputs values.
 * @param asset the asset to fetch value.
 * @param unblindedInputs
 */
async function countUtxos(pset: Pset, asset: string, unblindedInputs: UnblindedInput[]): Promise<number> {
  const assetBuffer: Buffer = Buffer.from(asset, 'hex');
  const filteredByWitness = pset.inputs.filter((i) => i.witnessUtxo !== null);

  // unblind confidential prevouts
  const unblindedUtxos = await Promise.all(
    filteredByWitness.map(async (input, index) => {
      const utxo = input.getUtxo();
      if (utxo && ElementsValue.fromBytes(utxo.value).isConfidential) {
        return {
          asset: Buffer.from(unblindedInputs[index].asset, 'hex'),
          value: unblindedInputs[index].amount,
        };
      }
      return {
        asset: input.witnessUtxo!.asset,
        value: input.witnessUtxo!.value,
      };
    })
  );

  // filter inputs by asset and return the count
  const filteredByAsset = unblindedUtxos.filter(({ asset }) =>
    assetBuffer.equals(asset.length === 33 ? asset.slice(1) : asset)
  );
  const queryValues = filteredByAsset.map(({ value }) => {
    return value instanceof Buffer ? confidentialValueToSatoshi(value) : parseInt(value, 10);
  });

  // apply reducer to values (add the values)
  return queryValues.reduce((a: number, b: number) => a + b, 0);
}

function parse({ message, type }: { message: Uint8Array; type: string }): string {
  let msg: any;
  try {
    msg = (swapMessages as any)[type].deserializeBinary(message);
  } catch (e) {
    throw new Error(`Not valid message of expected type ${type}`);
  }

  return JSON.stringify(msg.toObject(), undefined, 2);
}

/**
 * Convert jspb's obj type to BlindKeysMap.
 * @param obj
 */
export function blindKeysMap(obj: Record<string, Uint8Array>): BlindKeysMap | undefined {
  const map: BlindKeysMap = {};
  Object.entries(obj).forEach(([k, v]) => {
    map[k] = Buffer.from(v);
  });
  return map;
}
