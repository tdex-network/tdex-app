import { ADD_MARKETS, CLEAR_MARKETS } from './../actions/tdexActions';
import { TDEXMarket, TDEXProvider } from '../actionTypes/tdexActionTypes';
import { ActionType } from '../../utils/types';
import { ADD_PROVIDER, DELETE_PROVIDER } from '../actions/tdexActions';
import { AssetConfig } from '../../utils/constants';
import { AssetWithTicker } from '../../utils/tdex';
import { tickerFromAssetHash } from '../../utils/helpers';

export interface TDEXState {
  providers: TDEXProvider[];
  markets: TDEXMarket[];
}

const initialState: TDEXState = {
  providers: [],
  markets: [],
};

const TDEXReducer = (state: TDEXState = initialState, action: ActionType) => {
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
