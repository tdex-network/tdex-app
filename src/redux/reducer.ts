import type { Action } from 'redux';
import { combineReducers } from 'redux';

import { RESET_ALL } from './actions/rootActions';
import appReducer from './reducers/appReducer';
import assetsReducer from './reducers/assetsReducer';
import btcReducer from './reducers/btcReducer';
import ratesReducer from './reducers/ratesReducer';
import settingsReducer from './reducers/settingsReducer';
import TDEXReducer from './reducers/tdexReducer';
import toastReducer from './reducers/toastReducer';
import transactionsReducer from './reducers/transactionsReducer';
import walletReducer from './reducers/walletReducer';

const combinedReducer = combineReducers({
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

const rootReducer: typeof combinedReducer = (state, action: Action) => {
  if (action.type === RESET_ALL) {
    state = undefined;
  }

  return combinedReducer(state, action);
};

export default rootReducer;
