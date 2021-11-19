import { createSelector } from 'reselect';

import type { ActionType } from '../../utils/types';
import type { TDEXMarket, TDEXProvider } from '../actionTypes/tdexActionTypes';
import { ADD_MARKETS, ADD_PROVIDER, CLEAR_MARKETS, DELETE_PROVIDER } from '../actions/tdexActions';
import type { RootState } from '../store';

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
): { providers: any[]; markets: TDEXMarket[] } => {
  switch (action.type) {
    case ADD_PROVIDER:
      return { ...state, providers: [...state.providers, action.payload] };
    case ADD_MARKETS:
      return { ...state, markets: [...state.markets, ...action.payload] };
    case CLEAR_MARKETS:
      return { ...state, markets: [] };
    case DELETE_PROVIDER:
      return {
        ...state,
        providers: state.providers.filter((p) => p.id !== action.payload.id),
      };
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
