import { ActionType } from '../../utils/types';

export const SET_MNEMONIC = 'SET_MNEMONIC';
export const SET_IS_AUTH = 'SET_IS_AUTH';
export const SET_PIN = 'SET_PIN';
export const CLEAR_PIN = 'CLEAR_PIN';
export const CLEAR_WALLET_STATE = 'CLEAR_WALLET_STATE';

export const setMnemonic = (mnemonic: string): ActionType => {
  return {
    type: SET_MNEMONIC,
    payload: mnemonic,
  };
};

export const setIsAuth = (isAuth: boolean): ActionType => {
  return {
    type: SET_IS_AUTH,
    payload: isAuth,
  };
};

export const setPin = (pin: string): ActionType => {
  return {
    type: SET_PIN,
    payload: pin,
  };
};

export const clearPin = (): ActionType => {
  return {
    type: CLEAR_PIN,
  };
};

export const clearWalletState = (): ActionType => {
  return {
    type: CLEAR_WALLET_STATE,
  };
};
