import { combineReducers } from 'redux';

import type { ActionType } from '../utils/types';

import { RESET_ALL } from './actions/rootActions';
import appReducer from './reducers/appReducer';
import assetsReducer from './reducers/assetsReducer';
import ratesReducer from './reducers/ratesReducer';
import settingsReducer from './reducers/settingsReducer';
import TDEXReducer from './reducers/tdexReducer';
import toastReducer from './reducers/toastReducer';
import transactionsReducer from './reducers/transactionsReducer';
import walletReducer from './reducers/walletReducer';

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

const rootReducer = (state: any, action: ActionType): any => {
  if (action.type === RESET_ALL) {
    // eslint-disable-next-line no-param-reassign
    state = undefined;
  }
  return combinedReducers(state, action);
};

export default rootReducer;
