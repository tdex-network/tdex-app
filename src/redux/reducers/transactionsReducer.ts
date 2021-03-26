import { createSelector } from 'reselect';
import { TxInterface } from 'ldk';
import { ActionType, TxDisplayInterface, TxTypeEnum } from '../../utils/types';
import { SET_TRANSACTION } from '../actions/transactionsActions';
import { toDisplayTransaction } from '../transformers/transactionsTransformer';
import { WalletState } from './walletReducer';

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

// util function using to add transaction in state
function addTransactionInState(
  state: TransactionState,
  tx: TxInterface
): TransactionState {
  const txs = { ...state.txs };
  txs[tx.txid] = tx;
  return { ...state, txs };
}

// a selector using to select all transaction in map
export const transactionsSelector = ({
  transactions,
}: {
  transactions: TransactionState;
}) => Object.values(transactions.txs);

// meomized selector, map transactions to TxDisplayInterface[]
export const transactionsToDisplaySelector = createSelector(
  transactionsSelector,
  (state: any) => Object.keys(state.wallet.addresses),
  (txs: TxInterface[], scripts: string[]) => {
    return txs.map((tx) => toDisplayTransaction(tx, scripts));
  }
);

// fetch txs using transactionsToDisplaySelector and filter by asset.
// i.e return the transaction if one of the transfer contains the asset.
export const transactionsByAssetSelector = (asset: string) =>
  createSelector(transactionsToDisplaySelector, (txs) =>
    txs.filter((tx) => tx.transfers.map((t) => t.asset).includes(asset))
  );

// returns all the assets of transactions
export const transactionsAssets = createSelector(
  transactionsToDisplaySelector,
  (txs) => {
    const transfersAsset = txs.flatMap((t) =>
      t.transfers.map((transfer) => transfer.asset)
    );
    const withoutDuplicateAssets = [...new Set(transfersAsset)];
    return withoutDuplicateAssets;
  }
);

// get a specific transaction with txid
export const transactionSelector = (txID: string) =>
  createSelector(
    ({ transactions }: { transactions: TransactionState }) =>
      transactions.txs[txID],
    ({ wallet }: { wallet: WalletState }) => Object.keys(wallet.addresses),
    (tx, scripts) => (tx ? toDisplayTransaction(tx, scripts) : undefined)
  );

// filter by transaction type
export const tradeTransactionsSelector = createSelector(
  transactionsToDisplaySelector,
  (txs: TxDisplayInterface[]) => txs.filter((tx) => tx.type === TxTypeEnum.Swap)
);

export default transactionsReducer;
