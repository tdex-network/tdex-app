import type { TxInterface } from 'ldk';

import type { ActionType } from '../../utils/types';

export const UPDATE_TRANSACTIONS = 'UPDATE_TRANSACTIONS';
export const SET_TRANSACTION = 'SET_TRANSACTION';
export const WATCH_TRANSACTION = 'WATCH_TRANSACTION';
export const ADD_WATCHER_TRANSACTION = 'ADD_WATCHER_TRANSACTION';
export const REMOVE_WATCHER_TRANSACTION = 'REMOVE_WATCHER_TRANSACTION';

export const removeWatcherTransaction = (txID: string): ActionType => ({
  type: REMOVE_WATCHER_TRANSACTION,
  payload: txID,
});

export const addWatcherTransaction = (txID: string): ActionType => ({
  type: ADD_WATCHER_TRANSACTION,
  payload: txID,
});

export const watchTransaction = (txID: string, maxTry = 100): ActionType => {
  return {
    type: WATCH_TRANSACTION,
    payload: {
      txID,
      maxTry,
    },
  };
};

export const updateTransactions = (): ActionType => {
  return {
    type: UPDATE_TRANSACTIONS,
  };
};

export const setTransaction = (transaction: TxInterface): ActionType => {
  return {
    type: SET_TRANSACTION,
    payload: transaction,
  };
};
