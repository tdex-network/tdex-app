import { all } from 'redux-saga/effects';

import { appWatcherSaga } from './sagas/appSaga';
import { assetsWatcherSaga } from './sagas/assetsSaga';
import { ratesWatcherSaga } from './sagas/ratesSaga';
import { settingsWatcherSaga } from './sagas/settingsSaga';
import { tdexWatcherSaga } from './sagas/tdexSaga';
import { transactionsWatcherSaga } from './sagas/transactionsSaga';
import { walletWatcherSaga } from './sagas/walletSaga';

export default function* rootSaga(): Generator<any, any, any> {
  yield all([
    walletWatcherSaga(),
    ratesWatcherSaga(),
    transactionsWatcherSaga(),
    settingsWatcherSaga(),
    appWatcherSaga(),
    tdexWatcherSaga(),
    assetsWatcherSaga(),
  ]);
}
