import { all } from 'redux-saga/effects';
import { walletWatcherSaga } from './sagas/walletSaga';
import { ratesWatcherSaga } from './sagas/ratesSaga';
import { providerWatcherSaga } from './sagas/exchange/providerSaga';
import { tradeWatcherSaga } from './sagas/exchange/tradeSaga';
import { searchWatcherSaga } from './sagas/exchange/searchSaga';
import { transactionsWatcherSaga } from './sagas/transactionsSaga';
import { settingsWatcherSaga } from './sagas/settingsSaga';
import { appWatcherSaga } from './sagas/appSaga';

export default function* rootSaga() {
  yield all([
    walletWatcherSaga(),
    ratesWatcherSaga(),
    providerWatcherSaga(),
    tradeWatcherSaga(),
    searchWatcherSaga(),
    transactionsWatcherSaga(),
    settingsWatcherSaga(),
    appWatcherSaga(),
  ]);
}
