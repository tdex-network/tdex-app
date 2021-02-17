import { Assets } from './../../utils/constants';
import { AddressInterface, UtxoInterface, Outpoint, isBlindedUtxo } from 'ldk';
import { ActionType } from '../../utils/types';
import {
  CLEAR_WALLET_STATE,
  SET_ADDRESS,
  SET_IS_AUTH,
  SET_WALLET_LOADING,
  SET_ADDRESSES,
  SET_UTXO,
  DELETE_UTXO,
} from '../actions/walletActions';
import { createSelector } from 'reselect';
import { groupBy } from '../../utils/helpers';
import { BalanceInterface } from '../actionTypes/walletActionTypes';

export interface WalletState {
  isAuth: boolean;
  loading: boolean;
  address?: AddressInterface;
  addresses: AddressInterface[];
  utxos: Map<Outpoint, UtxoInterface>;
}

const initialState: WalletState = {
  isAuth: false,
  loading: true,
  address: undefined,
  addresses: [],
  utxos: new Map<Outpoint, UtxoInterface>(),
};

function walletReducer(state = initialState, action: ActionType): WalletState {
  switch (action.type) {
    case SET_ADDRESS:
      return { ...state, address: action.payload };
    case SET_ADDRESSES:
      return { ...state, addresses: action.payload };
    case SET_IS_AUTH:
      return { ...state, isAuth: action.payload };
    case SET_WALLET_LOADING:
      return { ...state, loading: action.payload };
    case CLEAR_WALLET_STATE:
      return { ...initialState };
    case SET_UTXO:
      return {
        ...state,
        utxos: state.utxos.set(action.payload, action.payload),
      };
    case DELETE_UTXO:
      return deleteUtxoInState(state, action.payload);
    default:
      return state;
  }
}

const deleteUtxoInState = (
  state: WalletState,
  outpoint: Outpoint
): WalletState => {
  const utxosMap = state.utxos;
  utxosMap.delete(outpoint);
  return { ...state, utxos: utxosMap };
};

const utxosMapSelector = ({ wallet }: { wallet: WalletState }) => wallet.utxos;
const allUtxosSelector = createSelector(utxosMapSelector, (utxosMap) =>
  Array.from(utxosMap.values())
);
export const balancesSelector = createSelector(
  allUtxosSelector,
  (utxos: UtxoInterface[]) => balancesFromUtxos(utxos)
);

function balancesFromUtxos(utxos: UtxoInterface[]): BalanceInterface[] {
  const balances: BalanceInterface[] = [];
  const utxosGroupedByAsset: Record<string, UtxoInterface[]> = groupBy(
    utxos,
    'asset'
  );

  for (const asset of Object.keys(utxosGroupedByAsset)) {
    const utxosForAsset = utxosGroupedByAsset[asset];
    const amount = sumUtxos(utxosForAsset);

    let ticker: string = asset.slice(0, 4);
    let coinGeckoID = undefined;
    const assetData = Object.values(Assets).find((a) => a.assetHash === asset);
    if (assetData) {
      ticker = assetData.ticker;
      coinGeckoID = assetData.coinGeckoID;
    }
    balances.push({ asset, amount, ticker, coinGeckoID });
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

export default walletReducer;
