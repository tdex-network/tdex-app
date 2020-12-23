import { ActionType, TxsByAssetsInterface } from '../../utils/types';
import { AddressInterface } from 'tdex-sdk';

export const GET_TRANSACTIONS = 'GET_TRANSACTIONS';
export const SET_TRANSACTIONS = 'SET_TRANSACTIONS';
export const SET_TRANSACTIONS_LOADING = 'SET_TRANSACTIONS_LOADING';
export const DO_WITHDRAW = 'DO_WITHDRAW';
export const SET_WITHDRAWAL_DETAILS = 'SET_WITHDRAWAL_DETAILS';
export const SET_WITHDRAWAL_LOADING = 'SET_WITHDRAWAL_LOADING';
export const SET_QR_CODE_ADDRESS = 'SET_QR_CODE_ADDRESS';

export const getTransactions = (addresses: AddressInterface[]): ActionType => {
  return {
    type: GET_TRANSACTIONS,
    payload: addresses,
  };
};

export const setTransactions = (
  transactions: TxsByAssetsInterface | undefined
): ActionType => {
  return {
    type: SET_TRANSACTIONS,
    payload: transactions,
  };
};

export const doWithdraw = (
  address: string,
  amount: number,
  asset: any
): ActionType => {
  return {
    type: DO_WITHDRAW,
    payload: {
      address,
      amount,
      asset,
    },
  };
};

export const setTransactionsLoading = (loading: boolean): ActionType => {
  return {
    type: SET_TRANSACTIONS_LOADING,
    payload: loading,
  };
};

export const setWithdrawalLoading = (loading: boolean | null): ActionType => {
  return {
    type: SET_WITHDRAWAL_LOADING,
    payload: loading,
  };
};

export const setWithdrawalDetails = (details: any): ActionType => {
  return {
    type: SET_WITHDRAWAL_DETAILS,
    payload: details,
  };
};

export const setQRCodeAddress = (address: string | null): ActionType => {
  return {
    type: SET_QR_CODE_ADDRESS,
    payload: address,
  };
};
