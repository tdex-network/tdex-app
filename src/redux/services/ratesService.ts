import axios from 'axios';

const coinGeckoUrl = 'https://api.coingecko.com/api/v3';
export const axiosCoinGeckoObject = axios.create({ baseURL: coinGeckoUrl });

export type CoinGeckoPriceResult = Record<string, Record<string, number>>;

export async function getPriceFromCoinGecko(
  ids: string[],
  currencies: string[]
): Promise<CoinGeckoPriceResult> {
  const { data } = await axiosCoinGeckoObject.get('/simple/price', {
    params: {
      ids: ids.join(','),
      vs_currencies: currencies.join(','),
    },
  });

  return data;
}
