import { ActionType } from '../../../utils/types';
import {
  SET_PROVIDER_ENDPOINT,
  SET_PROVIDER_MARKETS,
  SET_PROVIDER_ASSET_IDS,
  EXECUTE_TRADE,
  TRADE_SUCCESS,
  TRADE_FAIL,
  DISMISS_TRADE_ERROR,
} from '../../actions/exchange/providerActions';

const initialState = {
  endpoint: null,
  markets: [],
  assetIds: [],
  error: null,
  status: '',
};

const providerReducer = (state: any = initialState, action: ActionType) => {
  switch (action.type) {
    case SET_PROVIDER_ENDPOINT:
      return { ...state, endpoint: action.payload };
    case SET_PROVIDER_MARKETS:
      return { ...state, markets: action.payload };
    case SET_PROVIDER_ASSET_IDS:
      return { ...state, assetIds: action.payload };
    case EXECUTE_TRADE:
      return { ...state, status: 'executing' };
    case TRADE_SUCCESS:
      return {
        ...state,
        transactions: [...state.transactions, action.payload],
        status: 'complete',
      };
    case TRADE_FAIL:
      return { ...state, error: action.payload, status: 'fail' };
    case DISMISS_TRADE_ERROR:
      return { ...state, error: null, status: '' };
    default:
      return state;
  }
};

export default providerReducer;
