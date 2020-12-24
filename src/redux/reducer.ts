import { combineReducers } from 'redux';
import walletReducer from './reducers/walletReducer';
import searchReducer from './reducers/exchange/searchReducer';
import tradeReducer from './reducers/exchange/tradeReducer';
import providerReducer from './reducers/exchange/providerReducer';
import settingsReduccer from './reducers/settingsReducer';
import transactionsReducer from './reducers/transactionsReducer';
import appReducer from './reducers/appReducer';

const rootReducer = combineReducers({
  app: appReducer,
  wallet: walletReducer,
  exchange: combineReducers({
    search: searchReducer,
    trade: tradeReducer,
    provider: providerReducer,
  }),
  settings: settingsReduccer,
  transactions: transactionsReducer,
});

export default rootReducer;
