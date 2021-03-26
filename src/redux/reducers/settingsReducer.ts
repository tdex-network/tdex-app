import { ActionType } from '../../utils/types';
import { SET_ELECTRUM_SERVER, SET_THEME } from '../actions/settingsActions';
import { network } from '../config';

export interface SettingsState {
  currency: string;
  explorerUrl: string;
  theme: string;
}

const initialState: SettingsState = {
  currency: 'eur',
  explorerUrl: network.explorer,
  theme: 'dark',
};

const settingsReducer = (
  state: SettingsState = initialState,
  action: ActionType
) => {
  switch (action.type) {
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
