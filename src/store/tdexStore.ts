import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

import { storage } from './capacitorPersistentStorage';

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
  addMarkets: (markets: TDEXMarket[]) => void;
  addProviders: (providers: TDEXProvider[]) => void;
  clearMarkets: () => void;
  clearProviders: () => void;
  deleteProvider: (provider: TDEXProvider) => void;
  replaceMarketsOfProvider: (providerToUpdate: TDEXProvider, markets: TDEXMarket[]) => void;
  reset: () => void;
}

const initialState: TdexState = {
  providers: [],
  markets: [],
};

export const useTdexStore = create<TdexState & TdexActions>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        addMarkets: (markets: TDEXMarket[]) =>
          set((state) => ({ markets: [...state.markets, ...markets] }), false, 'addMarkets'),
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
        reset: () => set(initialState, true, 'reset'),
      }),
      {
        name: 'tdex',
        storage: createJSONStorage(() => storage),
      }
    ),
    { name: 'store', store: 'toast' }
  )
);
