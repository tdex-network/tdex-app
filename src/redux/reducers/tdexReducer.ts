import type { AssetConfig } from '../../utils/constants';
import { tickerFromAssetHash } from '../../utils/helpers';
import type { AssetWithTicker } from '../../utils/tdex';
import type { ActionType } from '../../utils/types';
import type { TDEXMarket, TDEXProvider } from '../actionTypes/tdexActionTypes';
import { ADD_MARKETS, ADD_PROVIDER, CLEAR_MARKETS, CLEAR_PROVIDERS, DELETE_PROVIDER } from '../actions/tdexActions';

export interface TDEXState {
  providers: TDEXProvider[];
  markets: TDEXMarket[];
}

const initialState: TDEXState = {
  providers: [],
  markets: [],
};

const TDEXReducer = (
  state: TDEXState = initialState,
  action: ActionType
): { providers: TDEXProvider[]; markets: TDEXMarket[] } => {
  switch (action.type) {
    case ADD_MARKETS:
      return { ...state, markets: [...state.markets, ...action.payload] };
    case CLEAR_MARKETS:
      return { ...state, markets: [] };
    case ADD_PROVIDER:
      return state.providers.find((p) => p.endpoint === action.payload.endpoint) === undefined
        ? {
            ...state,
            providers: [...state.providers, action.payload],
          }
        : state;
    case DELETE_PROVIDER:
      return {
        ...state,
        providers: state.providers.filter((p) => p.id !== action.payload.id),
      };
    case CLEAR_PROVIDERS:
      return { ...state, providers: [] };
    default:
      return state;
  }
};

export const allAssets = ({
  assets,
  tdex,
}: {
  assets: Record<string, AssetConfig>;
  tdex: TDEXState;
}): AssetWithTicker[] => {
  const quoteAssets = tdex.markets.map((m) => m.quoteAsset);
  const baseAssets = tdex.markets.map((m) => m.baseAsset);
  const uniqueAssets = [...new Set([...quoteAssets, ...baseAssets])];
  return uniqueAssets.map((assetHash: string) => ({
    asset: assetHash,
    ticker: assets[assetHash]?.ticker || tickerFromAssetHash(assetHash),
    coinGeckoID: assets[assetHash]?.coinGeckoID,
  }));
};

export default TDEXReducer;
