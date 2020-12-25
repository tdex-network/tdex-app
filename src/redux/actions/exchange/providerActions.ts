import { ActionType } from '../../../utils/types';
import { MarketInterface } from 'tdex-sdk';

export const SET_PROVIDER_ENDPOINT = 'SET_PROVIDER_ENDPOINT';
export const SET_PROVIDER_MARKETS = 'SET_PROVIDER_MARKETS';
export const SET_PROVIDER_ASSETS = 'SET_PROVIDER_ASSETS';
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

export const setProviderAssets = (assets: any): ActionType => {
  return {
    type: SET_PROVIDER_ASSETS,
    payload: assets,
  };
};

export const executeTrade = (): ActionType => {
  return {
    type: EXECUTE_TRADE,
  };
};
