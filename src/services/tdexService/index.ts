import axios from 'axios';

import { TradeType } from '../../api-spec/protobuf/gen/js/tdex/v2/types_pb';
import type { TDEXMarket, TDEXProvider } from '../../store/tdexStore';
import type { CoinSelectionForTrade, ScriptDetails } from '../../store/walletStore';
import type { NetworkString } from '../../utils/constants';
import { AppError, NoMarketsAvailableForSelectedPairError } from '../../utils/errors';
// Self import for unit testing
import type { SignerInterface } from '../signerService';

import { TraderClient } from './client.web';
import { Discoverer } from './discoverer';
import type { Discovery } from './discovery';
import { bestBalanceDiscovery, bestPriceDiscovery, combineDiscovery } from './discovery';
import * as tdex from './index';
import { Trade } from './trade.web';
import type { MarketInterface, TradeOrder } from './tradeCore';

const TDexRegistryMainnet = 'https://raw.githubusercontent.com/TDex-network/tdex-registry/master/registry.json';
const TDexRegistryTestnet = 'https://raw.githubusercontent.com/tdex-network/tdex-registry/testnet/registry.json';

export async function getProvidersFromTDexRegistry(network: NetworkString): Promise<TDEXProvider[]> {
  if (network === 'testnet') {
    return (await axios.get(TDexRegistryTestnet)).data;
  }
  return (await axios.get(TDexRegistryMainnet)).data;
}

export async function getMarketsFromProvider(
  p: TDEXProvider,
  torProxy = 'https://proxy.tdex.network'
): Promise<TDEXMarket[]> {
  const client = new TraderClient(p.endpoint, torProxy);
  const markets: MarketInterface[] = await client.markets();
  const results: TDEXMarket[] = [];
  for (const market of markets) {
    const balance = (await client.balance(market)).balance;
    results.push({
      ...market,
      provider: p,
      baseAmount: balance?.baseAmount,
      quoteAmount: balance?.quoteAmount,
    });
  }
  return results;
}

// Find all assets in markets tradable with the asset `asset`
export function getTradablesAssets(markets: TDEXMarket[], asset: string): string[] {
  const tradable: string[] = [];
  for (const market of markets) {
    if (asset === market.baseAsset && !tradable.includes(market.quoteAsset)) {
      tradable.push(market.quoteAsset);
    }
    if (asset === market.quoteAsset && !tradable.includes(market.baseAsset)) {
      tradable.push(market.baseAsset);
    }
  }
  return tradable;
}

export function createTraderClient(endpoint: string, proxy = 'https://proxy.tdex.network'): TraderClient {
  return new TraderClient(endpoint, proxy);
}

// Create discoverer object for a specific set of trader clients
export function createDiscoverer(
  orders: TradeOrder[],
  discovery: Discovery,
  errorHandler?: (err: any) => Promise<void>
): Discoverer {
  return new Discoverer(orders, discovery, errorHandler);
}

function createTradeFromTradeOrder(
  order: TradeOrder,
  explorerLiquidAPI: string,
  coinSelectionForTrade: CoinSelectionForTrade,
  signer: SignerInterface,
  masterBlindingKey: string,
  network: NetworkString,
  protoVersion: 'v1' | 'v2',
  torProxy = 'https://proxy.tdex.network'
): Trade {
  return new Trade(
    {
      explorerUrl: explorerLiquidAPI,
      providerUrl: order.traderClient.providerUrl,
      coinSelectionForTrade,
      protoVersion: protoVersion,
      chain: network,
      masterBlindingKey,
      signer: signer,
    },
    torProxy
  );
}

/**
 * make and broadcast the swap transaction
 * @param order the selected trade using to swap
 * @param known the data inputs by the user
 * @param explorerLiquidAPI the esplora URL
 * @param coinSelectionForTrade
 * @param torProxy
 * @param signer
 * @param network
 * @param protoVersion
 * @param addressForChangeOutput
 * @param addressForSwapOutput
 * @param masterBlindingKey
 */
