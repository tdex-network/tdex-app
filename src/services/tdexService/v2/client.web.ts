import { GrpcWebFetchTransport } from '@protobuf-ts/grpcweb-transport';

import { Tdexv2ContentType } from '../../../api-spec/openapi/swagger/v2/transport/data-contracts';
import { SwapAccept, SwapComplete, SwapRequest } from '../../../api-spec/protobuf/gen/js/tdex/v2/swap_pb';
import * as messages from '../../../api-spec/protobuf/gen/js/tdex/v2/trade_pb';
import type {
  GetMarketBalanceResponse,
  ListMarketsResponse,
  PreviewTradeResponse,
  PreviewTradeRequest,
} from '../../../api-spec/protobuf/gen/js/tdex/v2/trade_pb';
import * as services from '../../../api-spec/protobuf/gen/js/tdex/v2/trade_pb.client';
import * as types from '../../../api-spec/protobuf/gen/js/tdex/v2/types_pb';
import type { TradeType } from '../../../api-spec/protobuf/gen/js/tdex/v2/types_pb';
import { config } from '../../../store/config';
import { useSettingsStore } from '../../../store/settingsStore';
import { LBTC_ASSET } from '../../../utils/constants';
import { getClearTextTorProxyUrl } from '../index';

import type TraderClientInterface from './clientInterface';

export class TraderClient implements TraderClientInterface {
  providerUrl: string;
  client: services.ITradeServiceClient;
  clientType: string = Tdexv2ContentType.CONTENT_TYPE_GRPCWEBTEXT;

  constructor(providerUrl: string, torProxyEndpoint: string = config.torProxy) {
    this.providerUrl = providerUrl;
    const url = new URL(providerUrl);

    // we assume we are in Liquid mainnet
    // TODO check if socks5 proxy is running (ie. Tor Browser)
    if (url.hostname.includes('onion') && !url.protocol.includes('https')) {
      // We use the HTTP1 cleartext endpoint here provided by the public tor reverse proxy
      // https://pkg.go.dev/github.com/tdex-network/tor-proxy@v0.0.3/pkg/torproxy#NewTorProxy
      //host:port/<just_onion_host_without_dot_onion>/[<grpc_package>.<grpc_service>/<grpc_method>]
      this.providerUrl = getClearTextTorProxyUrl(torProxyEndpoint, url);
    }

    this.client = new services.TradeServiceClient(
      new GrpcWebFetchTransport({
        baseUrl: this.providerUrl,
      })
    );
  }

  /**
   * proposeTrade
   * @param market
   * @param tradeType
   * @param swapRequestSerialized
   */
  async proposeTrade(
    { baseAsset, quoteAsset }: types.Market,
    tradeType: TradeType,
    swapRequestSerialized: Uint8Array
  ): Promise<Uint8Array> {
    const network = useSettingsStore.getState().network;
    const market = types.Market.create({ baseAsset, quoteAsset });
    const request = messages.ProposeTradeRequest.create({
      market: market,
      type: tradeType,
      swapRequest: SwapRequest.fromBinary(swapRequestSerialized),
      feeAsset: LBTC_ASSET[network].assetHash, // TODO: make it dynamic
    });
    const call = await this.client.proposeTrade(request);
    if (call.response.swapFail) {
      throw new Error(
        `SwapFail for message id=${call.response.swapFail.id}. Failure code ${call.response.swapFail.failureCode} | reason: ${call.response.swapFail.failureMessage}`
      );
    }
    const swapAcceptMsg = call.response.swapAccept;
    return SwapAccept.toBinary(swapAcceptMsg!);
  }

  /**
   * completeTrade
   * @param swapCompleteSerialized
   */
  async completeTrade(swapCompleteSerialized: Uint8Array): Promise<string> {
    const request = messages.CompleteTradeRequest.create({
      swapComplete: SwapComplete.fromBinary(swapCompleteSerialized),
    });
    const call = await this.client.completeTrade(request);
    if (call.response.swapFail) {
      throw new Error(
        `SwapFail for message id=${call.response.swapFail.id}. Failure code ${call.response.swapFail.failureCode} | reason: ${call.response.swapFail.failureMessage}`
      );
    }
    return call.response.txid;
  }

  async listMarkets(): Promise<ListMarketsResponse['markets']> {
    const call = await this.client.listMarkets(messages.ListMarketsRequest.create());
    return call.response.markets;
  }

  async previewTrade({
    market,
    type,
    amount,
    asset,
    feeAsset,
  }: PreviewTradeRequest): Promise<PreviewTradeResponse['previews']> {
    const marketObj = types.Market.create({ baseAsset: market?.baseAsset, quoteAsset: market?.quoteAsset });
    const request = messages.PreviewTradeRequest.create({
      market: marketObj,
      type,
      amount: String(amount),
      asset,
      feeAsset,
    });
    const call = await this.client.previewTrade(request);
    return call.response.previews;
  }

  async getMarketBalance({ baseAsset, quoteAsset }: types.Market): Promise<GetMarketBalanceResponse['balance']> {
    const market = types.Market.create({ baseAsset, quoteAsset });
    const request = messages.GetMarketBalanceRequest.create({ market });
    const call = await this.client.getMarketBalance(request);
    return call.response.balance;
  }
}
