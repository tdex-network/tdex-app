import type { AddressInterface, Mnemonic, Outpoint, UtxoInterface } from 'ldk';
import { address as addrLDK } from 'ldk';
import type { AnyAction } from 'redux';

import type { ActionType } from '../../utils/types';
import { outpointToString } from '../reducers/walletReducer';

export const SET_IS_AUTH = 'SET_IS_AUTH';
export const ADD_ADDRESS = 'ADD_ADDRESS';
export const CLEAR_ADDRESSES = 'CLEAR_ADDRESSES';
export const UPDATE_UTXOS = 'UPDATE_UTXOS';
export const SET_UTXO = 'SET_UTXO';
export const DELETE_UTXO = 'DELETE_UTXO';
export const RESET_UTXOS = 'RESET_UTXOS';
export const SET_MASTER_PUBLIC_KEYS_FROM_MNEMONIC = 'SET_MASTER_PUBLIC_KEYS_FROM_MNEMONIC';
export const LOCK_UTXO = 'LOCK_UTXO';
export const UNLOCK_UTXO = 'UNLOCK_UTXO';
export const WATCH_UTXO = 'WATCH_UTXO';
export const UNLOCK_UTXOS = 'UNLOCK_UTXOS';

export const watchUtxo = (address: AddressInterface, maxTry = 100): ActionType => ({
  type: WATCH_UTXO,
  payload: {
    address,
    maxTry,
  },
});

export const unlockUtxos = (): AnyAction => ({
  type: UNLOCK_UTXOS,
});

export const addAddress = (address: AddressInterface): AnyAction => {
  return {
    type: ADD_ADDRESS,
    payload: {
      script: addrLDK.toOutputScript(address.confidentialAddress).toString('hex'),
      address,
    },
  };
};

export const clearAddresses = (): ActionType => {
  return {
    type: CLEAR_ADDRESSES,
  };
};

export const lockUtxo = (txid: string, vout: number): AnyAction => {
  return {
    type: LOCK_UTXO,
    payload: outpointToString({ txid, vout }),
  };
};

export const unlockUtxo = (outpointStr: string): AnyAction => {
  return {
    type: UNLOCK_UTXO,
    payload: outpointStr,
  };
};

export const setPublicKeys = (mnemonic: Mnemonic): AnyAction => {
  return {
    type: SET_MASTER_PUBLIC_KEYS_FROM_MNEMONIC,
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
