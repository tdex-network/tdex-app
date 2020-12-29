import {
  TraderClient,
  Trade,
  TradeType,
  IdentityOpts,
  MarketInterface,
} from 'tdex-sdk';
import { toSatoshi } from '../../../utils/helpers';
import { network } from '../../config';

interface TradeInterface {
  endpoint: string;
  market: MarketInterface;
  amount: number;
  asset: string;
  tradeType: TradeType;
  identityOpts: IdentityOpts;
}

export function fetchMarkets(endpoint: string) {
  const client = new TraderClient(endpoint);
  return client.markets();
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

export function estimatePrice({
  endpoint,
  market,
  amount,
  asset,
  tradeType,
  identityOpts,
}: TradeInterface) {
  return initTrade(endpoint, market, identityOpts).preview({
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
  identityOpts,
}: TradeInterface) {
  const trade = initTrade(endpoint, market, identityOpts);
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
  identityOpts: IdentityOpts
) => {
  return new Trade({
    providerUrl: endpoint,
    explorerUrl: network.explorer,
    identity: identityOpts,
  });
};
