import { ActionType } from '../../utils/types';
import {
  SET_TRANSACTIONS,
  SET_TRANSACTIONS_LOADING,
  SET_WITHDRAWAL_DETAILS,
  SET_WITHDRAWAL_LOADING,
} from '../actions/transactionsActions';

const initialState = {
  data: null,
  loading: true,
  withdrawalDetails: null,
  withdrawalLoading: null,
};

const transactionsReducer = (state: any = initialState, action: ActionType) => {
  switch (action.type) {
    case SET_TRANSACTIONS:
      return { ...state, data: action.payload };
    case SET_TRANSACTIONS_LOADING:
      return { ...state, loading: action.payload };
    case SET_WITHDRAWAL_DETAILS:
      return { ...state, withdrawalDetails: action.payload };
    case SET_WITHDRAWAL_LOADING:
      return { ...state, withdrawalLoading: action.payload };
    default:
      return state;
  }
};

export default transactionsReducer;
