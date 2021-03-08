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
  providers: [],
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

export default TDEXReducer;
