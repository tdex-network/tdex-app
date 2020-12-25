import { ActionType } from '../../../utils/types';
import { MarketInterface, TradeType } from 'tdex-sdk';

export const SET_MARKET = 'SET_MARKET';
export const SET_TRADE_TYPE = 'SET_TRADE_TYPE';
export const SET_SEND_ASSET = 'SET_SEND_ASSET';
export const SET_RECEIVE_ASSET = 'SET_RECEIVE_ASSET';
export const SET_SEND_AMOUNT = 'SET_SEND_AMOUNT';
export const SET_RECEIVE_AMOUNT = 'SET_RECEIVE_AMOUNT';
export const ESTIMATE_SEND_AMOUNT = 'ESTIMATE_SEND_AMOUNT';
export const ESTIMATE_RECEIVE_AMOUNT = 'ESTIMATE_RECEIVE_AMOUNT';
export const SET_TRADABLE = 'SET_TRADABLE';
export const SWAP_ASSETS = 'SWAP_ASSETS';
export const COMPLETE_TRADE = 'COMPLETE_TRADE';
export const RESET_TRADE = 'RESET_TRADE';

export const setMarket = (market: MarketInterface): ActionType => {
  return {
    type: SET_MARKET,
    payload: market,
  };
};

export const setTradeType = (tradeType: TradeType): ActionType => {
  return {
    type: SET_TRADE_TYPE,
    payload: tradeType,
  };
};

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

export const estimateSendAmount = (): ActionType => {
  return {
    type: ESTIMATE_SEND_AMOUNT,
  };
};

export const estimateReceiveAmount = (): ActionType => {
  return {
    type: ESTIMATE_RECEIVE_AMOUNT,
  };
};

export const setTradable = (tradable: boolean): ActionType => {
  return {
    type: SET_TRADABLE,
    payload: tradable,
  };
};

export const swapAssets = (): ActionType => {
  return {
    type: SWAP_ASSETS,
  };
};

export const completeTrade = (transaction: any): ActionType => {
  return {
    type: COMPLETE_TRADE,
    payload: transaction,
  };
};

export const resetTrade = (): ActionType => {
  return {
    type: RESET_TRADE,
  };
};
