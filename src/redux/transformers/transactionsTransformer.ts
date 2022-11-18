import type { TxInterface, networks } from 'ldk';
import { isUnblindedOutput, getNetwork } from 'ldk';
import moment from 'moment';
import type { NetworkString, UnblindedOutput } from 'tdex-sdk';
import { getAsset, getSats, isConfidentialOutput } from 'tdex-sdk';

import type { Transfer, TxDisplayInterface } from '../../utils/types';
import { TxStatusEnum, TxTypeEnum } from '../../utils/types';

/**
 * Take two vectors: vin and vout representing a transaction
 * then, using the whole list of a wallet's script, we return a set of Transfers
 * @param vin
 * @param vout
 * @param walletScripts
 * @param network
 */
function getTransfers(
  vin: TxInterface['vin'],
  vout: TxInterface['vout'],
  walletScripts: string[],
  network: networks.Network
): Transfer[] {
  const transfers: Transfer[] = [];

  const addToTransfers = (amount: number, asset: string, script: string) => {
    const transferIndex = transfers.findIndex((t) => t.asset === asset);
    if (transferIndex >= 0) {
      transfers[transferIndex].amount += amount;
      return;
    }
    transfers.push({
      amount,
      asset,
      script,
    });
  };

  for (const input of vin) {
    if (input.isPegin) continue;
    if (!input.prevout) throw new Error('malformed tx interface (missing prevout)');
    if (!walletScripts.includes(input.prevout.prevout.script.toString('hex'))) continue;
    if (isConfidentialOutput(input.prevout.prevout) && !isUnblindedOutput(input.prevout)) {
      throw new Error(
        `prevout ${input.prevout.txid}:${input.prevout.vout} is not unblinded but is a confidential output, amount displayed may be wrong`
      );
    }
    addToTransfers(-1 * getSats(input.prevout), getAsset(input.prevout), input.prevout.prevout.script.toString('hex'));
  }

  let feeAmount = 0;
  let feeAsset = network.assetHash;

  for (const output of vout) {
    if (output.prevout.script.length === 0) {
      // handle the fee output
      feeAmount = getSats(output);
      feeAsset = getAsset(output);
      continue;
    }
    if (!walletScripts.includes(output.prevout.script.toString('hex'))) continue;
    if (isConfidentialOutput(output.prevout) && !isUnblindedOutput(output))
      throw new Error(`prevout ${output.txid}:${output.vout} is not unblinded but is a confidential output`);
    addToTransfers(getSats(output), getAsset(output), output.prevout.script.toString('hex'));
  }

  return transfers.filter((t, index, rest) => {
    if (t.asset === feeAsset && Math.abs(t.amount) === feeAmount) {
      if (rest.length === 1) {
        transfers[index].amount = 0;
        return true;
      }
      return false;
    }
    return true;
  });
}

export function txTypeFromTransfer(transfers: Transfer[]): TxTypeEnum {
  if (transfers.length === 1) {
    if (transfers[0].amount > 0) {
      return TxTypeEnum.Receive;
    }
    if (transfers[0].amount < 0) {
      return TxTypeEnum.Send;
    }
  }
  if (transfers.length >= 2) {
    return TxTypeEnum.Swap;
  }
  return TxTypeEnum.Unknown;
}

/**
 * Convert a TxInterface to DisplayInterface
 * @param tx txInterface
 * @param walletScripts the wallet's scripts i.e wallet scripts from wallet's addresses.
 * @param network
 */
export function toDisplayTransaction(
  tx: TxInterface,
  walletScripts: string[],
  network: NetworkString
): TxDisplayInterface {
  const transfers = getTransfers(tx.vin, tx.vout as UnblindedOutput[], walletScripts, getNetwork(network));
  return {
    txId: tx.txid,
    blockTime: tx.status.blockTime ? moment(tx.status.blockTime * 1000) : undefined,
    status: tx.status.confirmed ? TxStatusEnum.Confirmed : TxStatusEnum.Pending,
    fee: tx.fee,
    transfers,
    type: txTypeFromTransfer(transfers),
  };
}
