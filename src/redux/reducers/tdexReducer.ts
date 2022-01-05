import type { NetworkString } from 'tdex-sdk';

import type { AssetConfig } from '../../utils/constants';
import { tickerFromAssetHash } from '../../utils/helpers';
import type { AssetWithTicker } from '../../utils/tdex';
import type { ActionType } from '../../utils/types';
import type { TDEXMarket, TDEXProvider } from '../actionTypes/tdexActionTypes';
import { ADD_MARKETS, ADD_PROVIDERS, CLEAR_MARKETS, CLEAR_PROVIDERS, DELETE_PROVIDER } from '../actions/tdexActions';

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
    case ADD_PROVIDERS: {
      const newProviders: TDEXProvider[] = [];
      action.payload.forEach((p: TDEXProvider) => {
        const isProviderInState = state.providers.some(({ endpoint }) => endpoint === p.endpoint);
        if (!isProviderInState) newProviders.push(p);
      });
      return {
        ...state,
        providers: [...state.providers, ...newProviders],
      };
    }
    case DELETE_PROVIDER:
      return {
        ...state,
        providers: state.providers.filter((p) => p.endpoint !== action.payload.endpoint),
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
  network,
}: {
  assets: Record<string, AssetConfig>;
  tdex: TDEXState;
  network: NetworkString;
}): AssetWithTicker[] => {
  const quoteAssets = tdex.markets.map((m) => m.quoteAsset);
  const baseAssets = tdex.markets.map((m) => m.baseAsset);
  const uniqueAssets = [...new Set([...quoteAssets, ...baseAssets])];
  return uniqueAssets.map((assetHash: string) => ({
    asset: assetHash,
    ticker: assets[assetHash]?.ticker || tickerFromAssetHash(network, assetHash),
    coinGeckoID: assets[assetHash]?.coinGeckoID,
  }));
};

export default TDEXReducer;
