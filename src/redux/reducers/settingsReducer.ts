import type { LbtcDenomination } from '../../utils/constants';
import { CURRENCIES, LBTC_DENOMINATIONS } from '../../utils/constants';
import type { ActionType } from '../../utils/types';
import {
  SET_CURRENCY,
  SET_ELECTRUM_SERVER,
  SET_LBTC_DENOMINATION,
  SET_THEME,
} from '../actions/settingsActions';
import { network } from '../config';

export interface CurrencyInterface {
  name: string;
  symbol: string;
  value: string;
}

export interface SettingsState {
  currency: CurrencyInterface;
  explorerUrl: string;
  theme: string;
  denominationLBTC: LbtcDenomination;
}

const initialState: SettingsState = {
  currency: CURRENCIES[0],
  explorerUrl: network.explorer,
  theme: 'dark',
  denominationLBTC: LBTC_DENOMINATIONS[0],
};

const settingsReducer = (
  state: SettingsState = initialState,
  action: ActionType,
): SettingsState => {
  switch (action.type) {
    case SET_LBTC_DENOMINATION:
      return {
        ...state,
        denominationLBTC: action.payload,
      };
    case SET_CURRENCY:
      return {
        ...state,
        currency: action.payload,
      };
    case SET_ELECTRUM_SERVER:
      return {
        ...state,
        explorerUrl: action.payload,
      };
    case SET_THEME:
      return {
        ...state,
        theme: action.payload,
      };
    default:
      return state;
  }
};

export default settingsReducer;
