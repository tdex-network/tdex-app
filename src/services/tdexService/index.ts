import axios from 'axios';

import { TradeType as TradeTypeV1 } from '../../api-spec/protobuf/gen/js/tdex/v1/types_pb';
import { TradeType as TradeTypeV2 } from '../../api-spec/protobuf/gen/js/tdex/v2/types_pb';
import { config } from '../../store/config';
import type { CoinSelectionForTrade, ScriptDetails } from '../../store/walletStore';
import type { NetworkString } from '../../utils/constants';
import { AppError, NoMarketsAvailableForSelectedPairError } from '../../utils/errors';
// Self import for unit testing
import type { SignerInterface } from '../signerService';

import * as tdex from './index';
import { TraderClient as TraderClientV1 } from './v1/client.web';
import { Discoverer as DiscovererV1 } from './v1/discoverer';
import {
  bestBalanceDiscovery as bestBalanceDiscoveryV1,
  bestPriceDiscovery as bestPriceDiscoveryV1,
  combineDiscovery as combineDiscoveryV1,
} from './v1/discovery';
import type { Discovery as DiscoveryV1 } from './v1/discovery';
import { Trade as TradeV1 } from './v1/trade.web';
import type { TDEXMarket, TDEXProvider, TradeOrder as TradeOrderV1 } from './v1/tradeCore';
//
import { TraderClient as TraderClientV2 } from './v2/client.web';
import { Discoverer as DiscovererV2 } from './v2/discoverer';
import {
  bestBalanceDiscovery as bestBalanceDiscoveryV2,
  bestPriceDiscovery as bestPriceDiscoveryV2,
  combineDiscovery as combineDiscoveryV2,
} from './v2/discovery';
import type { Discovery as DiscoveryV2 } from './v2/discovery';
import { Trade as TradeV2 } from './v2/trade.web';
import type { TradeOrder as TradeOrderV2 } from './v2/tradeCore';
//
const TDexRegistryMainnet = 'https://raw.githubusercontent.com/TDex-network/tdex-registry/master/registry.json';
const TDexRegistryTestnet = 'https://raw.githubusercontent.com/tdex-network/tdex-registry/testnet/registry.json';

// Protos v1

export async function getMarketsFromProviderV1(p: TDEXProvider, torProxy = config.torProxy): Promise<TDEXMarket[]> {
  const client = new TraderClientV1(p.endpoint, torProxy);
  const markets = await client.markets();
  const results: TDEXMarket[] = [];
  for (const { market, fee } of markets) {
    if (!market) continue;
    const balance = (await client.balance(market))?.balance;
    results.push({
      provider: p,
      ...market,
      ...balance,
      ...fee,
    });
  }
  return results;
}

export function createTraderClientV1(endpoint: string, proxy = 'https://proxy.tdex.network'): TraderClientV1 {
  return new TraderClientV1(endpoint, proxy);
}

// Create discoverer object for a specific set of trader clients
export function createDiscovererV1(
  orders: TradeOrderV1[],
  discovery: DiscoveryV1,
  errorHandler?: (err: any) => Promise<void>
): DiscovererV1 {
  return new DiscovererV1(orders, discovery, errorHandler);
}

