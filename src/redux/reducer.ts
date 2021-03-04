import { combineReducers } from 'redux';
import walletReducer from './reducers/walletReducer';
import assetsReducer from './reducers/assetsReducer';
import ratesReducer from './reducers/ratesReducer';
import TDEXReducer from './reducers/tdexReducer';
import settingsReducer from './reducers/settingsReducer';
import transactionsReducer from './reducers/transactionsReducer';
import appReducer from './reducers/appReducer';
import toastReducer from './reducers/toastReducer';

const rootReducer = combineReducers({
  app: appReducer,
  wallet: walletReducer,
  assets: assetsReducer,
  rates: ratesReducer,
  tdex: TDEXReducer,
  settings: settingsReducer,
  transactions: transactionsReducer,
  toasts: toastReducer,
});

export default rootReducer;
