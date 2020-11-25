import { combineReducers } from 'redux';
import walletReducer from './reducers/walletReducer';
import settingsReduccer from './reducers/settingsReducer';

const rootReducer = combineReducers({
  wallet: walletReducer,
  settings: settingsReduccer,
});

export default rootReducer;
