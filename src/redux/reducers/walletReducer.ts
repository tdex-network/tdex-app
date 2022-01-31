import type { AddressInterface, UtxoInterface, Outpoint, Mnemonic, StateRestorerOpts } from 'ldk';
import type { MasterPublicKey } from 'ldk/dist/identity/masterpubkey';
import { createSelector } from 'reselect';

import { defaultPrecision, LBTC_COINGECKOID, LBTC_ASSET } from '../../utils/constants';
import { balancesFromUtxos, getIndexAndIsChangeFromAddress } from '../../utils/helpers';
import type { ActionType } from '../../utils/types';
import type { BalanceInterface } from '../actionTypes/walletActionTypes';
import {
  SET_IS_AUTH,
  SET_UTXO,
  DELETE_UTXO,
  ADD_ADDRESS,
  RESET_UTXOS,
  SET_MASTER_PUBLIC_KEYS_FROM_MNEMONIC,
  LOCK_UTXO,
  UNLOCK_UTXO,
  UNLOCK_UTXOS,
  CLEAR_ADDRESSES,
  SET_MASTER_PUBLIC_KEY,
} from '../actions/walletActions';
import type { RootState } from '../types';

import { transactionsAssets } from './transactionsReducer';

export interface WalletState {
  isAuth: boolean;
  addresses: Record<string, AddressInterface>;
  utxos: Record<string, UtxoInterface>;
  utxosLocks: string[];
  masterPubKey: string;
  masterBlindKey: string;
  lastUsedInternalIndex?: number;
  lastUsedExternalIndex?: number;
}

export const initialState: WalletState = {
  isAuth: false,
  addresses: {},
  utxos: {},
  utxosLocks: [],
  masterPubKey: '',
  masterBlindKey: '',
  lastUsedInternalIndex: undefined,
  lastUsedExternalIndex: undefined,
};

function walletReducer(state = initialState, action: ActionType): WalletState {
  switch (action.type) {
    case ADD_ADDRESS: {
      if (Object.keys(state.addresses).includes(action.payload.script)) return state;
      const { isChange, index } = getIndexAndIsChangeFromAddress(action.payload.address);
      return {
        ...state,
        addresses: {
          ...state.addresses,
          [action.payload.script]: action.payload.address,
        },
        lastUsedInternalIndex: isChange ? index : state.lastUsedInternalIndex,
        lastUsedExternalIndex: isChange ? state.lastUsedExternalIndex : index,
      };
    }
    case CLEAR_ADDRESSES: {
      return { ...state, addresses: {}, lastUsedInternalIndex: undefined, lastUsedExternalIndex: undefined };
    }
    case SET_IS_AUTH:
      return { ...state, isAuth: action.payload };
    case SET_UTXO:
      return addUtxoInState(state, action.payload);
    case DELETE_UTXO:
      return deleteUtxoInState(state, action.payload);
    case RESET_UTXOS:
      return { ...state, utxos: {} };
    case SET_MASTER_PUBLIC_KEYS_FROM_MNEMONIC:
      return {
        ...state,
        masterBlindKey: (action.payload as Mnemonic).masterBlindingKey,
        masterPubKey: (action.payload as Mnemonic).masterPublicKey,
      };
    case SET_MASTER_PUBLIC_KEY:
      return { ...state, masterPubKey: action.payload };
    case LOCK_UTXO:
      return {
        ...state,
        utxosLocks: [...state.utxosLocks, action.payload],
      };
    case UNLOCK_UTXO:
      return {
        ...state,
        utxosLocks: state.utxosLocks.filter((outpoint: string) => outpoint !== action.payload),
      };
    case UNLOCK_UTXOS:
      return {
        ...state,
        utxosLocks: [],
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

const deleteUtxoInState = (state: WalletState, outpoint: Outpoint): WalletState => {
  const newUtxosMap = { ...state.utxos };
  delete newUtxosMap[outpointToString(outpoint)];
  return { ...state, utxos: newUtxosMap };
};

export const allUtxosSelector = ({ wallet }: { wallet: WalletState }): UtxoInterface[] => {
  if (Object.keys(wallet.utxosLocks).length === 0) return Object.values(wallet.utxos);
  const utxos = [];
  for (const [outpoint, utxo] of Object.entries(wallet.utxos)) {
    if (wallet.utxosLocks.includes(outpoint)) continue;
    utxos.push(utxo);
  }
  return utxos;
};

/**
 * Redux selector returning balance interfaces array
 * @param state
 * @returns BalanceInterface[]
 */
export const balancesSelector = createSelector(
  [
    ({ assets, settings }: RootState) => ({ assets, settings }),
    (state: RootState) => allUtxosSelector(state),
    (state: RootState) => transactionsAssets(state),
  ],
  ({ assets, settings }, utxos, txsAssets) => {
    const balances = balancesFromUtxos(utxos, assets, settings.network);
    const balancesAssets = balances.map((b) => b.assetHash);
    for (const asset of txsAssets) {
      if (balancesAssets.includes(asset)) continue;
      // include a 'zero' balance if the user has previous transactions.
      balances.push({
        assetHash: asset,
        amount: 0,
        ticker: assets[asset]?.ticker,
        coinGeckoID: assets[asset]?.coinGeckoID,
        precision: assets[asset]?.precision ?? defaultPrecision,
        name: assets[asset]?.name ?? 'Unknown',
      });
    }
    // If no balance, add LBTC with amount zero
    const lbtcAsset = LBTC_ASSET[settings.network];
    if (!balances.length) {
      balances.push({
        assetHash: lbtcAsset.assetHash,
        amount: 0,
        ticker: lbtcAsset.ticker,
        coinGeckoID: lbtcAsset.coinGeckoID,
        precision: lbtcAsset.precision ?? defaultPrecision,
        name: lbtcAsset.name ?? 'Unknown',
      });
    }
    return balances;
  }
);

/**
 * Redux selector returning the total LBTC balance (including featuring assets with CoinGecko support)
 * @param state the current redux state
 */
export const aggregatedLBTCBalanceSelector = (state: RootState): BalanceInterface => {
  const toAggregateBalancesInBTC = balancesSelector(state)
    .filter((b) => b.amount > 0 && b.coinGeckoID)
    .map((balance: BalanceInterface) => {
      if (balance.coinGeckoID === LBTC_COINGECKOID) {
        return balance.amount;
      }
      const price: number | undefined = state.rates.lbtcPrices[balance.coinGeckoID || ''];
      return (price || 0) * balance.amount;
    });

  const amount = toAggregateBalancesInBTC.reduce((acc, a) => acc + a, 0);
  return {
    amount,
    assetHash: '',
    ticker: LBTC_ASSET[state.settings.network].ticker,
    coinGeckoID: LBTC_COINGECKOID,
    precision: 8,
    name: 'Liquid Bitcoin',
  };
};

export const addressesSelector = ({ wallet }: { wallet: WalletState }): AddressInterface[] => {
  return Object.values(wallet.addresses);
};

export function lastUsedIndexesSelector({ wallet }: { wallet: WalletState }): StateRestorerOpts {
  return {
    lastUsedInternalIndex: wallet.lastUsedInternalIndex,
    lastUsedExternalIndex: wallet.lastUsedExternalIndex,
  };
}

export function isMnemonic(identity: any): identity is Mnemonic {
  return identity?.mnemonic !== undefined;
}

export function isMasterPublicKey(identity: any): identity is MasterPublicKey {
  return identity?.mnemonic === undefined;
}

export default walletReducer;
