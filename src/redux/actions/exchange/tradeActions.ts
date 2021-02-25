import { ActionType } from '../../../utils/types';
// import { MarketInterface, TradeType } from 'tdex-sdk';

export const SET_MARKET = 'SET_MARKET';
export const SET_TRADE_TYPE = 'SET_TRADE_TYPE';
export const SET_SEND_ASSET = 'SET_SEND_ASSET';
export const SET_RECEIVE_ASSET = 'SET_RECEIVE_ASSET';
export const SET_SEND_AMOUNT = 'SET_SEND_AMOUNT';
export const SET_RECEIVE_AMOUNT = 'SET_RECEIVE_AMOUNT';
export const SWAP_ASSETS = 'SWAP_ASSETS';
export const RESET_TRADE = 'RESET_TRADE';
export const ADD_TRANSACTION = 'ADD_TRANSACTION';

// export const setMarket = (market: MarketInterface): ActionType => {
//   return {
//     type: SET_MARKET,
//     payload: market,
//   };
// };

// export const setTradeType = (tradeType: TradeType): ActionType => {
//   return {
//     type: SET_TRADE_TYPE,
//     payload: tradeType,
//   };
// };

export const setSendAsset = (baseCurrency: string): ActionType => {
  return {
    type: SET_SEND_ASSET,
    payload: baseCurrency,
  };
};

export const setReceiveAsset = (quoteCurrency: string): ActionType => {
  return {
    type: SET_RECEIVE_ASSET,
    payload: quoteCurrency,
  };
};

export const setSendAmount = (amount: number): ActionType => {
  return {
    type: SET_SEND_AMOUNT,
    payload: amount,
  };
};

export const setReceiveAmount = (amount: number): ActionType => {
  return {
    type: SET_RECEIVE_AMOUNT,
    payload: amount,
  };
};

export const swapAssets = (): ActionType => {
  return {
    type: SWAP_ASSETS,
  };
};

export const resetTrade = (): ActionType => {
  return {
    type: RESET_TRADE,
  };
};

export const addTransaction = (transaction: any): ActionType => {
  return {
    type: ADD_TRANSACTION,
    payload: transaction,
  };
};
