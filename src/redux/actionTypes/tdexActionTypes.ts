export interface TDEXProvider {
  id?: number;
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
