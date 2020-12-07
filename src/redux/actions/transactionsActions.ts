import { UnblindTxsRequestParams } from '../actionTypes/transactionsActionTypes';
import { TxsByAssetsInterface } from '../../utils/types';

export const GET_TRANSACTIONS = 'GET_TRANSACTIONS';
export const SET_TRANSACTIONS = 'SET_TRANSACTIONS';

export const getTransactions = (params: UnblindTxsRequestParams) => {
  return {
    type: GET_TRANSACTIONS,
    payload: params,
  };
};

export const setTransactions = (
  transactions: TxsByAssetsInterface | undefined
) => {
  return {
    type: SET_TRANSACTIONS,
    payload: transactions,
  };
};
