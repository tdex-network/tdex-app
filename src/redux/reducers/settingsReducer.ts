import { ActionType } from '../../utils/types';
import { SET_ELECTRUM_SERVER } from '../actions/settingsActions';
import { network } from '../config';

const initialState = {
  currency: 'eur',
  explorerUrl: network.explorer,
};

const settingsReducer = (state: any = initialState, action: ActionType) => {
  switch (action.type) {
    case SET_ELECTRUM_SERVER:
      return {
        ...state,
        explorerUrl: action.payload,
      };
    default:
      return state;
  }
};

export default settingsReducer;
