import { ActionType } from '../../utils/types';
import {
  SET_TRANSACTIONS,
  SET_TRANSACTIONS_LOADING,
} from '../actions/transactionsActions';

const initialState = {
  data: null,
  loading: true,
};

const transactionsReducer = (state: any = initialState, action: ActionType) => {
  switch (action.type) {
    case SET_TRANSACTIONS:
      return { ...state, data: action.payload };
    case SET_TRANSACTIONS_LOADING:
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

export default transactionsReducer;
