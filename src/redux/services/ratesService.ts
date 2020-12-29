import {
  normalizeCoins,
  normalizeRates,
  tickersToIds,
} from '../transformers/ratesTransformers';
import axios from 'axios';

export function fetchCoinList() {
  const url = 'https://api.coingecko.com/api/v3/coins/list';
  return axios
    .get(url)
    .then((response) => response.data)
    .then((coins) => normalizeCoins(coins));
}

export function fetchRates(
  tickers: Array<string>,
  currencies: Array<string>,
  coins: any
) {
  const url = 'https://api.coingecko.com/api/v3/simple/price';
  const ids = tickersToIds(coins.byTicker, tickers);
  const params = {
    ids: ids.join(','),
    vs_currencies: currencies.join(','),
  };

  return axios
    .get(url, { params })
    .then((response) => response.data)
    .then((rates) => normalizeRates(rates, coins.byId));
}
