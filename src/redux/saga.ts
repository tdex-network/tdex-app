import { all } from 'redux-saga/effects';
import { walletWatcherSaga } from './sagas/walletSaga';
import { ratesWatcherSaga } from './sagas/ratesSaga';
import { transactionsWatcherSaga } from './sagas/transactionsSaga';
import { settingsWatcherSaga } from './sagas/settingsSaga';
import { appWatcherSaga } from './sagas/appSaga';
import { tdexWatcherSaga } from './sagas/tdexSaga';

export default function* rootSaga() {
  yield all([
    walletWatcherSaga(),
    ratesWatcherSaga(),
    transactionsWatcherSaga(),
    settingsWatcherSaga(),
    appWatcherSaga(),
    tdexWatcherSaga(),
  ]);
}
