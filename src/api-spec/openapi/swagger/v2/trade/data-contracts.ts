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

export interface Tdexv2Balance {
  /** @format uint64 */
  baseAmount?: string;
  /** @format uint64 */
  quoteAmount?: string;
}

export interface Tdexv2CompleteTradeRequest {
  swapComplete?: Tdexv2SwapComplete;
  swapFail?: Tdexv2SwapFail;
}

export interface Tdexv2CompleteTradeResponse {
  txid?: string;
  swapFail?: Tdexv2SwapFail;
}

export interface Tdexv2Fee {
  /** Percentage fee on both assets of the market in basis point. */
  percentageFee?: V2MarketFee;
  /** Fixed fee on both assets of the market in satoshi. */
  fixedFee?: V2MarketFee;
}

export interface Tdexv2GetMarketBalanceRequest {
  market?: Tdexv2Market;
}

export interface Tdexv2GetMarketBalanceResponse {
  balance?: Tdexv2Balance;
  fee?: Tdexv2Fee;
}

export interface Tdexv2GetMarketPriceRequest {
  market?: Tdexv2Market;
}

export interface Tdexv2GetMarketPriceResponse {
  /** @format double */
  spotPrice?: number;
  /** @format uint64 */
  minTradableAmount?: string;
}

export interface Tdexv2ListMarketsResponse {
  markets?: Tdexv2MarketWithFee[];
}

export interface Tdexv2Market {
  baseAsset?: string;
  quoteAsset?: string;
}

export interface Tdexv2MarketWithFee {
  market?: Tdexv2Market;
  fee?: Tdexv2Fee;
}

export interface Tdexv2Preview {
  /** The price of the market. */
  price?: Tdexv2Price;
  /** The fees of the market. */
  fee?: Tdexv2Fee;
  /**
   * The previewd amount (fees excluded).
   * @format uint64
   */
  amount?: string;
  /** The asset of the previewed amount (fees excluded). */
  asset?: string;
  /**
   * The previewed fee amount,
   * @format uint64
   */
  feeAmount?: string;
  /** The asset of the previewed fee amount, */
  feeAsset?: string;
}

export interface Tdexv2PreviewTradeRequest {
  market?: Tdexv2Market;
  type?: Tdexv2TradeType;
  /** @format uint64 */
  amount?: string;
  asset?: string;
  feeAsset?: string;
}

export interface Tdexv2PreviewTradeResponse {
  previews?: Tdexv2Preview[];
}

export interface Tdexv2Price {
  /** @format double */
  basePrice?: number;
  /** @format double */
  quotePrice?: number;
}

export interface Tdexv2ProposeTradeRequest {
  market?: Tdexv2Market;
  type?: Tdexv2TradeType;
  swapRequest?: Tdexv2SwapRequest;
}

export interface Tdexv2ProposeTradeResponse {
  swapAccept?: Tdexv2SwapAccept;
  swapFail?: Tdexv2SwapFail;
  /** @format uint64 */
  expiryTimeUnix?: string;
}

export interface Tdexv2SwapAccept {
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
   * In case of psetv2 transaction, the original list of trader's unblinded inputs,
   * including also those of the inputs added by the provider.
   */
  unblindedInputs?: V2UnblindedInput[];
}

export interface Tdexv2SwapComplete {
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

export interface Tdexv2SwapFail {
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

export interface Tdexv2SwapRequest {
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
  /** The proposer's unsigned transaction in PSET v2 format (base64 string) */
  transaction?: string;
  /**
   * The fee amount charged to the proposer by the provider.
   * @format uint64
   */
  feeAmount?: string;
  /** The asset hash of the fee charged to the proposer. */
  feeAsset?: string;
  /**
   * The list of trader's unblinded inputs data, even in case they are
   * unconfidential.
   */
  unblindedInputs?: V2UnblindedInput[];
}

/** @default "TRADE_TYPE_BUY" */
export enum Tdexv2TradeType {
  TRADE_TYPE_BUY = 'TRADE_TYPE_BUY',
  TRADE_TYPE_SELL = 'TRADE_TYPE_SELL',
}

export interface V2MarketFee {
  /** @format int64 */
  baseAsset?: string;
  /** @format int64 */
  quoteAsset?: string;
}

export interface V2UnblindedInput {
  /**
   * Index of the transaction input of reference.
   * @format int64
   */
  index?: number;
  /** Unblinded asset. */
  asset?: string;
  /**
   * Unblinded amount.
   * @format uint64
   */
  amount?: string;
  /** Asset blinider when blinding the prevout. */
  assetBlinder?: string;
  /** Amount blinider used when blinding the prevout. */
  amountBlinder?: string;
}
