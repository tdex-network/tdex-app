import { all } from 'redux-saga/effects';

import { walletWatcherSaga } from './sagas/walletSaga';
export default function* rootSaga() {
  yield all([walletWatcherSaga()]);
}
