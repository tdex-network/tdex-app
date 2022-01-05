import type { ActionType } from '../../utils/types';
import type { TDEXProvider, TDEXMarket } from '../actionTypes/tdexActionTypes';

export const ADD_PROVIDERS = 'ADD_PROVIDERS';
export const DELETE_PROVIDER = 'DELETE_PROVIDER';
export const CLEAR_PROVIDERS = 'CLEAR_PROVIDERS';
export const UPDATE_MARKETS = 'UPDATE_MARKETS';
export const ADD_MARKETS = 'ADD_MARKETS';
export const CLEAR_MARKETS = 'CLEAR_MARKETS';

export const clearMarkets = (): ActionType => ({
  type: CLEAR_MARKETS,
});

export const addMarkets = (markets: TDEXMarket[]): ActionType => {
  return {
    type: ADD_MARKETS,
    payload: markets,
  };
};

export const updateMarkets = (): ActionType => {
  return {
    type: UPDATE_MARKETS,
  };
};

export const addProviders = (providers: TDEXProvider[]): ActionType<TDEXProvider[]> => {
  return {
    type: ADD_PROVIDERS,
    payload: providers,
  };
};

export const deleteProvider = (provider: TDEXProvider): ActionType => {
  return {
    type: DELETE_PROVIDER,
    payload: provider,
  };
};

export const clearProviders = (): ActionType => {
  return {
    type: CLEAR_PROVIDERS,
  };
};
