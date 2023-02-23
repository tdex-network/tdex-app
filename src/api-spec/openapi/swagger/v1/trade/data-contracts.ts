/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface ProtobufAny {
  '@type'?: string;
  [key: string]: any;
}

export interface RpcStatus {
  /** @format int32 */
  code?: number;
  message?: string;
  details?: ProtobufAny[];
}

export interface Tdexv1Balance {
  /** @format uint64 */
  baseAmount?: string;
  /** @format uint64 */
  quoteAmount?: string;
}

export interface Tdexv1CompleteTradeRequest {
  swapComplete?: Tdexv1SwapComplete;
  swapFail?: Tdexv1SwapFail;
}

export interface Tdexv1CompleteTradeResponse {
  txid?: string;
  swapFail?: Tdexv1SwapFail;
}

/** Custom Types */
export interface Tdexv1Fee {
  /** @format int64 */
  basisPoint?: string;
  fixed?: V1Fixed;
}

export interface Tdexv1GetMarketBalanceRequest {
  market?: Tdexv1Market;
}

export interface Tdexv1GetMarketBalanceResponse {
  balance?: V1BalanceWithFee;
}

export interface Tdexv1GetMarketPriceRequest {
  market?: Tdexv1Market;
}

export interface Tdexv1GetMarketPriceResponse {
  /** @format double */
  spotPrice?: number;
  /** @format uint64 */
  minTradableAmount?: string;
}

export interface Tdexv1ListMarketsResponse {
  markets?: Tdexv1MarketWithFee[];
}

export interface Tdexv1Market {
  baseAsset?: string;
  quoteAsset?: string;
}

export interface Tdexv1MarketWithFee {
  market?: Tdexv1Market;
  fee?: Tdexv1Fee;
}

export interface Tdexv1Preview {
  price?: Tdexv1Price;
  fee?: Tdexv1Fee;
  /** @format uint64 */
  amount?: string;
  asset?: string;
  balance?: Tdexv1Balance;
}

export interface Tdexv1PreviewTradeRequest {
  market?: Tdexv1Market;
  type?: Tdexv1TradeType;
  /** @format uint64 */
  amount?: string;
  asset?: string;
}

export interface Tdexv1PreviewTradeResponse {
  previews?: Tdexv1Preview[];
}

export interface Tdexv1Price {
  /** @format double */
  basePrice?: number;
  /** @format double */
  quotePrice?: number;
}

export interface Tdexv1ProposeTradeRequest {
  market?: Tdexv1Market;
  type?: Tdexv1TradeType;
  swapRequest?: Tdexv1SwapRequest;
}

export interface Tdexv1ProposeTradeResponse {
  swapAccept?: Tdexv1SwapAccept;
  swapFail?: Tdexv1SwapFail;
  /** @format uint64 */
  expiryTimeUnix?: string;
}

export interface Tdexv1SwapAccept {
  /** Random unique identifier for the current message */
  id?: string;
  /** indetifier of the SwapRequest message */
  requestId?: string;
  /**
   * The partial signed transaction base64 encoded containing the Responder's
   * signed inputs in a PSBT format
   */
  transaction?: string;
  /**
   * In case of a confidential transaction the blinding key of each confidential
   * input is included. Each blinding key is identified by the prevout script
   * hex encoded.
   */
  inputBlindingKey?: Record<string, string>;
  /**
   * In case of a confidential transaction the blinding key of each confidential
   * output is included. Each blinding key is identified by the output script
   * hex encoded.
   */
  outputBlindingKey?: Record<string, string>;
}

export interface Tdexv1SwapComplete {
  /** Random unique identifier for the current message */
  id?: string;
  /** indetifier of the SwapAccept message */
  acceptId?: string;
  /**
   * The signed transaction base64 encoded containing the Proposers's signed
   * inputs in a PSBT format
   */
  transaction?: string;
}

export interface Tdexv1SwapFail {
  /** Random unique identifier for the current message */
  id?: string;
  /** indetifier of either SwapRequest or SwapAccept message. It can be empty */
  messageId?: string;
  /**
   * The failure code. It can be empty
   * @format int64
   */
  failureCode?: number;
  /** The failure reason messaged */
  failureMessage?: string;
}

export interface Tdexv1SwapRequest {
  /** Random unique identifier for the current message */
  id?: string;
  /**
   * The proposer's quantity
   * @format uint64
   */
  amountP?: string;
  /** The proposer's asset hash */
  assetP?: string;
  /**
   * The responder's quantity
   * @format uint64
   */
  amountR?: string;
  /** The responder's asset hash */
  assetR?: string;
  /** The proposer's unsigned transaction in PSBT format (base64 string) */
  transaction?: string;
  /**
   * In case of a confidential psetv0 transaction the blinding key of each
   * confidential input is included. Each blinding key is identified by the
   * prevout script hex encoded.
   */
  inputBlindingKey?: Record<string, string>;
  /**
   * In case of a confidential psetv0 transaction the blinding key of each
   * confidential output is included. Each blinding key is identified by the
   * output script hex encoded.
   */
  outputBlindingKey?: Record<string, string>;
}

/** @default "TRADE_TYPE_BUY" */
export enum Tdexv1TradeType {
  TRADE_TYPE_BUY = 'TRADE_TYPE_BUY',
  TRADE_TYPE_SELL = 'TRADE_TYPE_SELL',
}

export interface V1BalanceWithFee {
  balance?: Tdexv1Balance;
  fee?: Tdexv1Fee;
}

export interface V1Fixed {
  /** @format int64 */
  baseFee?: string;
  /** @format int64 */
  quoteFee?: string;
}
