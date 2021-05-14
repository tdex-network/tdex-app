import { combineReducers } from 'redux';
import walletReducer from './reducers/walletReducer';
import assetsReducer from './reducers/assetsReducer';
import ratesReducer from './reducers/ratesReducer';
import TDEXReducer from './reducers/tdexReducer';
import settingsReducer from './reducers/settingsReducer';
import transactionsReducer from './reducers/transactionsReducer';
import appReducer from './reducers/appReducer';
import toastReducer from './reducers/toastReducer';
import { ActionType } from '../utils/types';
import { RESET_ALL } from './actions/rootActions';

const combinedReducers = combineReducers({
  app: appReducer,
  wallet: walletReducer,
  assets: assetsReducer,
  rates: ratesReducer,
  tdex: TDEXReducer,
  settings: settingsReducer,
  transactions: transactionsReducer,
  toasts: toastReducer,
});

const rootReducer = (state: any, action: ActionType) => {
  if (action.type === RESET_ALL) {
    // eslint-disable-next-line no-param-reassign
    state = undefined;
  }
  return combinedReducers(state, action);
};

export default rootReducer;
