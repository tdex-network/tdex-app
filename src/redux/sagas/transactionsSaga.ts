/* eslint-disable no-shadow */
import { takeLatest, call, put, all, select } from 'redux-saga/effects';
import {
  fetchAndUnblindTxs,
  fetchTxHex,
  fetchUtxos,
  Wallet,
  walletFromAddresses,
  AddressInterface,
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
import {
  broadcastTx,
  signTx,
  getIdentity,
} from '../../redux/services/walletService';
import {
  formatPriceString,
  fromSatoshiFixed,
  toSatoshi,
} from '../../utils/helpers';
import moment from 'moment';
import { TxStatusEnum, TxTypeEnum } from '../../utils/types';
import { setAddresses } from '../actions/walletActions';
import { Assets, defaultFee } from '../../utils/constants';
import { storageAddresses } from '../../utils/storage-helper';
import { network } from '../config';

function* getTransactionsSaga({
  type,
  payload: addresses,
}: {
  type: string;
  payload: AddressInterface[];
}) {
  try {
    const blindingPrivateKeys = addresses.map(
      (item: AddressInterface) => item.blindingPrivateKey
    );
    const explorerUrl = yield select(
      (state: any) => state.settings.explorerUrl
    );
    const data = yield all(
      addresses.map((a) =>
        call(
          fetchAndUnblindTxs,
          a.confidentialAddress,
          blindingPrivateKeys,
          explorerUrl
        )
      )
    );
    const flattenData = data.flat();
    yield put(setTransactions(transactionsTransformer(flattenData)));
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
    const { assets, transactions, explorerUrl, addresses } = yield select(
      (state: any) => ({
        assets: state.wallet.assets,
        transactions: state.transactions.data,
        explorerUrl: state.settings.explorerUrl,
        addresses: state.wallet.addresses,
      })
    );

    const identity = yield call(getIdentity);

    yield put(setWithdrawalLoading(true));
    const senderWallet = walletFromAddresses(addresses, network.chain);
    const nextChangeAddress = identity.getNextChangeAddress();
    const newAddresses = [...addresses, nextChangeAddress];
    yield call(storageAddresses, newAddresses);
    yield put(setAddresses(newAddresses));
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
    const unsignedTx = senderWallet.buildTx(
      tx, // empty transaction
      utxos, // enriched unspents
      address, // recipient confidential address
      toSatoshi(amount, asset.precision), // amount to be sent
      asset.asset_id, // nigiri regtest LBTC asset hash
      nextChangeAddress.confidentialAddress // change address we own
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
    const broadcasted = yield call(broadcastTx, txHex, explorerUrl);
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
    console.log(e);
    yield put(setWithdrawalLoading(null));
    // yield put(setWithdrawalLoading(false));
  }
}

export function* transactionsWatcherSaga() {
  yield takeLatest(GET_TRANSACTIONS, getTransactionsSaga);
  yield takeLatest(DO_WITHDRAW, doWithdrawSaga);
}
