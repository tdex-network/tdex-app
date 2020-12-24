import { UnblindTxsRequestParams } from '../actionTypes/transactionsActionTypes';
import { takeLatest, call, put } from 'redux-saga/effects';
import { fetchAndUnblindTxs } from 'tdex-sdk';
import { network } from '../config';
import {
  GET_TRANSACTIONS,
  setTransactions,
  setTransactionsLoading,
} from '../actions/transactionsActions';
import { transactionsTransformer } from '../transformers/transactionsTransformer';

function* getTransactionsSaga({
  type,
  payload,
}: {
  type: string;
  payload: UnblindTxsRequestParams;
}) {
  const { confidentialAddress, privateBlindingKey } = payload;
  try {
    const data = yield call(
      fetchAndUnblindTxs,
      confidentialAddress,
      privateBlindingKey,
      network.explorer
    );
    yield put(setTransactions(transactionsTransformer(data)));
    yield put(setTransactionsLoading(false));
  } catch (e) {
    console.log(e);
  }
}

export function* transactionsWatcherSaga() {
  yield takeLatest(GET_TRANSACTIONS, getTransactionsSaga);
}
