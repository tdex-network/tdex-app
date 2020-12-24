import { ActionType } from '../../../utils/types';
import {
  SHOW_SEARCH,
  HIDE_SEARCH,
  SET_SEARCH_ASSET_LIST,
  SEARCH_ASSET,
} from '../../actions/exchange/searchActions';

const initialState = {
  query: '',
  visibility: false,
  party: null,
  assets: [],
};

const searchReducer = (state = initialState, action: ActionType) => {
  switch (action.type) {
    case SHOW_SEARCH:
      return { ...state, visibility: true, party: action.payload };
    case HIDE_SEARCH:
      return { ...state, visibility: false };
    case SET_SEARCH_ASSET_LIST:
      return { ...state, assets: action.payload };
    case SEARCH_ASSET:
      return { ...state, query: action.payload };
    default:
      return state;
  }
};

export default searchReducer;
