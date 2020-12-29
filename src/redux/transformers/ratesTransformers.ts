import { RatesInterface, CoinInterface } from '../actionTypes/ratesActionTypes';

const overrides: { [ticker: string]: { id: string; name: string } } = {
  lbtc: { id: 'bitcoin', name: 'Liquid Bitcoin' },
};

export function normalizeCoins(coins: Array<any>) {
  return {
    byId: {
      ...coins.reduce((accumulator, coin) => {
        const { id, symbol, name } = coin;
        accumulator[id] = { ticker: symbol, name };
        return accumulator;
      }, {} as CoinInterface),
      ...Object.keys(overrides).reduce((accumulator, ticker) => {
        accumulator[overrides[ticker].id] = {
          ticker,
          name: overrides[ticker].name,
        };
        return accumulator;
      }, {} as CoinInterface),
    },

    byTicker: {
      ...coins.reduce((accumulator, coin) => {
        const { symbol, ...rest } = coin;
        accumulator[symbol] = rest;
        return accumulator;
      }, {}),
      ...overrides,
    },
  };
}

export function normalizeRates(rates: any, coinsById: any) {
  const normalizedRates: RatesInterface = {};

  for (const id in rates) {
    const ticker = coinsById[id].ticker;
    const coinRates = rates[id];

    for (const currency in coinRates) {
      normalizedRates[currency] = {
        ...normalizedRates[currency],
        [ticker]: coinRates[currency],
      };
    }
  }

  return normalizedRates;
}

export function tickersToIds(coinsByTicker: any, tickers: Array<string>) {
  return tickers.map((ticker) => coinsByTicker[ticker]?.id);
}
