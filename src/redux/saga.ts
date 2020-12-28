import { all } from 'redux-saga/effects';
import { walletWatcherSaga } from './sagas/walletSaga';
import { assetsWatcherSaga } from './sagas/assetsSaga';
import { ratesWatcherSaga } from './sagas/ratesSaga';
import { providerWatcherSaga } from './sagas/exchange/providerSaga';
import { tradeWatcherSaga } from './sagas/exchange/tradeSaga';
import { searchWatcherSaga } from './sagas/exchange/searchSaga';
import { transactionsWatcherSaga } from './sagas/transactionsSaga';
import { appWatcherSaga } from './sagas/appSaga';

export default function* rootSaga() {
  yield all([
    walletWatcherSaga(),
    assetsWatcherSaga(),
    ratesWatcherSaga(),
    providerWatcherSaga(),
    tradeWatcherSaga(),
    searchWatcherSaga(),
    transactionsWatcherSaga(),
    appWatcherSaga(),
  ]);
}