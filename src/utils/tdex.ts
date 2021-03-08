import { Assets } from './constants';
import { AddressInterface, IdentityOpts } from 'ldk';
import { Trade, TraderClient, TradeType } from 'tdex-sdk';
import { TDEXTrade, TDEXMarket } from './../redux/actionTypes/tdexActionTypes';
import { toSatoshi } from './helpers';

export interface AssetWithTicker {
  asset: string;
  ticker: string;
  coinGeckoID?: string;
}

export async function bestPrice(
  known: { amount: number; asset: string },
  trades: TDEXTrade[]
): Promise<{ amount: number; asset: string; trade: TDEXTrade }> {
  if (trades.length === 0) throw new Error('trades array should not be empty');

  const toPrice = async (trade: TDEXTrade) =>
    calculatePrice(known, trade).then((res) => ({ ...res, trade }));
  const pricesPromises = trades.map(toPrice);

  const results = (await Promise.allSettled(pricesPromises))
    .filter(({ status }) => status === 'fulfilled')
    .map(
      (p) =>
        (p as PromiseFulfilledResult<{
          amount: number;
          asset: string;
          trade: TDEXTrade;
        }>).value
    );

  if (results.length === 0)
    throw new Error('Unable to preview price from providers.');

  const sorted = results.sort((p0, p1) => p0.amount - p1.amount);
  return sorted[0];
}

async function calculatePrice(
  known: { amount: number; asset: string },
  trade: TDEXTrade
): Promise<{ amount: number; asset: string }> {
  const client = new TraderClient(trade.market.provider.endpoint);
  const response = await client.marketPrice(
    trade.market,
    trade.type,
    toSatoshi(known.amount),
    known.asset
  );

  return {
    amount: response[0].amount,
    asset: response[0].asset,
  };
}

export async function makeTrade(
  trade: TDEXTrade,
  known: { amount: number; asset: string },
  explorerUrl: string,
  identity: IdentityOpts
): Promise<{ txid: string; identityAddresses: AddressInterface[] }> {
  const trader = new Trade({
    explorerUrl,
    providerUrl: trade.market.provider.endpoint,
    identity,
  });

  await trader.identity.isRestored;
  let txid = '';

  if (trade.type === TradeType.BUY) {
    txid = await trader.buy({ ...known, market: trade.market });
  }

  if (trade.type === TradeType.SELL) {
    txid = await trader.sell({ ...known, market: trade.market });
  }

  if (txid === '') {
    throw new Error('Invalid trade type');
  }

  return {
    txid,
    identityAddresses: trader.identity.getAddresses(),
  };
}

export function allTrades(
  markets: TDEXMarket[],
  sentAsset?: string,
  receivedAsset?: string
): TDEXTrade[] {
  if (!sentAsset || !receivedAsset) return [];
  const trades: TDEXTrade[] = [];
  for (const market of markets) {
    if (sentAsset === market.baseAsset && receivedAsset === market.quoteAsset) {
      trades.push({ market, type: TradeType.SELL });
    }

    if (sentAsset === market.quoteAsset && receivedAsset === market.baseAsset) {
      trades.push({ market, type: TradeType.BUY });
    }
  }

  return trades;
}

const assetsData = Object.values(Assets);

export function getTradablesAssets(
  markets: TDEXMarket[],
  sentAsset: string
): AssetWithTicker[] {
  const results: AssetWithTicker[] = [];

  for (const market of markets) {
    if (
      sentAsset === market.baseAsset &&
      !results.map((r) => r.asset).includes(market.quoteAsset)
    ) {
      results.push({
        asset: market.quoteAsset,
        ticker:
          assetsData.find((a) => a.assetHash === market.quoteAsset)?.ticker ||
          market.quoteAsset.slice(0, 4).toUpperCase(),
        coinGeckoID: assetsData.find((a) => a.assetHash === market.quoteAsset)
          ?.coinGeckoID,
      });
    }

    if (
      sentAsset === market.quoteAsset &&
      !results.map((r) => r.asset).includes(market.baseAsset)
    ) {
      results.push({
        asset: market.baseAsset,
        ticker:
          assetsData.find((a) => a.assetHash === market.baseAsset)?.ticker ||
          market.baseAsset.slice(0, 4).toUpperCase(),
        coinGeckoID: assetsData.find((a) => a.assetHash === market.baseAsset)
          ?.coinGeckoID,
      });
    }
  }

  return results;
}
