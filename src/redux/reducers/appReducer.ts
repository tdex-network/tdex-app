import { ActionType } from '../../utils/types';
import {
  INIT_APP_FAIL,
  INIT_APP_SUCCESS,
  SET_SIGNED_UP,
} from '../actions/appActions';

const initialState = {
  appInit: false,
  isSignedUp: false,
};

const appReducer = (state = initialState, action: ActionType) => {
  switch (action.type) {
    case INIT_APP_SUCCESS:
    case INIT_APP_FAIL:
      return {
        ...state,
        appInit: true,
      };
    case SET_SIGNED_UP:
      return {
        ...state,
        isSignedUp: action.payload,
      };
    default:
      return state;
  }
};

export default appReducer;
