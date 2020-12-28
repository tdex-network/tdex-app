import { RatesInterface } from '../actionTypes/ratesActionTypes';

export const GET_RATES = 'GET_RATES';
export const SET_RATES = 'SET_RATES';
export const CACHE_COINGECKO_COINS = 'CACHE_COINGECKO_COINS';

export const getCoinRates = (
  tickers: Array<string>,
  currencies: Array<string>
) => {
  return {
    type: GET_RATES,
    payload: {
      tickers,
      currencies,
    },
  };
};

export const setRates = (rates: RatesInterface) => {
  return {
    type: SET_RATES,
    payload: rates,
  };
};

export const cacheCoingeckoCoins = (coingeckoCache: any) => {
  return {
    type: CACHE_COINGECKO_COINS,
    payload: coingeckoCache,
  };
};
