import axios from 'axios';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

import { LBTC_COINGECKOID } from '../utils/constants';

import { storage } from './capacitorPersistentStorage';
import type { Currency } from './settingsStore';

const coinGeckoUrl = 'https://api.coingecko.com/api/v3';

export const axiosCoinGeckoObject = axios.create({ baseURL: coinGeckoUrl });

export type CoinGeckoPriceResult = Record<string, Record<Currency['ticker'], number>>;

interface RateState {
  rates?: CoinGeckoPriceResult;
  lastRequestTime?: number;
}

interface RateActions {
  fetchFiatRates: () => Promise<void>;
  resetRateStore: () => void;
}

export const useRateStore = create<RateState & RateActions>()(
  devtools(
    persist(
      (set, get) => ({
        rates: undefined,
        lastRequestTime: undefined,
        fetchFiatRates: async () => {
          // if last request at least a minute ago return
          if (get().rates !== undefined && (get().lastRequestTime ?? 0) + 60_000 > Date.now()) return;
          //
          const { data, status } = await axiosCoinGeckoObject.get<CoinGeckoPriceResult>('/simple/price', {
            params: {
              ids: `${LBTC_COINGECKOID}`,
              vs_currencies: 'usd,cad,eur',
            },
          });
          if (status !== 200) {
            console.error('CoinGecko price fetching failed');
            return;
          }
          set({ rates: data }, false, 'fetchFiatRates');
          set({ lastRequestTime: Date.now() }, false, 'lastRequestTime');
        },
        resetRateStore: () => {
          set({ rates: undefined, lastRequestTime: undefined }, false, 'resetRateStore');
        },
      }),
      {
        name: 'rate',
        storage: createJSONStorage(() => storage),
      }
    ),
    { name: 'store', store: 'rate' }
  )
);
