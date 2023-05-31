/* eslint-disable */
// @generated by protobuf-ts 2.9.0 with parameter add_pb_suffix,eslint_disable,ts_nocheck,long_type_string,output_javascript
// @generated from protobuf file "tdex/v1/trade.proto" (package "tdex.v1", syntax proto3)
// tslint:disable
// @ts-nocheck
import { TradeService } from "./trade_pb";
import { stackIntercept } from "@protobuf-ts/runtime-rpc";
/**
 * @generated from protobuf service tdex.v1.TradeService
 */
export class TradeServiceClient {
    constructor(_transport) {
        this._transport = _transport;
        this.typeName = TradeService.typeName;
        this.methods = TradeService.methods;
        this.options = TradeService.options;
    }
    /**
     * ListMarkets lists all the markets open for trading.
     *
     * @generated from protobuf rpc: ListMarkets(tdex.v1.ListMarketsRequest) returns (tdex.v1.ListMarketsResponse);
     */
    listMarkets(input, options) {
        const method = this.methods[0], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * GetMarketBalance retutns the balance of the two current reserves of the
     * given market.
     *
     * @generated from protobuf rpc: GetMarketBalance(tdex.v1.GetMarketBalanceRequest) returns (tdex.v1.GetMarketBalanceResponse);
     */
    getMarketBalance(input, options) {
        const method = this.methods[1], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * GetMarketPrice retutns the spot price for the requested market and its
     * minimum tradable amount of base asset.
     *
     * @generated from protobuf rpc: GetMarketPrice(tdex.v1.GetMarketPriceRequest) returns (tdex.v1.GetMarketPriceResponse);
     */
    getMarketPrice(input, options) {
        const method = this.methods[2], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * PreviewTrade returns a counter amount and asset in response to the
     * provided ones and a trade type for a market.
     *
     * The trade type can assume values BUY or SELL and it always refer to the
     * fixed base asset.
     * For example:
     *  * if trade type is BUY, it means the trader wants to buy base asset funds.
     *  * if trade type is SELL, it means the trader wants to sell base asset funds.
     *
     * @generated from protobuf rpc: PreviewTrade(tdex.v1.PreviewTradeRequest) returns (tdex.v1.PreviewTradeResponse);
     */
    previewTrade(input, options) {
        const method = this.methods[3], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * ProposeTrade allows a trader to present a SwapRequest. The service answers
     * with a SwapAccept, filling the request's partial transaction, + an
     * expiration time to complete the swap when accepting the swap, or,
     * otherwise, with a SwapFail containg the reason for the rejection of the
     * proposal.
     *
     * @generated from protobuf rpc: ProposeTrade(tdex.v1.ProposeTradeRequest) returns (tdex.v1.ProposeTradeResponse);
     */
    proposeTrade(input, options) {
        const method = this.methods[4], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
    /**
     * CompleteTrade can be used by the trader to let the daemon finalizing,
     * extracting, and broadcasting the swap transaction, once he's signed his
     * inputs.
     * This is not mandatory, the trader can do the steps above on his own
     * alternatively.
     *
     * @generated from protobuf rpc: CompleteTrade(tdex.v1.CompleteTradeRequest) returns (tdex.v1.CompleteTradeResponse);
     */
    completeTrade(input, options) {
        const method = this.methods[5], opt = this._transport.mergeOptions(options);
        return stackIntercept("unary", this._transport, method, opt, input);
    }
}
