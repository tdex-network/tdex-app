import { ActionType } from '../../utils/types';
import {
  INIT_APP_FAIL,
  INIT_APP_SUCCESS,
  SET_BACKUP_DONE,
  SET_SIGNED_UP,
} from '../actions/appActions';

export interface AppState {
  appInit: boolean;
  isSignedUp: boolean;
  backupDone: boolean;
}

const initialState: AppState = {
  appInit: false,
  isSignedUp: false,
  backupDone: false,
};

function appReducer(state = initialState, action: ActionType): AppState {
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
    case SET_BACKUP_DONE:
      return {
        ...state,
        backupDone: true,
      };
    default:
      return state;
  }
}

export default appReducer;
