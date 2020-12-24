import {
  TraderClient,
  Trade,
  TradeType,
  networks,
  IdentityOpts,
  MarketInterface,
} from 'tdex-sdk';
import { network } from '../../config';
import { toSatoshi } from '../../../utils/helpers';
import axios from 'axios';

interface TradeInterface {
  endpoint: string;
  market: MarketInterface;
  amount: number;
  asset: string;
  tradeType: TradeType;
  identity: IdentityOpts;
}

export async function fetchMarkets(endpoint: string) {
  const client = new TraderClient(endpoint);
  return client.markets();
}

export async function fetchAssets(assetIds: Array<any>) {
  const assets = [];

  for (const i in assetIds) {
    const assetId = assetIds[i];
    if (assetId === (networks as any)[network.chain].assetHash) {
      assets.push({
        id: assetId,
        name: 'Liquid Bitcoin',
        ticker: 'LBTC',
      });
    } else {
      const response = await axios.get(`${network.explorer}/asset/${assetId}`);
      assets.push({
        id: assetId,
        name: response.data.name,
        ticker: response.data.ticker,
      });
    }
  }

  return assets;
}

export function findMarketByAssets(
  markets: Array<MarketInterface>,
  assets: Array<string>
) {
  return assets.length > 2 || (assets.length == 2 && assets[0] == assets[1])
    ? null
    : markets.find((market: MarketInterface) =>
        assets.every((asset) => Object.values(market).includes(asset))
      );
}

export async function previewPrice({
  endpoint,
  market,
  amount,
  asset,
  tradeType,
  identity,
}: TradeInterface) {
  return initTrade(endpoint, market, identity).preview({
    market,
    tradeType,
    amount: toSatoshi(amount),
    asset,
  });
}

export async function executeTrade({
  endpoint,
  market,
  amount,
  asset,
  tradeType,
  identity,
}: TradeInterface) {
  const trade = initTrade(endpoint, market, identity);
  const params = {
    market,
    amount: toSatoshi(amount),
    asset,
  };

  await trade.identity.isRestored;
  return tradeType == TradeType.BUY ? trade.buy(params) : trade.sell(params);
}

const initTrade = (
  endpoint: string,
  market: MarketInterface,
  identity: IdentityOpts
) => {
  return new Trade({
    providerUrl: endpoint,
    explorerUrl: network.explorer,
    identity,
  });
};
