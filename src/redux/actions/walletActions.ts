import type { AddressInterface, Mnemonic, Outpoint } from 'ldk';
import { address as addrLDK } from 'ldk';
import type { UnblindedOutput } from 'tdex-sdk';

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
export const SET_MASTER_PUBLIC_KEY = 'SET_MASTER_PUBLIC_KEY';
export const LOCK_UTXO = 'LOCK_UTXO';
export const UNLOCK_UTXO = 'UNLOCK_UTXO';
export const WATCH_UTXO = 'WATCH_UTXO';
export const UNLOCK_UTXOS = 'UNLOCK_UTXOS';

export const watchUtxo = (
  address: AddressInterface,
  maxTry = 50
): ActionType<{ address: AddressInterface; maxTry: number }> => ({
  type: WATCH_UTXO,
  payload: {
    address,
    maxTry,
  },
});

export const unlockUtxos = (): ActionType => ({
  type: UNLOCK_UTXOS,
});

export const addAddress = (address: AddressInterface): ActionType<{ address: AddressInterface; script: string }> => {
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

export const lockUtxo = (txid: string, vout: number): ActionType<string> => {
  return {
    type: LOCK_UTXO,
    payload: outpointToString({ txid, vout }),
  };
};

export const unlockUtxo = (outpointStr: string): ActionType<string> => {
  return {
    type: UNLOCK_UTXO,
    payload: outpointStr,
  };
};

export const setMasterPublicKeysFromMnemonic = (mnemonic: Mnemonic): ActionType<Mnemonic> => {
  return {
    type: SET_MASTER_PUBLIC_KEYS_FROM_MNEMONIC,
    payload: mnemonic,
  };
};

export const setMasterPublicKey = (masterPubKey: string): ActionType<string> => {
  return {
    type: SET_MASTER_PUBLIC_KEY,
    payload: masterPubKey,
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

export const setUtxo = (utxo: UnblindedOutput): ActionType<UnblindedOutput> => {
  return {
    type: SET_UTXO,
    payload: utxo,
  };
};

export const deleteUtxo = (outpoint: Outpoint): ActionType<Outpoint> => {
  return {
    type: DELETE_UTXO,
    payload: outpoint,
  };
};

export const setIsAuth = (isAuth: boolean): ActionType<boolean> => {
  return {
    type: SET_IS_AUTH,
    payload: isAuth,
  };
};
