import type { AnyAction } from 'redux';

export const UPDATE_PRICES = 'UPDATE_PRICES';
export const SET_PRICES = 'SET_PRICES';
export const SET_LBTC_PRICES = 'SET_LBTC_PRICES';

export const updatePrices = (): AnyAction => {
  return {
    type: UPDATE_PRICES,
  };
};

export const setPrices = (prices: Record<string, number>): AnyAction => {
  return {
    type: SET_PRICES,
    payload: prices,
  };
};

export const setLBTCPrices = (prices: Record<string, number>): AnyAction => {
  return {
    type: SET_LBTC_PRICES,
    payload: prices,
  };
};
