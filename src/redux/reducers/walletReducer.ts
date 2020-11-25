import { ActionType } from '../../utils/types';
import {
  CLEAR_PIN,
  CLEAR_WALLET_STATE,
  SET_ADDRESS,
  SET_ASSETS,
  SET_COINS_LIST,
  SET_COINS_RATES,
  SET_IS_AUTH,
  SET_MNEMONIC,
  SET_PIN,
} from '../actions/walletActions';

const initialState = {
  isAuth: false,
  pin: '',
  mnemonic: '',
  address: null,
  coinsList: null,
  coinsRates: null,
};

const walletReducer = (state = initialState, action: ActionType) => {
  switch (action.type) {
    case SET_MNEMONIC:
      return { ...state, mnemonic: action.payload };
    case SET_ADDRESS:
      return { ...state, address: action.payload };
    case SET_IS_AUTH:
      return { ...state, isAuth: action.payload };
    case SET_PIN:
      return { ...state, pin: action.payload };
    case SET_ASSETS:
      return { ...state, assets: action.payload };
    case SET_COINS_LIST:
      return { ...state, coinsList: action.payload };
    case SET_COINS_RATES:
      return { ...state, coinsRates: action.payload };
    case CLEAR_PIN:
      return { ...state, pin: '' };
    case CLEAR_WALLET_STATE:
      return { ...initialState };
    default:
      return state;
  }
};

export default walletReducer;
