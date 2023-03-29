import type {
  GetMarketBalanceResponse,
  ListMarketsResponse,
  PreviewTradeRequest,
  PreviewTradeResponse,
} from '../../../api-spec/protobuf/gen/js/tdex/v1/trade_pb';
import type { Market, TradeType } from '../../../api-spec/protobuf/gen/js/tdex/v1/types_pb';

export default interface TraderClientInterface {
  providerUrl: string;
  client: any;
  clientType: string;

  proposeTrade(
    { baseAsset, quoteAsset }: Market,
    tradeType: TradeType,
    swapRequestSerialized: Uint8Array
  ): Promise<Uint8Array>;

  completeTrade(swapCompleteSerialized: Uint8Array): Promise<string>;

  markets(): Promise<ListMarketsResponse['markets']>;

  marketPrice(arg: PreviewTradeRequest): Promise<PreviewTradeResponse['previews']>;

  balance({ baseAsset, quoteAsset }: Market): Promise<GetMarketBalanceResponse['balance']>;
}
