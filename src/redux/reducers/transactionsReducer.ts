import { TxInterface } from 'ldk';
import { createSelector } from 'reselect';
import { ActionType } from '../../utils/types';
import { SET_TRANSACTION } from '../actions/transactionsActions';
import { transactionsTransformer } from '../transformers/transactionsTransformer';

interface TransactionState {
  // record txid ---> tx
  txs: Record<string, TxInterface>;
}

const initialState: TransactionState = {
  txs: {},
};

const transactionsReducer = (state = initialState, action: ActionType) => {
  switch (action.type) {
    case SET_TRANSACTION:
      return addTransactionInState(state, action.payload);
    default:
      return state;
  }
};

function addTransactionInState(
  state: TransactionState,
  tx: TxInterface
): TransactionState {
  const txs = { ...state.txs };
  txs[tx.txid] = tx;
  return { ...state, txs };
}

const transactionsSelector = ({
  transactions,
}: {
  transactions: TransactionState;
}) => transactions.txs;
export const transactionsByAssetSelector = createSelector(
  transactionsSelector,
  (txs) => {
    const allTxs = Object.values(txs);
    return transactionsTransformer(allTxs);
  }
);

export default transactionsReducer;
