import axios from 'axios';
import type { NetworkString } from 'tdex-sdk';

import { getCoinGeckoIDsToFeed } from '../../utils/constants';
import type { CurrencyInterface } from '../reducers/settingsReducer';

const coinGeckoUrl = 'https://api.coingecko.com/api/v3';
export const axiosCoinGeckoObject = axios.create({ baseURL: coinGeckoUrl });

export type CoinGeckoPriceResult = Record<string, Record<CurrencyInterface['value'], number>>;

export async function getPriceFromCoinGecko(
  currencies: string[],
  network: NetworkString
): Promise<CoinGeckoPriceResult> {
  const { data } = await axiosCoinGeckoObject.get('/simple/price', {
    params: {
      ids: getCoinGeckoIDsToFeed(network).join(','),
      vs_currencies: currencies.join(','),
    },
  });

  return data;
}
