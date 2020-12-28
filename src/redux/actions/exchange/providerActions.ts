import { ActionType } from '../../../utils/types';
import { MarketInterface } from 'tdex-sdk';

export const SET_PROVIDER_ENDPOINT = 'SET_PROVIDER_ENDPOINT';
export const SET_PROVIDER_MARKETS = 'SET_PROVIDER_MARKETS';
export const SET_PROVIDER_ASSET_IDS = 'SET_PROVIDER_ASSET_IDS';
export const ESTIMATE_PRICE = 'ESTIMATE_PRICE';
export const EXECUTE_TRADE = 'EXECUTE_TRADE';

export const setProviderEndpoint = (endpoint: string): ActionType => {
  return {
    type: SET_PROVIDER_ENDPOINT,
    payload: endpoint,
  };
};

export const setProviderMarkets = (
  markets: Array<MarketInterface>
): ActionType => {
  return {
    type: SET_PROVIDER_MARKETS,
    payload: markets,
  };
};

export const setProviderAssetIds = (assetIds: any): ActionType => {
  return {
    type: SET_PROVIDER_ASSET_IDS,
    payload: assetIds,
  };
};

export const estimatePrice = (party: string): ActionType => {
  return {
    type: ESTIMATE_PRICE,
    payload: party,
  };
};

export const executeTrade = (): ActionType => {
  return {
    type: EXECUTE_TRADE,
  };
};
