import { ActionType } from '../../../utils/types';
import {
  SET_MARKET,
  SET_TRADE_TYPE,
  SET_SEND_ASSET,
  SET_SEND_AMOUNT,
  SET_RECEIVE_ASSET,
  SET_RECEIVE_AMOUNT,
  SWAP_ASSETS,
  RESET_TRADE,
} from '../../actions/exchange/tradeActions';

const initialState = {
  market: null,
  tradeType: null,
  sendAsset: null,
  receiveAsset: null,
  sendAmount: 0,
  receiveAmount: 0,
  transactions: [],
};

const tradeReducer = (state = initialState, action: ActionType) => {
  switch (action.type) {
    case SET_MARKET:
      return { ...state, market: action.payload };
    case SET_TRADE_TYPE:
      return { ...state, tradeType: action.payload };
    case SET_SEND_ASSET:
      return { ...state, sendAsset: action.payload, sendAmount: 0 };
    case SET_SEND_AMOUNT:
      return { ...state, sendAmount: action.payload };
    case SET_RECEIVE_ASSET:
      return { ...state, receiveAsset: action.payload, receiveAmount: 0 };
    case SET_RECEIVE_AMOUNT:
      return { ...state, receiveAmount: action.payload };
    case SWAP_ASSETS:
      return {
        ...state,
        sendAsset: state.receiveAsset,
        receiveAsset: state.sendAsset,
        sendAmount: 0,
        receiveAmount: 0,
      };
    case RESET_TRADE:
      return {
        ...initialState,
        transactions: state.transactions,
      };
    default:
      return state;
  }
};

export default tradeReducer;
