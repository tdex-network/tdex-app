import axios from 'axios';
import {
  bestBalanceDiscovery,
  bestPriceDiscovery,
  combineDiscovery,
  Trade,
  TraderClient,
  TradeType,
  greedyCoinSelector,
  Discoverer,
} from 'tdex-sdk';
import type { CoinSelector, TradeOrder, IdentityInterface, UnblindedOutput, Discovery } from 'tdex-sdk';

import type { TDEXMarket, TDEXProvider } from '../redux/actionTypes/tdexActionTypes';

import { AppError, NoMarketsAvailableForSelectedPairError } from './errors';
// Self import for unit testing
import * as tdex from './tdex';

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
  utxos: UnblindedOutput[],
  coinSelector: CoinSelector = greedyCoinSelector(),
  torProxy = 'https://proxy.tdex.network'
): Trade {
  return new Trade(
    {
      explorerUrl: explorerLiquidAPI,
      providerUrl: order.traderClient.providerUrl,
      utxos,
      coinSelector,
    },
    torProxy
  );
}

/**
 * make and broadcast the swap transaction
 * @param order the selected trade using to swap
 * @param known the data inputs by the user
 * @param explorerLiquidAPI the esplora URL
 * @param utxos the user's set of utxos
 * @param identity the user's identity, using to sign and blind the transaction
 * @param coinSelector the coin selector using to *select* unspents
 * @param torProxy
 */
export async function makeTrade(
  order: TradeOrder,
  known: { amount: number; asset: string },
  identity: IdentityInterface,
  explorerLiquidAPI: string,
  utxos: UnblindedOutput[],
  coinSelector: CoinSelector,
  torProxy?: string
): Promise<string> {
  const trader = createTradeFromTradeOrder(order, explorerLiquidAPI, utxos, coinSelector, torProxy);
  try {
    const args = { ...known, market: order.market, identity };
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

const TDexRegistryURL = 'https://raw.githubusercontent.com/TDex-network/tdex-registry/master/registry.json';

export async function getProvidersFromTDexRegistry(): Promise<TDEXProvider[]> {
  return (await axios.get(TDexRegistryURL)).data;
}

// discover the best order from a set of markets
// return an async function
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
  sats: number;
}> {
  const otherAsset = asset === order.market.baseAsset ? order.market.quoteAsset : order.market.baseAsset;
  if (sats <= 0) return { asset: otherAsset, sats: 0 };
  const response = await order.traderClient.marketPrice(order.market, order.type, sats, asset);
  return {
    asset: response[0].asset,
    sats: response[0].amount,
  };
}