function createTradeFromTradeOrderV1(
  order: TradeOrderV1,
  explorerLiquidAPI: string,
  coinSelectionForTrade: CoinSelectionForTrade,
  signer: SignerInterface,
  masterBlindingKey: string,
  network: NetworkString,
  torProxy = config.torProxy
): TradeV1 {
  return new TradeV1(
    {
      explorerUrl: explorerLiquidAPI,
      providerUrl: order.traderClient.providerUrl,
      coinSelectionForTrade,
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
 * @param addressForChangeOutput
 * @param addressForSwapOutput
 * @param masterBlindingKey
 */
export async function makeTradeV1(
  order: TradeOrderV1,
  known: { amount: number; asset: string },
  explorerLiquidAPI: string,
  coinSelectionForTrade: CoinSelectionForTrade,
  signer: SignerInterface,
  masterBlindingKey: string, // Only necessary for protos v1
  network: NetworkString,
  addressForChangeOutput: ScriptDetails,
  addressForSwapOutput: ScriptDetails,
  torProxy?: string
): Promise<string> {
  const trader = createTradeFromTradeOrderV1(
    order,
    explorerLiquidAPI,
    coinSelectionForTrade,
    signer,
    masterBlindingKey,
    network,
    torProxy
  );
  try {
    const args = { ...known, market: order.market, addressForSwapOutput, addressForChangeOutput };
    const promise = order.type === TradeTypeV1.BUY ? trader.buy(args) : trader.sell(args);
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
export function computeOrdersV1(
  markets: TDEXMarket[],
  sentAsset: string,
  receivedAsset: string,
  torProxy?: string
): TradeOrderV1[] {
  const trades: TradeOrderV1[] = [];
  for (const market of markets) {
    if (sentAsset === market.baseAsset && receivedAsset === market.quoteAsset) {
      trades.push({
        market,
        type: TradeTypeV1.SELL,
        traderClient: tdex.createTraderClientV1(market.provider.endpoint, torProxy),
      });
    }
    if (sentAsset === market.quoteAsset && receivedAsset === market.baseAsset) {
      trades.push({
        market,
        type: TradeTypeV1.BUY,
        traderClient: tdex.createTraderClientV1(market.provider.endpoint, torProxy),
      });
    }
  }
  return trades;
}

// discover the best order from a set of markets
export function discoverBestOrderV1(
  markets: TDEXMarket[],
  sendAsset?: string,
  receiveAsset?: string
): (sats: number, asset: string) => Promise<TradeOrderV1> {
  if (!sendAsset || !receiveAsset) throw new Error('unable to compute orders for selected market');
  const allPossibleOrders = tdex.computeOrdersV1(markets, sendAsset, receiveAsset);
  if (allPossibleOrders.length === 0) {
    console.error(`markets not found for pair ${sendAsset}-${receiveAsset}`);
    throw NoMarketsAvailableForSelectedPairError;
  }
  return async (sats: number, asset: string): Promise<TradeOrderV1> => {
    if (sats <= 0) {
      // return a random order to avoid calling discoverer
      return allPossibleOrders[0];
    }
    try {
      const discoverer = tdex.createDiscovererV1(
        allPossibleOrders,
        combineDiscoveryV1(bestPriceDiscoveryV1, bestBalanceDiscoveryV1),
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

export async function marketPriceRequestV1(
  order: TradeOrderV1,
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

// Protos v2

export async function getMarketsFromProviderV2(p: TDEXProvider, torProxy = config.torProxy): Promise<TDEXMarket[]> {
  const client = new TraderClientV2(p.endpoint, torProxy);
  const markets = await client.markets();
  const results: TDEXMarket[] = [];
  for (const { market, fee } of markets) {
    if (!market) continue;
    const balance = await client.balance(market);
    results.push({
      provider: p,
      ...market,
      ...balance,
      ...fee,
    });
  }
  return results;
}

export function createTraderClientV2(endpoint: string, proxy = config.torProxy): TraderClientV2 {
  return new TraderClientV2(endpoint, proxy);
}

// Create discoverer object for a specific set of trader clients
export function createDiscovererV2(
  orders: TradeOrderV2[],
  discovery: DiscoveryV2,
  errorHandler?: (err: any) => Promise<void>
): DiscovererV2 {
  return new DiscovererV2(orders, discovery, errorHandler);
}

function createTradeFromTradeOrderV2(
  order: TradeOrderV2,
  explorerLiquidAPI: string,
  coinSelectionForTrade: CoinSelectionForTrade,
  signer: SignerInterface,
  masterBlindingKey: string,
  network: NetworkString,
  torProxy = config.torProxy
): TradeV2 {
  return new TradeV2(
    {
      explorerUrl: explorerLiquidAPI,
      providerUrl: order.traderClient.providerUrl,
      coinSelectionForTrade,
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
 * @param addressForChangeOutput
 * @param addressForSwapOutput
 * @param masterBlindingKey
 */
export async function makeTradeV2(
  order: TradeOrderV2,
  known: { amount: number; asset: string },
  explorerLiquidAPI: string,
  coinSelectionForTrade: CoinSelectionForTrade,
  signer: SignerInterface,
  masterBlindingKey: string, // Only necessary for protos v1
  network: NetworkString,
  addressForChangeOutput: ScriptDetails,
  addressForSwapOutput: ScriptDetails,
  torProxy?: string
): Promise<string> {
  const trader = createTradeFromTradeOrderV2(
    order,
    explorerLiquidAPI,
    coinSelectionForTrade,
    signer,
    masterBlindingKey,
    network,
    torProxy
  );
  try {
    const args = { ...known, market: order.market, addressForSwapOutput, addressForChangeOutput };
    const promise = order.type === TradeTypeV2.BUY ? trader.buy(args) : trader.sell(args);
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
export function computeOrdersV2(
  markets: TDEXMarket[],
  sentAsset: string,
  receivedAsset: string,
  torProxy?: string
): TradeOrderV2[] {
  const trades: TradeOrderV2[] = [];
  for (const market of markets) {
    if (sentAsset === market.baseAsset && receivedAsset === market.quoteAsset) {
      trades.push({
        market,
        type: TradeTypeV2.SELL,
        traderClient: tdex.createTraderClientV2(market.provider.endpoint, torProxy),
      });
    }
    if (sentAsset === market.quoteAsset && receivedAsset === market.baseAsset) {
      trades.push({
        market,
        type: TradeTypeV2.BUY,
        traderClient: tdex.createTraderClientV2(market.provider.endpoint, torProxy),
      });
    }
  }
  return trades;
}

// discover the best order from a set of markets
export function discoverBestOrderV2(
  markets: TDEXMarket[],
  sendAsset?: string,
  receiveAsset?: string
): (sats: number, asset: string) => Promise<TradeOrderV2> {
  if (!sendAsset || !receiveAsset) throw new Error('unable to compute orders for selected market');
  const allPossibleOrders = tdex.computeOrdersV2(markets, sendAsset, receiveAsset);
  if (allPossibleOrders.length === 0) {
    console.error(`markets not found for pair ${sendAsset}-${receiveAsset}`);
    throw NoMarketsAvailableForSelectedPairError;
  }
  return async (sats: number, asset: string): Promise<TradeOrderV2> => {
    if (sats <= 0) {
      // return a random order to avoid calling discoverer
      return allPossibleOrders[0];
    }
    try {
      const discoverer = tdex.createDiscovererV2(
        allPossibleOrders,
        combineDiscoveryV2(bestPriceDiscoveryV2, bestBalanceDiscoveryV2),
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

export async function marketPriceRequestV2(
  order: TradeOrderV2,
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

//

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

export function getClearTextTorProxyUrl(torProxyEndpoint: string, url: URL): string {
  // get just_onion_host_without_dot_onion
  const splitted = url.hostname.split('.');
  splitted.pop();
  const onionPubKey = splitted.join('.');
  return `${torProxyEndpoint}/${onionPubKey}`;
}

export async function getProvidersFromTDexRegistry(network: NetworkString): Promise<TDEXProvider[]> {
  if (network === 'testnet') {
    const reg = (await axios.get(TDexRegistryTestnet)).data;
    // TODO: remove this when the registry will be updated
    reg.push({
      name: 'v1.provider.tdex.network',
      endpoint: 'https://v1.provider.tdex.network/',
    });
    return reg;
  }
  return (await axios.get(TDexRegistryMainnet)).data;
}
