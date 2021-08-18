import type { ActionType } from '../../utils/types';
import type { CurrencyInterface } from '../reducers/settingsReducer';

export const SET_EXPLORER_LIQUID_API = 'SET_EXPLORER_LIQUID_API';
export const SET_EXPLORER_BITCOIN_API = 'SET_EXPLORER_BITCOIN_API';
export const SET_EXPLORER_BITCOIN_UI = 'SET_EXPLORER_BITCOIN_UI';
export const SET_EXPLORER_LIQUID_UI = 'SET_EXPLORER_LIQUID_UI';
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

export const setExplorerLiquidAPI = (url: string): ActionType => {
  return {
    type: SET_EXPLORER_LIQUID_API,
    payload: url,
  };
};

export const setExplorerBitcoinAPI = (url: string): ActionType => {
  return {
    type: SET_EXPLORER_BITCOIN_API,
    payload: url,
  };
};

export const setExplorerBitcoinUI = (url: string): ActionType => {
  return {
    type: SET_EXPLORER_BITCOIN_UI,
    payload: url,
  };
};

export const setExplorerLiquidUI = (url: string): ActionType => {
  return {
    type: SET_EXPLORER_LIQUID_UI,
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
