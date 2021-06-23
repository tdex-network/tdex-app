import type { Mnemonic } from 'ldk';

import type { ActionType } from '../../utils/types';

export const INIT_APP = 'INIT_APP';
export const INIT_APP_SUCCESS = 'INIT_APP_SUCCESS';
export const INIT_APP_FAIL = 'INIT_APP_FAIL';
export const SET_SIGNED_UP = 'SET_SIGNED_UP';
export const SIGN_IN = 'SIGN_IN';
export const UPDATE = 'UPDATE';
export const SET_IS_FETCHING_UTXOS = 'SET_IS_FETCHING_UTXOS';
export const SET_IS_BACKUP_DONE = 'SET_IS_BACKUP_DONE';

export const setIsBackupDone = (done: boolean): ActionType => {
  return {
    type: SET_IS_BACKUP_DONE,
    payload: done,
  };
};

export const updateState = (): ActionType => {
  return {
    type: UPDATE,
  };
};

export const setIsFetchingUtxos = (isFetchingUtxos: boolean): ActionType => {
  return {
    type: SET_IS_FETCHING_UTXOS,
    payload: isFetchingUtxos,
  };
};

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

export const signIn = (mnemonic: Mnemonic): ActionType => {
  return {
    type: SIGN_IN,
    payload: { mnemonic },
  };
};
