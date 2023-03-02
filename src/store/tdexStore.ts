import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

import {
  getMarketsFromProviderV1,
  getMarketsFromProviderV2,
  getProvidersFromTDexRegistry,
} from '../services/tdexService';

import { storage } from './capacitorPersistentStorage';
import { defaultProviderEndpoints } from './config';
import { useSettingsStore } from './settingsStore';

export interface TDEXProvider {
  name: string;
  endpoint: string;
}

export interface TDEXMarket {
  baseAsset: string;
  quoteAsset: string;
  provider: TDEXProvider;
  baseAmount?: string;
  quoteAmount?: string;
}

interface TdexState {
  providers: TDEXProvider[];
  markets: TDEXMarket[];
}

export interface TdexActions {
  addProviders: (providers: TDEXProvider[]) => void;
  clearMarkets: () => void;
  clearProviders: () => void;
  deleteProvider: (provider: TDEXProvider) => void;
  fetchMarkets: () => Promise<void>;
  fetchProviders: () => Promise<void>;
  replaceMarketsOfProvider: (providerToUpdate: TDEXProvider, markets: TDEXMarket[]) => void;
  resetTdexStore: () => void;
}

const initialState: TdexState = {
  providers: [],
  markets: [],
};

export const useTdexStore = create<TdexState & TdexActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        addProviders: (providers: TDEXProvider[]) => {
          set(
            (state) => {
              const newProviders: TDEXProvider[] = [];
              providers.forEach((p: TDEXProvider) => {
                const isProviderInState = state.providers.some(({ endpoint }) => endpoint === p.endpoint);
                if (!isProviderInState) newProviders.push(p);
              });
              return { providers: [...state.providers, ...newProviders] };
            },
            false,
            'addProviders'
          );
        },
        clearMarkets: () => set({ markets: [] }, false, 'clearMarkets'),
        clearProviders: () => set({ providers: [] }, false, 'clearProviders'),
        deleteProvider: (provider: TDEXProvider) => {
          set(
            (state) => ({ providers: state.providers.filter((p) => p.endpoint !== provider.endpoint) }),
            false,
            'deleteProvider'
          );
        },
        fetchMarkets: async () => {
          const torProxy = useSettingsStore.getState().torProxy;
          let allMarkets;
          // TODO: get daemon version
          if (true) {
            allMarkets = await Promise.allSettled(get().providers.map((p) => getMarketsFromProviderV1(p, torProxy)));
          } else {
            allMarkets = await Promise.allSettled(get().providers.map((p) => getMarketsFromProviderV2(p, torProxy)));
          }
          allMarkets
            .map((p, i) => (p.status === 'fulfilled' && p.value ? p.value : []))
            .forEach((markets) => {
              set((state) => ({ markets: [...state.markets, ...markets] }), false, 'fetchMarkets');
            });
        },
        fetchProviders: async () => {
          const network = useSettingsStore.getState().network;
          if (network === 'liquid' || network === 'testnet') {
            const providersFromRegistry = await getProvidersFromTDexRegistry(network);
            get().addProviders(providersFromRegistry);
          } else {
            get().addProviders([{ endpoint: defaultProviderEndpoints.regtest, name: 'Default provider' }]);
          }
        },
        replaceMarketsOfProvider: (providerToUpdate: TDEXProvider, markets: TDEXMarket[]) => {
          set(
            (state) => {
              // Remove markets of provider received in arg
              const marketsWithoutProviderToUpdate = state.markets.filter(
                (market) => market.provider.endpoint !== (providerToUpdate as TDEXProvider).endpoint
              );
              return { ...state, markets: [...marketsWithoutProviderToUpdate, ...markets] };
            },
            false,
            'replaceMarketsOfProvider'
          );
        },
        resetTdexStore: () => set(initialState, false, 'resetTdexStore'),
      }),
      {
        name: 'tdex',
        storage: createJSONStorage(() => storage),
      }
    ),
    { name: 'store', store: 'tdex' }
  )
);
