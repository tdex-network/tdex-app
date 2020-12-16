import { all } from 'redux-saga/effects';

import { walletWatcherSaga } from './sagas/walletSaga';
import { transactionsWatcherSaga } from './sagas/transactionsSaga';
import { appWatcherSaga } from './sagas/appSaga';
export default function* rootSaga() {
  // yield all([walletWatcherSaga()]);
  yield all([walletWatcherSaga(), transactionsWatcherSaga(), appWatcherSaga()]);
}
