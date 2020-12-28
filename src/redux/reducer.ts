import { combineReducers } from 'redux';
import walletReducer from './reducers/walletReducer';
import ratesReducer from './reducers/ratesReducer';
import searchReducer from './reducers/exchange/searchReducer';
import tradeReducer from './reducers/exchange/tradeReducer';
import providerReducer from './reducers/exchange/providerReducer';
import settingsReducer from './reducers/settingsReducer';
import transactionsReducer from './reducers/transactionsReducer';
import appReducer from './reducers/appReducer';

const rootReducer = combineReducers({
  app: appReducer,
  wallet: walletReducer,
  rates: ratesReducer,
  exchange: combineReducers({
    search: searchReducer,
    trade: tradeReducer,
    provider: providerReducer,
  }),
  settings: settingsReducer,
  transactions: transactionsReducer,
});

export default rootReducer;
