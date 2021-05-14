import { ActionType } from '../../utils/types';
import { SET_LBTC_PRICES, SET_PRICES } from '../actions/ratesActions';

export interface RateState {
  prices: Record<string, number>; // prices in fiat specified in settings reducer
  lbtcPrices: Record<string, number>; // prices in btc denomination for diagram
}

const initialState: RateState = {
  prices: {},
  lbtcPrices: {},
};

const ratesReducer = (
  state: RateState = initialState,
  action: ActionType
): RateState => {
  switch (action.type) {
    case SET_LBTC_PRICES:
      return { ...state, lbtcPrices: action.payload };
    case SET_PRICES:
      return { ...state, prices: action.payload };
    default:
      return state;
  }
};

export const rateSelectorFactory =
  (crypto: string) =>
  ({ rates }: { rates: RateState }) =>
    rates.prices[crypto];

export default ratesReducer;
