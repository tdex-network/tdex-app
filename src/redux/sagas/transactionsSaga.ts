/* eslint-disable no-shadow */
import { UnblindTxsRequestParams } from '../actionTypes/transactionsActionTypes';
import { takeLatest, call, put, all, select } from 'redux-saga/effects';
import {
  fetchAndUnblindTxs,
  fetchTxHex,
  fetchUtxos,
  Wallet,
  walletFromAddresses,
} from 'tdex-sdk';
import {
  DO_WITHDRAW,
  GET_TRANSACTIONS,
  setTransactions,
  setTransactionsLoading,
  setWithdrawalDetails,
  setWithdrawalLoading,
} from '../actions/transactionsActions';
import { transactionsTransformer } from '../transformers/transactionsTransformer';
import { confidential, Transaction } from 'liquidjs-lib';
import { broadcastTx, explorerUrl, signTx } from '../services/walletService';
import {
  formatPriceString,
  fromSatoshiFixed,
  toSatoshi,
} from '../../utils/helpers';
import moment from 'moment';
import { TxStatusEnum, TxTypeEnum } from '../../utils/types';
import { setAssets } from '../actions/walletActions';
import { Assets, defaultFee } from '../../utils/constants';

function* getTransactionsSaga({
  type,
  payload,
}: {
  type: string;
  payload: UnblindTxsRequestParams;
}) {
  const { confidentialAddress, privateBlindingKey, explorerUrl } = payload;
  try {
    const data = yield call(
      fetchAndUnblindTxs,
      confidentialAddress,
      privateBlindingKey,
      explorerUrl
    );
    yield put(setTransactions(transactionsTransformer(data)));
    yield put(setTransactionsLoading(false));
  } catch (e) {
    console.log(e);
  }
}

function* doWithdrawSaga({
  type,
  payload: { address, amount, asset },
}: {
  type: string;
  payload: { address: string; amount: number; asset: any };
}) {
  try {
    const { identity, assets, transactions } = yield select((state: any) => ({
      identity: state.wallet.identity,
      address: state.wallet.address,
      assets: state.wallet.assets,
      transactions: state.transactions.data,
    }));
    yield put(setWithdrawalLoading(true));
    const nextAddress = identity.getNextAddress().confidentialAddress;
    identity.getNextChangeAddress().confidentialAddress;
    const senderWallet = walletFromAddresses(
      identity.getAddresses(),
      'regtest'
    );

    // then we fetch all utxos
    const arrayOfArrayOfUtxos = yield all(
      senderWallet.addresses.map((a) =>
        call(fetchUtxos, a.confidentialAddress, explorerUrl)
      )
    );
    // Flat them
    const utxos = arrayOfArrayOfUtxos.flat();

    // lets enrich them with confidential proofs using the prevout tx hexes
    const txHexes = yield all(
      utxos.map((utxo: any) => call(fetchTxHex, utxo.txid, explorerUrl))
    );
    const outputs = txHexes.map(
      (hex: any, index: number) =>
        Transaction.fromHex(hex).outs[utxos[index].vout]
    );
    utxos.forEach((utxo: any, index: number) => {
      utxo.prevout = outputs[index];
    });

    const tx = senderWallet.createTx();
    const changeAddress = identity.getNextChangeAddress().confidentialAddress;
    const unsignedTx = senderWallet.buildTx(
      tx, // empty transaction
      utxos, // enriched unspents
      address, // recipient confidential address
      toSatoshi(amount, asset.precision), // amount to be sent
      asset.asset_id, // nigiri regtest LBTC asset hash
      nextAddress // change address we own
    );

    // Now we can sign with identity abstraction
    const signedTx = yield call(signTx, identity, unsignedTx);

    // Finalize and extract tx to be a hex encoeded string ready for broadcast
    const txHex = Wallet.toHex(signedTx);
    const feeObj = Transaction.fromHex(txHex).outs.find((currentOutput: any) =>
      currentOutput.script.equals(Buffer.alloc(0))
    );
    const fee = feeObj
      ? confidential.confidentialValueToSatoshi(feeObj.value)
      : defaultFee;
    const broadcasted = yield call(broadcastTx, txHex);
    const amountInSatoshis = toSatoshi(amount, asset.precision);
    const withdrawTx = {
      txId: broadcasted,
      time: moment().format('DD MMM YYYY hh:mm:ss'),
      date: moment().format('DD MMM YYYY'),
      status: TxStatusEnum.Confirmed,
      type: TxTypeEnum.Withdraw,
      asset: asset.asset_id,
      amount: amountInSatoshis,
      amountDisplay: amount,
      amountDisplayFormatted: formatPriceString(amount),
      fee: fromSatoshiFixed(fee, asset.precision, 5),
      open: false,
      sign: '-',
    };
    const newAssets = assets.map((assetItem: any) => {
      if (asset.asset_id === assetItem.asset_id) {
        return {
          ...assetItem,
          amount: assetItem.amount - amountInSatoshis,
          amountDisplay: fromSatoshiFixed(
            assetItem.amount - amountInSatoshis,
            assetItem.precision
          ),
          amountDisplayFormatted: formatPriceString(
            fromSatoshiFixed(
              assetItem.amount - amountInSatoshis,
              assetItem.precision
            )
          ),
        };
      } else if (Assets.lbtcRegtest.assetHash === assetItem.asset_id) {
        return {
          ...assetItem,
          amount: assetItem.amount - fee,
          amountDisplay: fromSatoshiFixed(
            assetItem.amount - fee,
            assetItem.precision
          ),
          amountDisplayFormatted: formatPriceString(
            fromSatoshiFixed(assetItem.amount - fee, assetItem.precision)
          ),
        };
      }
      return assetItem;
    });
    const newTransactions = {
      ...transactions,
      [asset.asset_id]: [withdrawTx, ...transactions[asset.asset_id]],
    };
    yield put(setAssets(newAssets));
    yield put(setTransactions(newTransactions));
    yield put(
      setWithdrawalDetails({
        ...withdrawTx,
        status: TxStatusEnum.Pending,
        recipientAddress: address,
      })
    );
    yield put(setWithdrawalLoading(false));
  } catch (e) {
    // yield put(setWithdrawalLoading(false));
    yield put(setWithdrawalLoading(null));
    console.log(e);
  }
}

export function* transactionsWatcherSaga() {
  yield takeLatest(GET_TRANSACTIONS, getTransactionsSaga);
  yield takeLatest(DO_WITHDRAW, doWithdrawSaga);
}
