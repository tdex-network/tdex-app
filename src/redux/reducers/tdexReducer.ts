import { createSelector } from 'reselect';

import type { ActionType } from '../../utils/types';
import type { TDEXMarket, TDEXProvider } from '../actionTypes/tdexActionTypes';
import { ADD_MARKETS, ADD_PROVIDERS, CLEAR_MARKETS, CLEAR_PROVIDERS, DELETE_PROVIDER } from '../actions/tdexActions';
import type { RootState } from '../types';

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

function assetHashFromMarkets(markets: TDEXMarket[]) {
  return Array.from(new Set(markets.flatMap((m) => [m.baseAsset, m.quoteAsset])));
}

export const selectAllTradableAssets = createSelector(
  (state: RootState) => state.assets,
  (state: RootState) => state.tdex.markets,
  (assets, markets) => assetHashFromMarkets(markets).map((hash) => assets[hash])
);

export default TDEXReducer;
