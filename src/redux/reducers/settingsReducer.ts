import { CURRENCIES } from '../../utils/constants';
import { ActionType } from '../../utils/types';
import {
  SET_CURRENCY,
  SET_ELECTRUM_SERVER,
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
}

const initialState: SettingsState = {
  currency: CURRENCIES[0],
  explorerUrl: network.explorer,
  theme: 'dark',
};

const settingsReducer = (
  state: SettingsState = initialState,
  action: ActionType
) => {
  switch (action.type) {
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
