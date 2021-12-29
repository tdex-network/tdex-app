import type { TradeType } from 'tdex-sdk';

export interface TDEXProvider {
  name: string;
  endpoint: string;
}

export interface TDEXMarket {
  baseAsset: string;
  quoteAsset: string;
  provider: TDEXProvider;
  baseAmount?: number;
  quoteAmount?: number;
}

export interface TDEXTrade {
  market: TDEXMarket;
  type: TradeType;
}
