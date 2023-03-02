import { GrpcWebFetchTransport } from '@protobuf-ts/grpcweb-transport';

import { Tdexv2ContentType } from '../../../api-spec/openapi/swagger/v2/transport/data-contracts';
import { SwapAccept, SwapComplete, SwapRequest } from '../../../api-spec/protobuf/gen/js/tdex/v2/swap_pb';
import * as messages from '../../../api-spec/protobuf/gen/js/tdex/v2/trade_pb';
import * as services from '../../../api-spec/protobuf/gen/js/tdex/v2/trade_pb.client';
import * as types from '../../../api-spec/protobuf/gen/js/tdex/v2/types_pb';
import type { Balance, TradeType } from '../../../api-spec/protobuf/gen/js/tdex/v2/types_pb';
import { getClearTextTorProxyUrl } from '../index';

import type TraderClientInterface from './clientInterface';

const DEFAULT_TOR_PROXY = 'https://torproxy.tdex.network';

export class TraderClient implements TraderClientInterface {
  providerUrl: string;
  client: services.ITradeServiceClient;
  clientType: string = Tdexv2ContentType.CONTENT_TYPE_GRPCWEBTEXT;

  constructor(providerUrl: string, torProxyEndpoint: string = DEFAULT_TOR_PROXY) {
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
    const market = types.Market.create({ baseAsset, quoteAsset });
    const request = messages.ProposeTradeRequest.create({
      market: market,
      type: tradeType,
      swapRequest: SwapRequest.fromBinary(swapRequestSerialized),
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

  async markets(): Promise<{ baseAsset: string; quoteAsset: string; feeBasisPoint: number }[]> {
    const call = await this.client.listMarkets(messages.ListMarketsRequest.create());
    return call.response!.markets.map((mktWithFee: types.MarketWithFee) => ({
      baseAsset: mktWithFee!.market!.baseAsset,
      quoteAsset: mktWithFee!.market!.quoteAsset,
      feeBasisPoint: Number(mktWithFee!.fee!.percentageFee),
    }));
  }

  async marketPrice(
    { baseAsset, quoteAsset }: types.Market,
    tradeType: TradeType,
    amount: number,
    asset: string
  ): Promise<types.Preview[]> {
    const market = types.Market.create({ baseAsset, quoteAsset });
    const request = messages.PreviewTradeRequest.create({
      market: market,
      type: tradeType,
      amount: String(amount),
      asset: asset,
    });
    const call = await this.client.previewTrade(request);
    return call.response!.previews.map((preview: types.Preview) => preview);
  }

  async balance({ baseAsset, quoteAsset }: types.Market): Promise<Balance> {
    const market = types.Market.create({ baseAsset, quoteAsset });
    const request = messages.GetMarketBalanceRequest.create({ market });
    const call = await this.client.getMarketBalance(request);
    return call.response.balance!;
  }
}
