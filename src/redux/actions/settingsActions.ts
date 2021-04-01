import { ActionType } from '../../utils/types';

export const SET_ELECTRUM_SERVER = 'SET_ELECTRUM_SERVER';
export const SET_THEME = 'SET_THEME';
export const STORE_THEME = 'STORE_THEME';

export const setElectrumServer = (url: string): ActionType => {
  return {
    type: SET_ELECTRUM_SERVER,
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