export async function makeTrade(
  order: TradeOrder,
  known: { amount: number; asset: string },
  explorerLiquidAPI: string,
  coinSelectionForTrade: CoinSelectionForTrade,
  signer: SignerInterface,
  masterBlindingKey: string, // Only necessary for protos v1
  network: NetworkString,
  protoVersion: 'v1' | 'v2',
  addressForChangeOutput: ScriptDetails,
  addressForSwapOutput: ScriptDetails,
  torProxy?: string
): Promise<string> {
  const trader = createTradeFromTradeOrder(
    order,
    explorerLiquidAPI,
    coinSelectionForTrade,
    signer,
    masterBlindingKey,
    network,
    protoVersion,
    torProxy
  );
  try {
    const args = { ...known, market: order.market, addressForSwapOutput, addressForChangeOutput };
    const promise = order.type === TradeType.BUY ? trader.buy(args) : trader.sell(args);
    const txid = await promise;
    if (!txid) {
      throw new Error('Transaction not broadcasted');
    }
    return txid;
  } catch (err) {
    console.error('trade error:', err);
    throw new AppError(0, (err as Error).message);
  }
}

/**
 * Construct all the TradeOrder from a set of markets
 * @param markets the set of available markets
 * @param sentAsset the asset to sent
 * @param receivedAsset the asset to receive
 * @param torProxy
 */
export function computeOrders(
  markets: TDEXMarket[],
  sentAsset: string,
  receivedAsset: string,
  torProxy?: string
): TradeOrder[] {
  const trades: TradeOrder[] = [];
  for (const market of markets) {
    if (sentAsset === market.baseAsset && receivedAsset === market.quoteAsset) {
      trades.push({
        market,
        type: TradeType.SELL,
        traderClient: tdex.createTraderClient(market.provider.endpoint, torProxy),
      });
    }
    if (sentAsset === market.quoteAsset && receivedAsset === market.baseAsset) {
      trades.push({
        market,
        type: TradeType.BUY,
        traderClient: tdex.createTraderClient(market.provider.endpoint, torProxy),
      });
    }
  }
  return trades;
}

// discover the best order from a set of markets
export function discoverBestOrder(
  markets: TDEXMarket[],
  sendAsset?: string,
  receiveAsset?: string
): (sats: number, asset: string) => Promise<TradeOrder> {
  if (!sendAsset || !receiveAsset) throw new Error('unable to compute orders for selected market');
  const allPossibleOrders = tdex.computeOrders(markets, sendAsset, receiveAsset);
  if (allPossibleOrders.length === 0) {
    console.error(`markets not found for pair ${sendAsset}-${receiveAsset}`);
    throw NoMarketsAvailableForSelectedPairError;
  }
  return async (sats: number, asset: string): Promise<TradeOrder> => {
    if (sats <= 0) {
      // return a random order to avoid calling discoverer
      return allPossibleOrders[0];
    }
    try {
      const discoverer = tdex.createDiscoverer(
        allPossibleOrders,
        combineDiscovery(bestPriceDiscovery, bestBalanceDiscovery),
        async (err) => console.debug(err)
      );
      const bestOrders = await discoverer.discover({ asset, amount: sats });
      if (bestOrders.length === 0) throw new Error('zero best orders found by discoverer');
      return bestOrders[0];
    } catch (err) {
      console.error(err);
      return allPossibleOrders[0];
    }
  };
}

export async function marketPriceRequest(
  order: TradeOrder,
  sats: number,
  asset: string
): Promise<{
  asset: string;
  sats: string;
}> {
  const otherAsset = asset === order.market.baseAsset ? order.market.quoteAsset : order.market.baseAsset;
  if (sats <= 0) return { asset: otherAsset, sats: String(0) };
  const response = await order.traderClient.marketPrice(order.market, order.type, sats, asset);
  return {
    asset: response[0].asset,
    sats: response[0].amount,
  };
}

export function getClearTextTorProxyUrl(torProxyEndpoint: string, url: URL): string {
  // get just_onion_host_without_dot_onion
  const splitted = url.hostname.split('.');
  splitted.pop();
  const onionPubKey = splitted.join('.');
  return `${torProxyEndpoint}/${onionPubKey}`;
}
