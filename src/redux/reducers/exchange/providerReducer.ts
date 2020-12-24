import { ActionType } from '../../../utils/types';
import {
  SET_PROVIDER_ENDPOINT,
  SET_PROVIDER_MARKETS,
  SET_PROVIDER_ASSETS,
} from '../../actions/exchange/providerActions';

const initialState = {
  endpoint: null,
  markets: [],
  assets: [],
};

const providerReducer = (state: any = initialState, action: ActionType) => {
  switch (action.type) {
    case SET_PROVIDER_ENDPOINT:
      return { ...state, endpoint: action.payload };
    case SET_PROVIDER_MARKETS:
      return { ...state, markets: action.payload };
    case SET_PROVIDER_ASSETS:
      return { ...state, assets: action.payload };
    default:
      return state;
  }
};

export default providerReducer;
