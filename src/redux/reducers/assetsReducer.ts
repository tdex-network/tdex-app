import { ActionType } from '../../utils/types';
import { SET_ASSETS } from '../actions/assetsActions';

const initialState = {
  byId: {},
};

const assetsReducer = (state = initialState, action: ActionType) => {
  switch (action.type) {
    case SET_ASSETS: {
      return {
        ...state,
        byId: {
          ...state.byId,
          ...action.payload.byId,
        },
        byTicker: {
          ...state.byId,
          ...action.payload.byTicker,
        },
      };
    }
    default:
      return state;
  }
};

export default assetsReducer;
