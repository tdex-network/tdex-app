import { UnblindTxsRequestParams } from '../actionTypes/transactionsActionTypes';
import { ActionType, TxsByAssetsInterface } from '../../utils/types';

export const GET_TRANSACTIONS = 'GET_TRANSACTIONS';
export const SET_TRANSACTIONS = 'SET_TRANSACTIONS';
export const SET_TRANSACTIONS_LOADING = 'SET_TRANSACTIONS_LOADING';
export const DO_WITHDRAW = 'DO_WITHDRAW';

export const getTransactions = (
  params: UnblindTxsRequestParams
): ActionType => {
  return {
    type: GET_TRANSACTIONS,
    payload: params,
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
