import axios from 'axios';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

import {
  getMarketsFromProviderV1,
  getMarketsFromProviderV2,
  getProvidersFromTDexRegistry,
} from '../services/tdexService';
import type {
  TDEXProvider,
  TDEXProviderWithVersion,
  TDEXMarket as TDEXMarketV1,
} from '../services/tdexService/v1/tradeCore';
import type { TDEXMarket as TDEXMarketV2 } from '../services/tdexService/v2/tradeCore';
import { TDEXRegistryError } from '../utils/errors';

import { storage } from './capacitorPersistentStorage';
import { defaultProviderEndpoints } from './config';
import { useSettingsStore } from './settingsStore';
import { useToastStore } from './toastStore';

interface TdexState {
  providers: TDEXProviderWithVersion[];
  markets: { v1: TDEXMarketV1[]; v2: TDEXMarketV2[] };
}

export interface TdexActions {
  addProviders: (providers: TDEXProviderWithVersion[]) => void;
  clearMarkets: () => void;
  clearProviders: () => void;
  deleteProvider: (provider: TDEXProvider) => void;
  getProtoVersion: (providerEndpoint: string) => Promise<'v1' | 'v2'>;
  fetchMarkets: () => Promise<void>;
  fetchProviders: () => Promise<void>;
  refetchTdexProvidersAndMarkets: () => Promise<void>;
  replaceMarketsOfProvider: (providerToUpdate: TDEXProvider, markets: TDEXMarketV1[]) => void;
  resetTdexStore: () => void;
}

const initialState: TdexState = {
  providers: [],
  markets: { v1: [], v2: [] },
};

export const useTdexStore = create<TdexState & TdexActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        addProviders: (providers) => {
          set(
            (state) => {
              const newProviders: TDEXProviderWithVersion[] = [];
              providers.forEach((p) => {
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
        clearMarkets: () => set({ markets: { v1: [], v2: [] } }, false, 'clearMarkets'),
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
          const marketsV1ToAdd: TDEXMarketV1[] = [];
          const marketsV2ToAdd: TDEXMarketV2[] = [];
          const allMarkets = await Promise.allSettled(
            get().providers.map((p) => {
              if (p.version === 'v1') {
                return getMarketsFromProviderV1(p, torProxy);
              } else {
                return getMarketsFromProviderV2(p, torProxy);
              }
            })
          );
          allMarkets
            .map((promise) => (promise.status === 'fulfilled' && promise.value ? promise.value : []))
            .forEach((markets) => {
              if (markets.length > 0) {
                // Check if markets are already in state
                if (markets[0].provider.version === 'v1') {
                  marketsV1ToAdd.push(...(markets as TDEXMarketV1[]));
                } else {
                  marketsV2ToAdd.push(...(markets as TDEXMarketV2[]));
                }
              }
            });
          set(
            (state) => ({
              markets: {
                v1: marketsV1ToAdd,
                v2: marketsV2ToAdd,
              },
            }),
            false,
            'fetchMarkets'
          );
        },
        fetchProviders: async () => {
          const network = useSettingsStore.getState().network;
          const providers: TDEXProviderWithVersion[] = [];
          if (network === 'liquid' || network === 'testnet') {
            const providersFromRegistry = await getProvidersFromTDexRegistry(network);
            for (const provider of providersFromRegistry) {
              const version = await get().getProtoVersion(provider.endpoint);
              providers.push({ ...provider, version });
            }
            get().addProviders(providers);
          } else {
            get().addProviders([
              { endpoint: defaultProviderEndpoints.regtest, name: 'Default provider', version: 'v1' },
            ]);
          }
        },
        getProtoVersion: async (providerEndpoint) => {
          try {
            const res = await axios.post(`${providerEndpoint}/v1/info`, { list_services: '' });
            const isVersion2 = res.data.result.listServicesResponse.service
              .map((s: any) => s.name)
              .includes('tdex.v2.TransportService');
            return isVersion2 ? 'v2' : 'v1';
          } catch (err) {
            return 'v1';
          }
        },
        replaceMarketsOfProvider: (providerToUpdate, markets) => {
          set(
            (state) => {
              // Remove markets of provider received in arg
              const marketsWithoutProviderToUpdateV1 = state.markets.v1.filter(
                (market) => market.provider.endpoint !== (providerToUpdate as TDEXProvider).endpoint
              );
              const marketsWithoutProviderToUpdateV2 = state.markets.v2.filter(
                (market) => market.provider.endpoint !== (providerToUpdate as TDEXProvider).endpoint
              );
              return {
                ...state,
                markets: {
                  v1: marketsWithoutProviderToUpdateV1,
                  v2: marketsWithoutProviderToUpdateV2,
                },
              };
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
