import { ActionType } from '../../utils/types';
import { SET_TRANSACTIONS } from '../actions/transactionsActions';

const initialState = {
  data: null,
};

const transactionsReducer = (state: any = initialState, action: ActionType) => {
  switch (action.type) {
    case SET_TRANSACTIONS:
      return { ...state, data: action.payload };
    default:
      return state;
  }
};

export default transactionsReducer;
