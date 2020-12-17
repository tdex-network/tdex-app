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
} from '../actions/transactionsActions';
import { transactionsTransformer } from '../transformers/transactionsTransformer';
import { Transaction } from 'liquidjs-lib';
import { explorerUrl } from '../services/walletService';
import { toSatoshi } from '../../utils/helpers';

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
    const { identity, address: walletAddress } = yield select((state: any) => ({
      identity: state.wallet.identity,
      address: state.wallet.address,
    }));
    identity.getNextAddress().confidentialAddress;
    identity.getNextChangeAddress().confidentialAddress;
    const senderWallet = walletFromAddresses(
      identity.getAddresses(),
      'regtest'
    );
    console.log(senderWallet);
    console.log(identity.getAddresses());

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

    console.log('utxos');
    console.log(utxos);
    console.log('Creating and blinding transaction...');
    const tx = senderWallet.createTx();
    const changeAddress = identity.getNextChangeAddress().confidentialAddress;
    console.log(changeAddress);
    const unsignedTx = senderWallet.buildTx(
      tx, // empty transaction
      utxos, // enriched unspents
      address, // recipient confidential address
      toSatoshi(amount, asset.precision), // amount to be sent
      asset.asset_id, // nigiri regtest LBTC asset hash
      changeAddress // change address we own
    );
    console.log(unsignedTx);

    // Now we can sign with identity abstraction
    const signedTx = yield call(identity.signPset, unsignedTx);
    console.log(signedTx);

    // Finalize and extract tx to be a hex encoeded string ready for broadcast
    const txHex = Wallet.toHex(signedTx);
    console.log(txHex);
  } catch (e) {
    console.log(e);
  }
}

export function* transactionsWatcherSaga() {
  yield takeLatest(GET_TRANSACTIONS, getTransactionsSaga);
  yield takeLatest(DO_WITHDRAW, doWithdrawSaga);
}
