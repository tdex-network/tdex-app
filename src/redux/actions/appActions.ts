import { ActionType } from '../../utils/types';

export const INIT_APP = 'INIT_APP';
export const INIT_APP_SUCCESS = 'INIT_APP_SUCCESS';
export const INIT_APP_FAIL = 'INIT_APP_FAIL';
export const SET_SIGNED_UP = 'SET_SIGNED_UP';
export const SIGN_IN = 'SIGN_IN';

export const initApp = (): ActionType => {
  return {
    type: INIT_APP,
  };
};

export const initAppSuccess = (): ActionType => {
  return {
    type: INIT_APP_SUCCESS,
  };
};

export const initAppFail = (): ActionType => {
  return {
    type: INIT_APP_FAIL,
  };
};

export const setSignedUp = (signedUp: boolean): ActionType => {
  return {
    type: SET_SIGNED_UP,
    payload: signedUp,
  };
};

export const signIn = (): ActionType => {
  return {
    type: SIGN_IN,
  };
};
