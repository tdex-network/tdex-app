import { ActionType } from '../../utils/types';
import {
  AddressInterface,
  Mnemonic,
  Outpoint,
  UtxoInterface,
  address as addr,
} from 'ldk';
import { outpointToString } from '../reducers/walletReducer';

export const SET_IS_AUTH = 'SET_IS_AUTH';
export const ADD_ADDRESS = 'ADD_ADDRESS';
export const UPDATE_UTXOS = 'UPDATE_UTXOS';
export const SET_UTXO = 'SET_UTXO';
export const DELETE_UTXO = 'DELETE_UTXO';
export const RESET_UTXOS = 'RESET_UTXOS';
export const SET_PUBLIC_KEYS = 'SET_PUBLIC_KEYS';
export const LOCK_UTXO = 'LOCK_UTXO';
export const UNLOCK_UTXO = 'UNLOCK_UTXO';
export const WATCH_UTXO = 'WATCH_UTXO';

export const watchUtxo = (
  address: AddressInterface,
  maxTry = 100
): ActionType => ({
  type: WATCH_UTXO,
  payload: {
    address,
    maxTry,
  },
});

export const addAddress = (address: AddressInterface) => {
  return {
    type: ADD_ADDRESS,
    payload: {
      script: addr.toOutputScript(address.confidentialAddress).toString('hex'),
      address,
    },
  };
};

export const lockUtxo = (txid: string, vout: number) => {
  return {
    type: LOCK_UTXO,
    payload: outpointToString({ txid, vout }),
  };
};

export const unlockUtxo = (outpointStr: string) => {
  return {
    type: UNLOCK_UTXO,
    payload: outpointStr,
  };
};

export const setPublicKeys = (mnemonic: Mnemonic) => {
  return {
    type: SET_PUBLIC_KEYS,
    payload: mnemonic,
  };
};

export const resetUtxos = (): ActionType => {
  return {
    type: RESET_UTXOS,
  };
};

export const updateUtxos = (): ActionType => {
  return {
    type: UPDATE_UTXOS,
  };
};

export const setUtxo = (utxo: UtxoInterface): ActionType => {
  return {
    type: SET_UTXO,
    payload: utxo,
  };
};

export const deleteUtxo = (outpoint: Outpoint): ActionType => {
  return {
    type: DELETE_UTXO,
    payload: outpoint,
  };
};

export const setIsAuth = (isAuth: boolean): ActionType => {
  return {
    type: SET_IS_AUTH,
    payload: isAuth,
  };
};
