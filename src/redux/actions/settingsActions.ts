import type { ActionType } from '../../utils/types';
import type { CurrencyInterface } from '../reducers/settingsReducer';

export const SET_ELECTRUM_SERVER = 'SET_ELECTRUM_SERVER';
export const SET_EXPLORER_BITCOIN = 'SET_EXPLORER_BITCOIN';
export const SET_THEME = 'SET_THEME';
export const STORE_THEME = 'STORE_THEME';
export const SET_CURRENCY = 'SET_CURRENCY';
export const SET_LBTC_DENOMINATION = 'SET_LBTC_DENOMINATION';

export const setLBTCDenomination = (denomination: string): ActionType => ({
  type: SET_LBTC_DENOMINATION,
  payload: denomination,
});

export const setCurrency = (currency: CurrencyInterface): ActionType => {
  return {
    type: SET_CURRENCY,
    payload: currency,
  };
};

export const setElectrumServer = (url: string): ActionType => {
  return {
    type: SET_ELECTRUM_SERVER,
    payload: url,
  };
};

export const setExplorerBitcoin = (url: string): ActionType => {
  return {
    type: SET_EXPLORER_BITCOIN,
    payload: url,
  };
};

export const setTheme = (theme: string): ActionType => {
  return {
    type: SET_THEME,
    payload: theme,
  };
};

export const storeTheme = (theme: string): ActionType => {
  return {
    type: STORE_THEME,
    payload: theme,
  };
};
