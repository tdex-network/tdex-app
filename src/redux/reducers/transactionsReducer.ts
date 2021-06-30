import type { TxInterface } from 'ldk';
import type { OutputSelector } from 'reselect';
import { createSelector } from 'reselect';

import type { ActionType, TxDisplayInterface } from '../../utils/types';
import { TxTypeEnum } from '../../utils/types';
import {
  ADD_WATCHER_TRANSACTION,
  REMOVE_WATCHER_TRANSACTION,
  SET_TRANSACTION,
} from '../actions/transactionsActions';
import { toDisplayTransaction } from '../transformers/transactionsTransformer';

import type { WalletState } from './walletReducer';

interface TransactionState {
  // record txid ---> tx
  txs: Record<string, TxInterface>;
  watchers: string[];
}

const initialState: TransactionState = {
  txs: {},
  watchers: [],
};

const transactionsReducer = (
  state = initialState,
  action: ActionType,
): { watchers: string[]; txs: Record<string, TxInterface> } => {
  switch (action.type) {
    case ADD_WATCHER_TRANSACTION:
      return { ...state, watchers: [...state.watchers, action.payload] };
    case REMOVE_WATCHER_TRANSACTION:
      return {
        ...state,
        watchers: state.watchers.filter(w => w !== action.payload),
      };
    case SET_TRANSACTION:
      return {
        ...state,
        txs: { ...state.txs, [action.payload.txid]: action.payload },
      };
    default:
      return state;
  }
};

// a selector using to select all transaction in map
export const transactionsSelector = ({
  transactions,
}: {
  transactions: TransactionState;
}): TxInterface[] => Object.values(transactions.txs);

// memoized selector, map transactions to TxDisplayInterface[]
export const transactionsToDisplaySelector = createSelector(
  transactionsSelector,
  (state: any) => Object.keys(state.wallet.addresses),
  (txs: TxInterface[], scripts: string[]) => {
    return txs.map(tx => toDisplayTransaction(tx, scripts));
  },
);

// fetch txs using transactionsToDisplaySelector and filter by asset.
// i.e return the transaction if one of the transfer contains the asset.
export const transactionsByAssetSelector = (
  asset: string,
): OutputSelector<
  any,
  TxDisplayInterface[],
  (res: TxDisplayInterface[]) => TxDisplayInterface[]
> =>
  createSelector(transactionsToDisplaySelector, txs =>
    txs.filter(tx => tx.transfers.map(t => t.asset).includes(asset)),
  );

// returns all the assets of transactions
export const transactionsAssets = createSelector(
  transactionsToDisplaySelector,
  txs => {
    const transfersAsset = txs.flatMap(t =>
      t.transfers.map(transfer => transfer.asset),
    );
    return [...new Set(transfersAsset)];
  },
);

// get a specific transaction with txid
export const transactionSelector = (
  txID: string,
): OutputSelector<any, any, any> =>
  createSelector(
    ({ transactions }: { transactions: TransactionState }) =>
      transactions.txs[txID],
    ({ wallet }: { wallet: WalletState }) => Object.keys(wallet.addresses),
    (tx, scripts) => (tx ? toDisplayTransaction(tx, scripts) : undefined),
  );

// filter by transaction type
export const tradeTransactionsSelector = createSelector(
  transactionsToDisplaySelector,
  (txs: TxDisplayInterface[]) => txs.filter(tx => tx.type === TxTypeEnum.Swap),
);

export default transactionsReducer;
