import { ActionType } from '../../utils/types';
import { SET_RATES } from '../actions/ratesActions';

interface RateState {
  prices: Record<string, number>;
}

const initialState: RateState = {
  prices: {},
};

const ratesReducer = (state = initialState, action: ActionType) => {
  switch (action.type) {
    case SET_RATES:
      return { ...state, prices: action.payload };
    default:
      return state;
  }
};

export const rateSelectorFactory = (crypto: string) => ({
  rates,
}: {
  rates: RateState;
}) => {
  rates.prices[crypto];
};

export default ratesReducer;
