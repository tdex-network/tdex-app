import { ActionType } from '../../utils/types';
import {
  CLEAR_PIN,
  CLEAR_WALLET_STATE,
  SET_IS_AUTH,
  SET_MNEMONIC,
  SET_PIN,
} from '../actions/walletActions';

const initialState = {
  isAuth: false,
  pin: '',
  mnemonic: '',
};

const walletReducer = (state = initialState, action: ActionType) => {
  switch (action.type) {
    case SET_MNEMONIC:
      return { ...state, mnemonic: action.payload };
    case SET_IS_AUTH:
      return { ...state, isAuth: action.payload };
    case SET_PIN:
      return { ...state, pin: action.payload };
    case CLEAR_PIN:
      return { ...state, pin: '' };
    case CLEAR_WALLET_STATE:
      return { ...initialState };
    default:
      return state;
  }
};

export default walletReducer;
