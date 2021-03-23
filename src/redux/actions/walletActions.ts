import { ActionType } from '../../utils/types';
import { AddressInterface, Mnemonic, Outpoint, UtxoInterface } from 'ldk';
import { outpointToString } from '../reducers/walletReducer';

export const SET_IS_AUTH = 'SET_IS_AUTH';
export const CLEAR_WALLET_STATE = 'CLEAR_WALLET_STATE';
export const SET_BALANCES = 'SET_BALANCES';
export const SET_ADDRESSES = 'SET_ADDRESSES';
export const UPDATE_UTXOS = 'UPDATE_UTXOS';
export const SET_UTXO = 'SET_UTXO';
export const DELETE_UTXO = 'DELETE_UTXO';
export const RESET_UTXOS = 'RESET_UTXOS';
export const SET_PUBLIC_KEYS = 'SET_PUBLIC_KEYS';
export const LOCK_UTXO = 'LOCK_UTXO';
export const UNLOCK_UTXO = 'UNLOCK_UTXO';

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

export const setAddresses = (addresses: AddressInterface[]): ActionType => {
  return {
    type: SET_ADDRESSES,
    payload: addresses,
  };
};

export const setIsAuth = (isAuth: boolean): ActionType => {
  return {
    type: SET_IS_AUTH,
    payload: isAuth,
  };
};

export const clearWalletState = (): ActionType => {
  return {
    type: CLEAR_WALLET_STATE,
  };
};
