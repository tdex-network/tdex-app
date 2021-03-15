import { transactionsAssets } from './transactionsReducer';
import { RESET_UTXOS, SET_PUBLIC_KEYS } from './../actions/walletActions';
import { Assets } from './../../utils/constants';
import {
  AddressInterface,
  UtxoInterface,
  Outpoint,
  isBlindedUtxo,
  Mnemonic,
} from 'ldk';
import { ActionType } from '../../utils/types';
import {
  CLEAR_WALLET_STATE,
  SET_IS_AUTH,
  SET_ADDRESSES,
  SET_UTXO,
  DELETE_UTXO,
} from '../actions/walletActions';
import { createSelector } from 'reselect';
import { groupBy } from '../../utils/helpers';
import { BalanceInterface } from '../actionTypes/walletActionTypes';

export interface WalletState {
  isAuth: boolean;
  addresses: AddressInterface[];
  utxos: Record<string, UtxoInterface>;
  masterPubKey: string;
  masterBlindKey: string;
}

const initialState: WalletState = {
  isAuth: false,
  addresses: [],
  utxos: {},
  masterPubKey: '',
  masterBlindKey: '',
};

function walletReducer(state = initialState, action: ActionType): WalletState {
  switch (action.type) {
    case SET_ADDRESSES:
      return { ...state, addresses: action.payload };
    case SET_IS_AUTH:
      return { ...state, isAuth: action.payload };
    case CLEAR_WALLET_STATE:
      return { ...initialState };
    case SET_UTXO:
      return addUtxoInState(state, action.payload);
    case DELETE_UTXO:
      return deleteUtxoInState(state, action.payload);
    case RESET_UTXOS:
      return { ...state, utxos: {} };
    case SET_PUBLIC_KEYS:
      return {
        ...state,
        masterBlindKey: (action.payload as Mnemonic).masterBlindingKey,
        masterPubKey: (action.payload as Mnemonic).masterPublicKey,
      };
    default:
      return state;
  }
}

export function outpointToString(outpoint: Outpoint): string {
  return `${outpoint.txid}:${outpoint.vout}`;
}

const addUtxoInState = (state: WalletState, utxo: UtxoInterface) => {
  const newUtxosMap = { ...state.utxos };
  newUtxosMap[outpointToString(utxo)] = utxo;
  return { ...state, utxos: newUtxosMap };
};

const deleteUtxoInState = (
  state: WalletState,
  outpoint: Outpoint
): WalletState => {
  const newUtxosMap = { ...state.utxos };
  delete newUtxosMap[outpointToString(outpoint)];
  return { ...state, utxos: newUtxosMap };
};

const utxosMapSelector = ({ wallet }: { wallet: WalletState }) => wallet.utxos;
export const allUtxosSelector = createSelector(utxosMapSelector, (utxosMap) =>
  Array.from(Object.values(utxosMap))
);

/**
 * Meomized selector for balance (computed from utxos)
 */
export const balancesSelector = createSelector(
  allUtxosSelector,
  transactionsAssets,
  (utxos: UtxoInterface[], txsAssets: string[]) => {
    const balances = balancesFromUtxos(utxos);
    const balancesAssets = balances.map((b) => b.asset);

    for (const asset of txsAssets) {
      if (balancesAssets.includes(asset)) continue;
      // include a 'zero' balance if the user has previous transactions.
      balances.push({
        asset,
        amount: 0,
        ticker: tickerFromAssetHash(asset),
      });
    }

    return balances;
  }
);

// compute balances value from a set of utxos
function balancesFromUtxos(utxos: UtxoInterface[]): BalanceInterface[] {
  const balances: BalanceInterface[] = [];
  const utxosGroupedByAsset: Record<string, UtxoInterface[]> = groupBy(
    utxos,
    'asset'
  );

  for (const asset of Object.keys(utxosGroupedByAsset)) {
    const utxosForAsset = utxosGroupedByAsset[asset];
    const amount = sumUtxos(utxosForAsset);

    let coinGeckoID = undefined;
    const assetData = Object.values(Assets).find((a) => a.assetHash === asset);
    if (assetData) {
      coinGeckoID = assetData.coinGeckoID;
    }
    balances.push({
      asset,
      amount,
      ticker: tickerFromAssetHash(asset),
      coinGeckoID,
    });
  }

  return balances;
}

function sumUtxos(utxos: UtxoInterface[]): number {
  let sum = 0;
  for (const utxo of utxos) {
    if (!isBlindedUtxo(utxo) && utxo.value) {
      sum += utxo.value;
    }
  }
  return sum;
}

export function tickerFromAssetHash(assetHash?: string): string {
  if (!assetHash) return '';
  const assetData = Object.values(Assets).find(
    (a) => a.assetHash === assetHash
  );
  if (assetData) return assetData.ticker;
  return assetHash.slice(0, 4).toUpperCase();
}

export default walletReducer;
