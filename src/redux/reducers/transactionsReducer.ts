import { createSelector } from 'reselect';
import { TxInterface, AddressInterface, address } from 'ldk';
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
  (state: any) => state.wallet.addresses,
  (txs: TxInterface[], addresses: AddressInterface[]) => {
    const scripts = addressesToScripts(addresses);
    return txs.map((tx) => toDisplayTransaction(tx, scripts));
  }
);

// fetch txs using transactionsToDisplaySelector and filter by asset.
// i.e return the transaction if one of the transfer contains the asset.
export const transactionsByAssetSelector = (asset: string) => (state: any) => {
  const txs = transactionsToDisplaySelector(state);
  return txs.filter((tx) => tx.transfers.map((t) => t.asset).includes(asset));
};

// returns all the assets of transactions
export const transactionsAssets = (state: any): string[] => {
  const txs = transactionsToDisplaySelector(state);
  const transfersAsset = txs.flatMap((t) =>
    t.transfers.map((transfer) => transfer.asset)
  );
  const withoutDuplicateAssets = [...new Set(transfersAsset)];
  return withoutDuplicateAssets;
};

// get a specific transaction with txid
export const transactionSelector = (txID: string) => ({
  transactions,
  wallet,
}: {
  transactions: TransactionState;
  wallet: WalletState;
}) => {
  const tx = transactions.txs[txID];
  if (!tx) return undefined;
  return toDisplayTransaction(tx, addressesToScripts(wallet.addresses));
};

// filter by transaction type
export const tradeTransactionsSelector = createSelector(
  transactionsToDisplaySelector,
  (txs: TxDisplayInterface[]) => txs.filter((tx) => tx.type === TxTypeEnum.Swap)
);

function addressesToScripts(addresses: AddressInterface[]): string[] {
  return addresses.map((a) =>
    address.toOutputScript(a.confidentialAddress).toString('hex')
  );
}

export default transactionsReducer;
