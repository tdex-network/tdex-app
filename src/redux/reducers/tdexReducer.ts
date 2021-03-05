import { ADD_MARKETS, CLEAR_MARKETS } from './../actions/tdexActions';
import { Assets } from './../../utils/constants';
import { TDEXMarket, TDEXProvider } from '../actionTypes/tdexActionTypes';
import { ActionType } from '../../utils/types';
import { ADD_PROVIDER, DELETE_PROVIDER } from '../actions/tdexActions';

export interface TDEXState {
  providers: TDEXProvider[];
  markets: TDEXMarket[];
}

const initialState: TDEXState = {
  providers: [
    { id: -1, name: 'regtest-dev', endpoint: 'http://localhost:9945' },
  ],
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

export interface AssetWithTicker {
  asset: string;
  ticker: string;
  coinGeckoID?: string;
}

export const tradablesAssetsSelector = (sentAsset: string) => ({
  tdex,
}: {
  tdex: TDEXState;
}): AssetWithTicker[] => {
  const assetsData = Object.values(Assets);
  const results: AssetWithTicker[] = [];

  for (const market of tdex.markets) {
    if (
      sentAsset === market.baseAsset &&
      !results.map((r) => r.asset).includes(market.quoteAsset)
    ) {
      results.push({
        asset: market.quoteAsset,
        ticker:
          assetsData.find((a) => a.assetHash === market.quoteAsset)?.ticker ||
          market.quoteAsset.slice(0, 4).toUpperCase(),
        coinGeckoID: assetsData.find((a) => a.assetHash === market.quoteAsset)
          ?.coinGeckoID,
      });
    }

    if (
      sentAsset === market.quoteAsset &&
      !results.map((r) => r.asset).includes(market.baseAsset)
    ) {
      results.push({
        asset: market.baseAsset,
        ticker:
          assetsData.find((a) => a.assetHash === market.baseAsset)?.ticker ||
          market.baseAsset.slice(0, 4).toUpperCase(),
        coinGeckoID: assetsData.find((a) => a.assetHash === market.baseAsset)
          ?.coinGeckoID,
      });
    }
  }

  return results;
};

export default TDEXReducer;
