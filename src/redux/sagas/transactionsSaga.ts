import { UnblindTxsRequestParams } from '../actionTypes/transactionsActionTypes';
import { takeLatest, call, put } from 'redux-saga/effects';
import { fetchAndUnblindTxs } from 'tdex-sdk';
import {
  GET_TRANSACTIONS,
  setTransactions,
} from '../actions/transactionsActions';
import { transactionsTransformer } from '../transformers/transactionsTransformer';

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
  } catch (e) {
    console.log(e);
  }
}

export function* transactionsWatcherSaga() {
  yield takeLatest(GET_TRANSACTIONS, getTransactionsSaga);
}
