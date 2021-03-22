import { transactionsAssets } from './transactionsReducer';
import { RESET_UTXOS, SET_PUBLIC_KEYS } from './../actions/walletActions';
import { AddressInterface, UtxoInterface, Outpoint, Mnemonic } from 'ldk';
import { ActionType } from '../../utils/types';
import {
  CLEAR_WALLET_STATE,
  SET_IS_AUTH,
  SET_ADDRESSES,
  SET_UTXO,
  DELETE_UTXO,
} from '../actions/walletActions';
import { createSelector } from 'reselect';
import {
  tickerFromAssetHash,
  balancesFromUtxos,
  customCoinSelector,
} from '../../utils/helpers';
import {
  AssetConfig,
  defaultPrecision,
  getMainAsset,
} from '../../utils/constants';

export interface WalletState {
  isAuth: boolean;
  addresses: AddressInterface[];
  utxos: Record<string, UtxoInterface>;
  utxosLocks: Record<string, number>;
  masterPubKey: string;
  masterBlindKey: string;
}

const initialState: WalletState = {
  isAuth: false,
  addresses: [],
  utxos: {},
  utxosLocks: {},
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
  ({ assets }: { assets: Record<string, AssetConfig> }) => assets,
  (
    utxos: UtxoInterface[],
    txsAssets: string[],
    assets: Record<string, AssetConfig>
  ) => {
    const balances = balancesFromUtxos(utxos, assets);
    const balancesAssets = balances.map((b) => b.asset);
    for (const asset of txsAssets) {
      if (balancesAssets.includes(asset)) continue;
      // include a 'zero' balance if the user has previous transactions.
      balances.push({
        asset,
        amount: 0,
        ticker: assets[asset]?.ticker || tickerFromAssetHash(asset),
        coinGeckoID: getMainAsset(asset)?.coinGeckoID,
        precision: assets[asset]?.precision || defaultPrecision,
      });
    }

    return balances;
  }
);

export const getCoinSelector = createSelector(
  ({ wallet }: { wallet: WalletState }) => wallet.utxosLocks,
  (locks: Record<string, number>) => customCoinSelector(locks)
);

export default walletReducer;
