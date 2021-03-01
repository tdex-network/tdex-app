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

  const addToTransfers = (
    amountToAdd: number,
    asset: string,
    isInput: boolean
  ) => {
    let amount = amountToAdd;
    if (isInput) amount = -amountToAdd;
    const transferIndex = transfers.findIndex(
      (t) => t.asset.valueOf() === asset.valueOf()
    );
    if (transferIndex >= 0) {
      transfers[transferIndex].amount += amountToAdd;
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
      addToTransfers(input.prevout.value, input.prevout.asset, true);
    }
  }

  for (const output of vout) {
    if (
      !isBlindedOutputInterface(output) &&
      walletScripts.includes(output.script) &&
      output.script !== ''
    ) {
      addToTransfers(output.value, output.asset, false);
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

  return TxTypeEnum.Swap;
}

/**
 * Convert a TxInterface to DisplayInterface
 * @param tx
 * @param walletScripts the wallet's scripts i.e wallet scripts from wallet's addresses.
 */
export function toDisplayTransaction(
  tx: TxInterface,
  walletScripts: string[]
): TxDisplayInterface {
  const transfers = getTransfers(tx.vin, tx.vout, walletScripts);
  return {
    txId: tx.txid,
    time: moment(tx.status.blockTime).format('DD MMM YYYY hh:mm:ss'),
    date: moment(tx.status.blockTime).format('DD MMM YYYY'),
    status: tx.status.confirmed ? TxStatusEnum.Confirmed : TxStatusEnum.Pending,
    fee: tx.fee,
    transfers,
    type: txTypeFromTransfer(transfers),
  };
}
