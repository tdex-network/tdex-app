import {
  BlindedOutputInterface,
  InputInterface,
  isBlindedOutputInterface,
  TxInterface,
  UnblindedOutputInterface,
} from 'ldk';
import {
  Transfer,
  TxDisplayInterface,
  TxStatusEnum,
  TxTypeEnum,
} from '../../utils/types';
import moment from 'moment';

function getTransfers(
  vin: Array<InputInterface>,
  vout: Array<BlindedOutputInterface | UnblindedOutputInterface>,
  walletScripts: string[]
): Transfer[] {
  const transfers: Transfer[] = [];

  const addToTransfers = (amount: number, asset: string) => {
    const transferIndex = transfers.findIndex(
      (t) => t.asset.valueOf() === asset.valueOf()
    );

    if (transferIndex >= 0) {
      transfers[transferIndex].amount += amount;
      return;
    }

    transfers.push({
      amount,
      asset,
    });
  };

  for (const input of vin) {
    if (
      !isBlindedOutputInterface(input.prevout) &&
      walletScripts.includes(input.prevout.script)
    ) {
      addToTransfers(-1 * input.prevout.value, input.prevout.asset);
    }
  }

  for (const output of vout) {
    if (
      !isBlindedOutputInterface(output) &&
      walletScripts.includes(output.script) &&
      output.script !== ''
    ) {
      addToTransfers(output.value, output.asset);
    }
  }

  return transfers;
}

export function txTypeFromTransfer(transfers: Transfer[]) {
  if (transfers.length === 1) {
    if (transfers[0].amount > 0) {
      return TxTypeEnum.Deposit;
    }

    if (transfers[0].amount < 0) {
      return TxTypeEnum.Withdraw;
    }
  }

  if (transfers.length >= 2) {
    return TxTypeEnum.Swap;
  }

  return TxTypeEnum.Unknow;
}

/**
 * Convert a TxInterface to DisplayInterface
 * @param tx txInterface
 * @param walletScripts the wallet's scripts i.e wallet scripts from wallet's addresses.
 */
export function toDisplayTransaction(
  tx: TxInterface,
  walletScripts: string[]
): TxDisplayInterface {
  const transfers = getTransfers(tx.vin, tx.vout, walletScripts);
  return {
    txId: tx.txid,
    blockTime: tx.status.blockTime
      ? moment(tx.status.blockTime * 1000)
      : undefined,
    status: tx.status.confirmed ? TxStatusEnum.Confirmed : TxStatusEnum.Pending,
    fee: tx.fee,
    transfers,
    type: txTypeFromTransfer(transfers),
  };
}
