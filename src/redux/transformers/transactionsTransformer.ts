import { TxInterface } from 'ldk';
import {
  formatPriceString,
  fromSatoshiFixed,
  getDataFromTx,
  groupBy,
} from '../../utils/helpers';
import { defaultPrecision } from '../../utils/constants';
import {
  TxDisplayInterface,
  TxsByAssetsInterface,
  TxStatusEnum,
} from '../../utils/types';
import moment from 'moment';

export const transactionsTransformer = (txs: TxInterface[] | undefined) => {
  const txArray = txs?.map(
    (tx: TxInterface): TxDisplayInterface => {
      const {
        asset = '',
        type = 0,
        amount = 0,
        sign = '',
        address = '',
      } = getDataFromTx(tx.vin, tx.vout);
      return {
        txId: tx.txid,
        time: moment(tx.status.blockTime).format('DD MMM YYYY hh:mm:ss'),
        date: moment(tx.status.blockTime).format('DD MMM YYYY'),
        status: tx.status.confirmed
          ? TxStatusEnum.Confirmed
          : TxStatusEnum.Pending,
        type,
        asset,
        amount,
        address,
        amountDisplay: fromSatoshiFixed(amount, defaultPrecision),
        amountDisplayFormatted: formatPriceString(
          fromSatoshiFixed(amount, defaultPrecision)
        ),
        fee: fromSatoshiFixed(tx.fee, defaultPrecision, 5),
        open: false,
        sign,
      };
    }
  );
  if (!txArray) return {};
  return groupBy(txArray, 'asset');
};
