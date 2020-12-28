import { ActionType } from '../../../utils/types';
import {
  SET_PROVIDER_ENDPOINT,
  SET_PROVIDER_MARKETS,
  SET_PROVIDER_ASSET_IDS,
} from '../../actions/exchange/providerActions';

const initialState = {
  endpoint: null,
  markets: [],
  assetIds: [],
};

const providerReducer = (state: any = initialState, action: ActionType) => {
  switch (action.type) {
    case SET_PROVIDER_ENDPOINT:
      return { ...state, endpoint: action.payload };
    case SET_PROVIDER_MARKETS:
      return { ...state, markets: action.payload };
    case SET_PROVIDER_ASSET_IDS:
      return { ...state, assetIds: action.payload };
    default:
      return state;
  }
};

export default providerReducer;
