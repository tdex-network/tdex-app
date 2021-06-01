import type { ActionType } from '../../utils/types';
import type { TDEXProvider, TDEXMarket } from '../actionTypes/tdexActionTypes';

export const ADD_PROVIDER = 'ADD_PROVIDER_ENDPOINT';
export const DELETE_PROVIDER = 'DELETE_PROVIDER';
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

let nextId = 0;

export const addProvider = (provider: TDEXProvider): ActionType => {
  return {
    type: ADD_PROVIDER,
    payload: { ...provider, id: nextId++ },
  };
};

export const deleteProvider = (provider: TDEXProvider): ActionType => {
  return {
    type: DELETE_PROVIDER,
    payload: provider,
  };
};

export const updateMarkets = (): ActionType => {
  return {
    type: UPDATE_MARKETS,
  };
};
