import { combineReducers } from 'redux';
import walletReducer from './reducers/walletReducer';
import settingsReducer from './reducers/settingsReducer';
import transactionsReducer from './reducers/transactionsReducer';
import appReducer from './reducers/appReducer';

const rootReducer = combineReducers({
  app: appReducer,
  wallet: walletReducer,
  settings: settingsReducer,
  transactions: transactionsReducer,
});

export default rootReducer;
