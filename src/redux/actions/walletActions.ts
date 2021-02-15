import { ActionType } from '../../utils/types';
import { AddressInterface } from 'tdex-sdk';
import { BalanceInterface } from '../actionTypes/walletActionTypes';

export const SET_MNEMONIC = 'SET_MNEMONIC';
export const SET_ADDRESS = 'SET_ADDRESS';
export const SET_IS_AUTH = 'SET_IS_AUTH';
export const CLEAR_WALLET_STATE = 'CLEAR_WALLET_STATE';
export const GET_WALLET_ASSETS = 'GET_WALLET_ASSETS';
export const SET_WALLET_ASSETS = 'SET_WALLET_ASSETS';
export const GET_COINS_LIST = 'GET_COINS_LIST';
export const SET_COINS_LIST = 'SET_COINS_LIST';
export const SET_COINS_RATES = 'SET_COINS_RATES';
export const GET_BALANCES = 'GET_BALANCES';
export const SET_BALANCES = 'SET_BALANCES';
export const SET_WALLET_LOADING = 'SET_WALLET_LOADING';
export const SET_ADDRESSES = 'SET_ADDRESSES';

export const setMnemonic = (mnemonic: string): ActionType => {
  return {
    type: SET_MNEMONIC,
    payload: mnemonic,
  };
};

export const setAddress = (address: AddressInterface): ActionType => {
  return {
    type: SET_ADDRESS,
    payload: address,
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

export const getAssets = (balances: any) => {
  return {
    type: GET_WALLET_ASSETS,
    payload: balances,
  };
};

export const setAssets = (assets: any) => {
  return {
    type: SET_WALLET_ASSETS,
    payload: assets,
  };
};

export const getCoinsList = () => {
  return {
    type: GET_COINS_LIST,
  };
};

export const setCoinsList = (coinsList: any) => {
  return {
    type: SET_COINS_LIST,
    payload: coinsList,
  };
};

export const setCoinsRates = (coinsRates: any) => {
  return {
    type: SET_COINS_RATES,
    payload: coinsRates,
  };
};

export const getBalances = (addresses: AddressInterface[]) => {
  return {
    type: GET_BALANCES,
    payload: addresses,
  };
};

export const setBalances = (balances: BalanceInterface) => {
  return {
    type: SET_BALANCES,
    payload: balances,
  };
};

export const setWalletLoading = (loading: boolean): ActionType => {
  return {
    type: SET_WALLET_LOADING,
    payload: loading,
  };
};

export const clearWalletState = (): ActionType => {
  return {
    type: CLEAR_WALLET_STATE,
  };
};
