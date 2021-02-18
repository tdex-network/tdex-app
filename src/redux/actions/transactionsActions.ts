import { TxInterface } from 'ldk';
import { ActionType } from '../../utils/types';

export const UPDATE_TRANSACTIONS = 'UPDATE_TRANSACTIONS';
export const SET_TRANSACTION = 'SET_TRANSACTION';

export const setTransaction = (transaction: TxInterface): ActionType => {
  return {
    type: SET_TRANSACTION,
    payload: transaction,
  };
};
