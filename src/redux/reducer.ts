import { combineReducers } from 'redux';
import walletReducer from './reducers/walletReducer';
import settingsReduccer from './reducers/settingsReducer';
import transactionsReducer from './reducers/transactionsReducer';

const rootReducer = combineReducers({
  wallet: walletReducer,
  settings: settingsReduccer,
  transactions: transactionsReducer,
});

export default rootReducer;
