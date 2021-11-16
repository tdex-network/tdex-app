import { combineReducers } from 'redux';

import appReducer from './reducers/appReducer';
import assetsReducer from './reducers/assetsReducer';
import btcReducer from './reducers/btcReducer';
import ratesReducer from './reducers/ratesReducer';
import settingsReducer from './reducers/settingsReducer';
import TDEXReducer from './reducers/tdexReducer';
import toastReducer from './reducers/toastReducer';
import transactionsReducer from './reducers/transactionsReducer';
import walletReducer from './reducers/walletReducer';

export default combineReducers({
  app: appReducer,
  btc: btcReducer,
  wallet: walletReducer,
  assets: assetsReducer,
  rates: ratesReducer,
  tdex: TDEXReducer,
  settings: settingsReducer,
  transactions: transactionsReducer,
  toasts: toastReducer,
});
