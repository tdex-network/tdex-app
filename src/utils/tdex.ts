import axios from 'axios';
import { bestBalanceDiscovery, bestPriceDiscovery, combineDiscovery, Discoverer, Trade, TradeOrder, TraderClient, TradeType, greedyCoinSelector, IdentityInterface } from 'tdex-sdk';
import type { CoinSelector, UtxoInterface } from 'tdex-sdk';

import type { TDEXMarket, TDEXProvider } from '../redux/actionTypes/tdexActionTypes';

import { defaultPrecision } from './constants';
import { getMainAsset } from './constants';
import { MakeTradeError } from './errors';

export interface AssetWithTicker {
  asset: string;
  ticker: string;
  precision: number;
  coinGeckoID?: string;
}

export function createTraderClient(endpoint: string, proxy = 'https://proxy.tdex.network'): TraderClient {
  return new TraderClient(endpoint, proxy)
}

const bestBalanceAndThenBestPrice = combineDiscovery(bestBalanceDiscovery, bestPriceDiscovery);

// Create discoverer object for a specific set of trader clients
export function createDiscoverer(orders: TradeOrder[], errorHandler?: () => Promise<void>): Discoverer {
  return new Discoverer(
    orders,
    bestBalanceAndThenBestPrice,
    errorHandler
  )
}

function createTradeFromTradeOrder(
  order: TradeOrder,
  explorerLiquidAPI: string,
  utxos: UtxoInterface[],
  coinSelector: CoinSelector = greedyCoinSelector(),
  torProxy = 'https://proxy.tdex.network'
): Trade {
  return new Trade({
      explorerUrl: explorerLiquidAPI,
      providerUrl: order.traderClient.providerUrl,
      utxos,
      coinSelector,
  }, torProxy)
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
  utxos: UtxoInterface[],
  coinSelector: CoinSelector = greedyCoinSelector(),
  torProxy = 'https://proxy.tdex.network'
): Promise<string> {
  const trader = createTradeFromTradeOrder(order, explorerLiquidAPI, utxos, coinSelector, torProxy);
  try {
    const fn = order.type === TradeType.BUY ? trader.buy : trader.sell;
    const txid = await fn({ ...known, market: order.market, identity });

    if (!txid) {
      throw new Error('Transaction not broadcasted');
    }
    
    return txid;
  } catch (e) {
    throw MakeTradeError;
  }
}

/**
 * Construct all the TradeOrder from a set of markets
 * @param markets the set of available markets
 * @param sentAsset the asset to sent
 * @param receivedAsset the asset to receive
 */
export function allTrades(
  markets: TDEXMarket[],
  sentAsset: string,
  receivedAsset: string,
  torProxy?: string 
): TradeOrder[] {
  const trades: TradeOrder[] = [];
  for (const market of markets) {
    if (sentAsset === market.baseAsset && receivedAsset === market.quoteAsset) {
      trades.push({ market, type: TradeType.SELL, traderClient: createTraderClient(market.provider.endpoint, torProxy) });
    }

    if (sentAsset === market.quoteAsset && receivedAsset === market.baseAsset) {
      trades.push({ market, type: TradeType.BUY, traderClient: createTraderClient(market.provider.endpoint, torProxy) });
    }
  }

  return trades;
}

/**
 * Filter a set of markets using asset to sent.
 * @param markets
 * @param sentAsset
 */
export function getTradablesAssets(markets: TDEXMarket[], sentAsset: string): AssetWithTicker[] {
  const results: AssetWithTicker[] = [];

  for (const market of markets) {
    if (sentAsset === market.baseAsset && !results.map((r) => r.asset).includes(market.quoteAsset)) {
      const mainAsset = getMainAsset(market.quoteAsset);
      const ticker = mainAsset ? mainAsset.ticker : market.quoteAsset.slice(0, 4).toUpperCase();
      const coinGeckoID = mainAsset?.coinGeckoID;

      results.push({
        asset: market.quoteAsset,
        ticker,
        coinGeckoID,
        precision: mainAsset?.precision ?? defaultPrecision
      });
    }

    if (sentAsset === market.quoteAsset && !results.map((r) => r.asset).includes(market.baseAsset)) {
      const mainAsset = getMainAsset(market.baseAsset);
      const ticker = mainAsset ? mainAsset.ticker : market.baseAsset.slice(0, 4).toUpperCase();
      const coinGeckoID = mainAsset?.coinGeckoID;

      results.push({
        asset: market.baseAsset,
        ticker,
        coinGeckoID,
        precision: mainAsset?.precision ?? defaultPrecision
      });
    }
  }

  return results;
}

const TDexRegistryURL = 'https://raw.githubusercontent.com/TDex-network/tdex-registry/master/registry.json';

export async function getProvidersFromTDexRegistry(): Promise<TDEXProvider[]> {
  return (await axios.get(TDexRegistryURL)).data;
}
