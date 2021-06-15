import type { AddressInterface, UtxoInterface, Outpoint, Mnemonic } from 'ldk';

import {
  defaultPrecision,
  LBTC_COINGECKOID,
  LBTC_TICKER,
  getMainAsset,
} from '../../utils/constants';
import {
  tickerFromAssetHash,
  balancesFromUtxos,
  getIndexAndIsChangeFromAddress,
} from '../../utils/helpers';
import type { ActionType } from '../../utils/types';
import type { BalanceInterface } from '../actionTypes/walletActionTypes';
import {
  SET_IS_AUTH,
  SET_UTXO,
  DELETE_UTXO,
  ADD_ADDRESS,
  RESET_UTXOS,
  SET_PUBLIC_KEYS,
  LOCK_UTXO,
  UNLOCK_UTXO,
  UNLOCK_UTXOS,
} from '../actions/walletActions';

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

const initialState: WalletState = {
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
      const { isChange, index } = getIndexAndIsChangeFromAddress(
        action.payload.address,
      );
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
    case SET_IS_AUTH:
      return { ...state, isAuth: action.payload };
    case SET_UTXO:
      // TO DO replace by Object.assign
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
    case LOCK_UTXO:
      return {
        ...state,
        utxosLocks: [...state.utxosLocks, action.payload],
      };
    case UNLOCK_UTXO:
      return {
        ...state,
        utxosLocks: state.utxosLocks.filter(
          (outpoint: string) => outpoint !== action.payload,
        ),
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

const deleteUtxoInState = (
  state: WalletState,
  outpoint: Outpoint,
): WalletState => {
  const newUtxosMap = { ...state.utxos };
  delete newUtxosMap[outpointToString(outpoint)];
  return { ...state, utxos: newUtxosMap };
};

export const allUtxosSelector = ({
  wallet,
}: {
  wallet: WalletState;
}): UtxoInterface[] => {
  if (Object.keys(wallet.utxosLocks).length === 0)
    return Object.values(wallet.utxos);
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
 */
export const balancesSelector = (state: any): BalanceInterface[] => {
  const assets = state.assets;
  const utxos = allUtxosSelector(state);
  const txsAssets = transactionsAssets(state);
  const balances = balancesFromUtxos(utxos, assets);
  const balancesAssets = balances.map(b => b.asset);
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
};

/**
 * Redux selector returning the total LBTC balance (including featuring assets with CoinGecko support)
 * @param state the current redux state
 */
export const aggregatedLBTCBalanceSelector = (state: any): BalanceInterface => {
  const toAggregateBalancesInBTC = balancesSelector(state)
    .filter(b => b.amount > 0 && b.coinGeckoID)
    .map((balance: BalanceInterface) => {
      if (balance.coinGeckoID === LBTC_COINGECKOID) {
        return balance.amount;
      }
      const price: number | undefined =
        state.rates.lbtcPrices[balance.coinGeckoID || ''];
      return (price || 0) * balance.amount;
    });

  const amount = toAggregateBalancesInBTC.reduce((acc, a) => acc + a, 0);
  return {
    amount,
    asset: '',
    ticker: LBTC_TICKER,
    coinGeckoID: LBTC_COINGECKOID,
    precision: 8,
  };
};

export const addressesSelector = ({
  wallet,
}: {
  wallet: WalletState;
}): AddressInterface[] => {
  return Object.values(wallet.addresses);
};

export default walletReducer;
