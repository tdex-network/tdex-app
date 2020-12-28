import { ActionType } from '../../utils/types';
import { RatesInterface } from '../actionTypes/ratesActionTypes';
import { CACHE_COINGECKO_COINS, SET_RATES } from '../actions/ratesActions';

const initialState = {
  coingeckoCache: null,
  byCurrency: {},
};

const ratesReducer = (state = initialState, action: ActionType) => {
  switch (action.type) {
    case CACHE_COINGECKO_COINS:
      return {
        ...state,
        coingeckoCache: action.payload,
      };
    case SET_RATES: {
      const previousRates: RatesInterface = state.byCurrency;
      const byCurrency: RatesInterface = previousRates;

      for (const currency in action.payload) {
        byCurrency[currency] = {
          ...previousRates[currency],
          ...action.payload[currency],
        };
      }

      return {
        ...state,
        byCurrency,
      };
    }
    default:
      return state;
  }
};

export default ratesReducer;
