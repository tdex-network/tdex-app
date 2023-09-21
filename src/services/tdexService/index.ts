import axios from 'axios';

import { TradeType as TradeTypeV1 } from '../../api-spec/protobuf/gen/js/tdex/v1/types_pb';
import type { Preview as PreviewV1 } from '../../api-spec/protobuf/gen/js/tdex/v1/types_pb';
import type { Preview as PreviewV2 } from '../../api-spec/protobuf/gen/js/tdex/v2/types_pb';
import { TradeType as TradeTypeV2 } from '../../api-spec/protobuf/gen/js/tdex/v2/types_pb';
import { config } from '../../store/config';
import type { CoinSelectionForTrade, ScriptDetails } from '../../store/walletStore';
import type { NetworkString } from '../../utils/constants';
import { AppError, NoMarketsAvailableForSelectedPairError } from '../../utils/errors';
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
import type {
  TDEXMarket as TDEXMarketV1,
  TDEXProvider,
  TDEXProviderWithVersion,
  TradeOrder as TradeOrderV1,
} from './v1/tradeCore';
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
import type { TDEXMarket as TDEXMarketV2, TradeOrder as TradeOrderV2 } from './v2/tradeCore';

//
const TDexRegistryMainnet = 'https://raw.githubusercontent.com/tdex-network/tdex-registry/master/registry.json';
const TDexRegistryTestnet = 'https://raw.githubusercontent.com/tdex-network/tdex-registry/testnet/registry.json';

// Protos v1

export async function getMarketsFromProviderV1(
  p: TDEXProviderWithVersion,
  torProxy = config.torProxy
): Promise<TDEXMarketV1[]> {
  const client = new TraderClientV1(p.endpoint, torProxy);
  const markets = await client.listMarkets();
  const results: TDEXMarketV1[] = [];
  for (const { market, fee } of markets) {
    if (!market) continue;
    const balance = (await client.getMarketBalance(market))?.balance;
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
  const trader = new TradeV1(
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
  markets: TDEXMarketV1[],
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

export async function previewTradeV1(order: TradeOrderV1, sats: number, asset: string): Promise<PreviewV1 | undefined> {
  if (sats <= 0) return undefined;
  const response = await order.traderClient.previewTrade({
    market: order.market,
    type: order.type,
    amount: sats.toString(),
    asset: asset,
  });
  return response[0];
}

// Protos v2

export async function getMarketsFromProviderV2(
  p: TDEXProviderWithVersion,
  torProxy = config.torProxy
): Promise<TDEXMarketV2[]> {
  const client = new TraderClientV2(p.endpoint, torProxy);
  const markets = await client.listMarkets();
  const results: TDEXMarketV2[] = [];
  for (const { market, fee } of markets) {
    if (!market) continue;
    const balance = await client.getMarketBalance(market);
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
  const trader = new TradeV2(
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
  markets: TDEXMarketV2[],
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

export async function previewTradeV2(order: TradeOrderV2, sats: number, asset: string): Promise<PreviewV2 | undefined> {
  if (sats <= 0) return undefined;
  const response = await order.traderClient.previewTrade({
    market: order.market,
    type: order.type,
    amount: sats.toString(),
    asset: asset,
    // That way we always substract from receiving amount
    feeAsset: order.type === TradeTypeV2.BUY ? order.market.baseAsset : order.market.quoteAsset,
  });
  return response[0];
}

//

// Find all assets in markets tradable with the asset `asset`
export function getTradablesAssets(markets: { v1: TDEXMarketV1[]; v2: TDEXMarketV2[] }, asset: string): string[] {
  const tradable: string[] = [];
  for (const market of markets.v1) {
    if (asset === market.baseAsset && !tradable.includes(market.quoteAsset)) {
      tradable.push(market.quoteAsset);
    }
    if (asset === market.quoteAsset && !tradable.includes(market.baseAsset)) {
      tradable.push(market.baseAsset);
    }
  }
  for (const market of markets.v2) {
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
    // TODO: remove this when the testnet registry will be updated
    reg.push({
      name: 'v1.provider.tdex.network',
      endpoint: 'https://v1.provider.tdex.network',
    });
    return reg;
  }
  // TODO: remove this when the mainnet registry will be updated
  const reg = (await axios.get(TDexRegistryMainnet)).data;
  reg.push({
    name: 'provider.vulpem.com',
    endpoint: 'https://provider.vulpem.com',
  });
  return reg;
}

export function discoverBestOrder(
  markets: { v1: TDEXMarketV1[]; v2: TDEXMarketV2[] },
  sendAsset?: string,
  receiveAsset?: string
): (sats: number, asset: string) => Promise<TradeOrderV1 | TradeOrderV2> {
  if (!sendAsset || !receiveAsset) throw new Error('unable to compute orders for selected market');
  const allPossibleOrdersV1 = tdex.computeOrdersV1(markets.v1, sendAsset, receiveAsset);
  const allPossibleOrdersV2 = tdex.computeOrdersV2(markets.v2, sendAsset, receiveAsset);
  if (allPossibleOrdersV1.length === 0 && allPossibleOrdersV2.length === 0) {
    console.error(`markets not found for pair ${sendAsset}-${receiveAsset}`);
    throw NoMarketsAvailableForSelectedPairError;
  }
  return async (sats: number, asset: string): Promise<TradeOrderV1 | TradeOrderV2> => {
    if (sats <= 0) {
      // return a random order to avoid calling discoverer
      return allPossibleOrdersV2[0] ?? allPossibleOrdersV1[0];
    }
    try {
      const discovererV1 = tdex.createDiscovererV1(
        allPossibleOrdersV1,
        combineDiscoveryV1(bestPriceDiscoveryV1, bestBalanceDiscoveryV1),
        async (err) => console.debug(err)
      );
      const discovererV2 = tdex.createDiscovererV2(
        allPossibleOrdersV2,
        combineDiscoveryV2(bestPriceDiscoveryV2, bestBalanceDiscoveryV2),
        async (err) => console.debug(err)
      );
      const bestOrdersV1 = await discovererV1.discover({ asset, amount: sats });
      const bestOrdersV2 = await discovererV2.discover({ asset, amount: sats });
      if (bestOrdersV1.length === 0 && bestOrdersV2.length === 0)
        throw new Error('zero best orders found by discoverer');
      return bestOrdersV2[0] ?? bestOrdersV1[0];
    } catch (err) {
      console.error(err);
      return allPossibleOrdersV2[0] ?? allPossibleOrdersV1[0];
    }
  };
}

export function isTradeOrderV2(tradeOrder: any): tradeOrder is TradeOrderV2 {
  return tradeOrder.market?.percentageFee !== undefined;
}
