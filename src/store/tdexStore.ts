import axios from 'axios';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

import {
  getMarketsFromProviderV1,
  getMarketsFromProviderV2,
  getProvidersFromTDexRegistry,
} from '../services/tdexService';
import type { TDEXMarket, TDEXProvider } from '../services/tdexService/v1/tradeCore';
import { TDEXRegistryError } from '../utils/errors';

import { storage } from './capacitorPersistentStorage';
import { defaultProviderEndpoints } from './config';
import { useSettingsStore } from './settingsStore';
import { useToastStore } from './toastStore';

interface TdexState {
  providers: TDEXProvider[];
  markets: TDEXMarket[];
}

export interface TdexActions {
  addProviders: (providers: TDEXProvider[]) => void;
  clearMarkets: () => void;
  clearProviders: () => void;
  deleteProvider: (provider: TDEXProvider) => void;
  getProtoVersion: (providerEndpoint: string) => Promise<'v1' | 'v2'>;
  fetchMarkets: () => Promise<void>;
  fetchProviders: () => Promise<void>;
  refetchTdexProvidersAndMarkets: () => Promise<void>;
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
              useToastStore.getState().addSuccessToast(`Providers updated from TDEX registry!`);
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
        getProtoVersion: async (providerEndpoint) => {
          const res = await axios.post(providerEndpoint, { list_services: '' });
          const isVersion2 = res.data.result.listServicesResponse.service
            .map((s: any) => s.name)
            .includes('tdex.v2.TransportService');
          return isVersion2 ? 'v2' : 'v1';
        },
        fetchMarkets: async () => {
          const torProxy = useSettingsStore.getState().torProxy;
          let allMarkets;
          let marketsToAdd: TDEXMarket[];
          const version = await get().getProtoVersion('https://v1.provider.tdex.network/v1/info');
          if (version === 'v1') {
            allMarkets = await Promise.allSettled(get().providers.map((p) => getMarketsFromProviderV1(p, torProxy)));
          } else {
            allMarkets = await Promise.allSettled(get().providers.map((p) => getMarketsFromProviderV2(p, torProxy)));
          }
          allMarkets
            .map((p, i) => (p.status === 'fulfilled' && p.value ? p.value : []))
            .forEach((markets) => {
              // Check if markets are already in state
              marketsToAdd = markets.filter((market) => {
                const isMarketInState = get().markets.some(
                  (m) =>
                    m.baseAsset === market.baseAsset &&
                    m.quoteAsset === market.quoteAsset &&
                    m.provider.endpoint === market.provider.endpoint &&
                    m.feeBasisPoint === market.feeBasisPoint
                );
                return !isMarketInState;
              });
              set((state) => ({ markets: [...state.markets, ...marketsToAdd] }), false, 'fetchMarkets');
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
        refetchTdexProvidersAndMarkets: async () => {
          try {
            await get().clearProviders();
            await get().clearMarkets();
            await get().fetchProviders();
            await get().fetchMarkets();
          } catch {
            useToastStore.getState().addErrorToast(TDEXRegistryError);
          }
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
