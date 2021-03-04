import { createSelector } from 'reselect';
import { TxInterface, AddressInterface, address } from 'ldk';
import { ActionType } from '../../utils/types';
import { SET_TRANSACTION } from '../actions/transactionsActions';
import { toDisplayTransaction } from '../transformers/transactionsTransformer';

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
}) => Object.values(transactions.txs);

export const transactionsToDisplaySelector = createSelector(
  transactionsSelector,
  (state: any) => state.wallet.addresses,
  (txs: TxInterface[], addresses: AddressInterface[]) => {
    const scripts = addresses.map((a) =>
      address.toOutputScript(a.confidentialAddress).toString('hex')
    );
    return txs.map((tx) => toDisplayTransaction(tx, scripts));
  }
);

export const transactionsByAssetSelector = (asset: string) => (state: any) => {
  const txs = transactionsToDisplaySelector(state);
  return txs.filter((tx) => tx.transfers.map((t) => t.asset).includes(asset));
};

export const transactionSelector = (txID: string) => (state: any) => {
  const txs = transactionsToDisplaySelector(state);
  return txs.find((tx) => tx.txId === txID);
};

export default transactionsReducer;
