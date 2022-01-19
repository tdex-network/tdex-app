import type { InputInterface, TxInterface } from 'ldk';
import { isUnblindedOutput } from 'ldk';
import moment from 'moment';
import type { NetworkString, UnblindedOutput } from 'tdex-sdk';
import { getAsset, getSats } from 'tdex-sdk';

import { isLbtc } from '../../utils/helpers';
import type { Transfer, TxDisplayInterface } from '../../utils/types';
import { TxStatusEnum, TxTypeEnum } from '../../utils/types';

function getTransfers(
  vin: InputInterface[],
  vout: UnblindedOutput[],
  walletScripts: string[],
  network: NetworkString
): Transfer[] {
  const transfers: Transfer[] = [];
  let feeAmount: number;
  let feeAsset: string;

  const addToTransfers = (amount: number, asset: string, script: string) => {
    const transferIndex = transfers.findIndex((t) => t.asset === asset);
    if (transferIndex >= 0) {
      const tmp = transfers[transferIndex].amount + amount;
      // Check if the transfer is a fee output. Remove it for non-LBTC withdrawal.
      if (Math.abs(tmp) === feeAmount && asset === feeAsset) {
        transfers.splice(transferIndex, 1);
        return;
      }
      // Deduct feeAmount on LBTC withdrawal
      if (feeAmount && isLbtc(asset, network) && transfers.length === 1) {
        transfers[transferIndex].amount = tmp + feeAmount;
      } else {
        transfers[transferIndex].amount = tmp;
      }
      return;
    }
    transfers.push({
      amount,
      asset,
      script,
    });
  };

  for (const input of vin) {
    if (
      input.prevout &&
      isUnblindedOutput(input.prevout) &&
      walletScripts.includes(input.prevout.prevout.script.toString('hex'))
    ) {
      addToTransfers(
        -1 * Number(getSats(input.prevout)),
        // TODO: reverse needed?
        getAsset(input.prevout),
        input.prevout.prevout.script.toString('hex')
      );
    }
  }

  // Get fee output values
  for (const output of vout) {
    if (
      isUnblindedOutput(output) &&
      output.prevout.script.toString() === '' &&
      parseInt(output.unblindData.assetBlindingFactor.toString('hex'), 16) === 0 &&
      parseInt(output.unblindData.valueBlindingFactor.toString('hex'), 16) === 0
    ) {
      feeAmount = Number(output.unblindData.value);
      feeAsset = output.unblindData.asset.slice().reverse().toString('hex');
    }
  }
  for (const output of vout) {
    if (
      isUnblindedOutput(output) &&
      walletScripts.includes(output.prevout.script.toString('hex')) &&
      output.prevout.script.toString('hex') !== ''
    ) {
      addToTransfers(
        Number(output.unblindData.value),
        output.unblindData.asset.slice().reverse().toString('hex'),
        output.prevout.script.toString('hex')
      );
    }
  }
  return transfers;
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
  const transfers = getTransfers(tx.vin, tx.vout as UnblindedOutput[], walletScripts, network);
  return {
    txId: tx.txid,
    blockTime: tx.status.blockTime ? moment(tx.status.blockTime * 1000) : undefined,
    status: tx.status.confirmed ? TxStatusEnum.Confirmed : TxStatusEnum.Pending,
    fee: tx.fee,
    transfers,
    type: txTypeFromTransfer(transfers),
  };
}
