import { combineReducers } from 'redux';
import walletReducer from './reducers/walletReducer';
import assetsReducer from './reducers/assetsReducer';
import ratesReducer from './reducers/ratesReducer';
import searchReducer from './reducers/exchange/searchReducer';
import tradeReducer from './reducers/exchange/tradeReducer';
import providerReducer from './reducers/exchange/providerReducer';
import settingsReducer from './reducers/settingsReducer';
import transactionsReducer from './reducers/transactionsReducer';
import appReducer from './reducers/appReducer';
import toastReducer from './reducers/toastReducer';

const rootReducer = combineReducers({
  app: appReducer,
  wallet: walletReducer,
  assets: assetsReducer,
  rates: ratesReducer,
  exchange: combineReducers({
    search: searchReducer,
    trade: tradeReducer,
    provider: providerReducer,
  }),
  settings: settingsReducer,
  transactions: transactionsReducer,
  toasts: toastReducer,
});

export default rootReducer;
