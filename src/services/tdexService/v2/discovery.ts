import type { Balance} from '../../../api-spec/protobuf/gen/js/tdex/v2/types_pb';
import { TradeType } from '../../../api-spec/protobuf/gen/js/tdex/v2/types_pb';

import type { TradeOrder } from './tradeCore';

export interface DiscoveryOpts {
  amount: number;
  asset: string;
}

export type Discovery = (
  orders: TradeOrder[],
  discoveryOpts: DiscoveryOpts,
  errorHandler?: (err: any) => Promise<void>
) => Promise<TradeOrder[]>;

// combine several discoveries function
// each function will be applied in the order specified in discoveries
export function combineDiscovery(...discoveries: Discovery[]): Discovery {
  return async (clients: TradeOrder[], opts: DiscoveryOpts, errorHandler?: (err: any) => Promise<void>) => {
    let results = clients;
    for (const discovery of discoveries) {
      if (results.length <= 1) return results;
      results = await discovery(results, opts, errorHandler);
    }

    return results;
  };
}

// bestBalanceDiscovery returns the clients with the greater balance.
// according to trade's type: BUY = max base balance, SELL = max quote balance.
export const bestBalanceDiscovery: Discovery = async (
  orders: TradeOrder[],
  _: DiscoveryOpts,
  errorHandler?: (err: any) => Promise<void>
) => {
  const balancesPromises = orders.map((order) => {
    const { traderClient, market, type } = order;
    return traderClient.balance(market).then((balance: Balance) => {
      if (!balance)
        throw new Error(
          `no balances for market ${market.baseAsset}/${market.quoteAsset} using provider: ${traderClient.providerUrl}`
        );
      const balanceAmount = type === TradeType.BUY ? balance.baseAmount : balance.quoteAmount;
      return {
        balanceAmount,
        order,
      };
    });
  });

  const balancesPromisesResults = await Promise.allSettled(balancesPromises);

  if (errorHandler) {
    const rejectedResults = balancesPromisesResults.filter((result) => result.status === 'rejected');
    for (const result of rejectedResults) {
      await errorHandler(
        (result as PromiseRejectedResult).reason || 'an unknwon error occurs when trying to fetch balance'
      );
    }
  }

  const balancesWithClients = balancesPromisesResults
    .filter((result) => result.status === 'fulfilled' && result.value)
    .map(
      (p) =>
        (
          p as PromiseFulfilledResult<{
            balanceAmount: string;
            order: TradeOrder;
          }>
        ).value
    );

  const sorted = balancesWithClients.sort((p0, p1) => Number(p1.balanceAmount) - Number(p0.balanceAmount));

  const bestAmount = sorted[0].balanceAmount;
  return sorted.filter(({ balanceAmount }) => balanceAmount === bestAmount).map(({ order }) => order);
};

// bestPriceDiscovery returns the clients with the lower price.
export const bestPriceDiscovery: Discovery = async (
  orders: TradeOrder[],
  opts: DiscoveryOpts,
  errorHandler?: (err: any) => Promise<void>
) => {
  const pricesPromises = orders.map((order) =>
    order.traderClient
      .marketPrice(order.market, order.type, opts.amount, opts.asset)
      .then((response) => ({ order, amount: response[0].amount }))
  );
  const pricesResults = await Promise.allSettled(pricesPromises);

  if (errorHandler) {
    const rejectedResults = pricesResults.filter((result) => result.status === 'rejected');
    for (const result of rejectedResults) {
      await errorHandler(
        (result as PromiseRejectedResult).reason || 'an unknown error occurs when trying to fetch price'
      );
    }
  }

  const pricesWithClients = pricesResults
    .filter((result) => result.status === 'fulfilled' && result.value)
    .map(
      (p) =>
        (
          p as PromiseFulfilledResult<{
            amount: string;
            order: TradeOrder;
          }>
        ).value
    );

  if (pricesWithClients.length === 0) {
    throw new Error('Not enough liquidity across providers for the requested amount');
  }

  const sorted = pricesWithClients.sort((p0, p1) => Number(p1.amount) - Number(p0.amount));

  const bestAmount = sorted[0].amount;
  return sorted.filter(({ amount }) => amount === bestAmount).map(({ order }) => order);
};
