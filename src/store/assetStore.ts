import axios from 'axios';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

import type { NetworkString } from '../utils/constants';
import { defaultPrecision, LBTC_ASSET, MAIN_ASSETS, USDT_ASSET } from '../utils/constants';
import { isLbtc, isUsdt } from '../utils/helpers';

import { storage } from './capacitorPersistentStorage';
import { useSettingsStore } from './settingsStore';

export interface Asset {
  assetHash: string;
  coinGeckoID?: string;
  name?: string;
  precision?: number;
  ticker: string;
}

export interface AssetState {
  assets: Record<string, Asset>;
}

interface AssetActions {
  fetchAssetData: (assetHash: string) => Promise<void>;
  resetAssetStore: () => void;
}

const initialAssets = (network?: NetworkString): Record<string, Asset> => {
  const result: Record<string, Asset> = {};
  for (const assetConf of MAIN_ASSETS[network as NetworkString]) {
    result[assetConf.assetHash] = assetConf;
  }
  return result;
};

export const useAssetStore = create<AssetState & AssetActions>()(
  devtools(
    persist(
      (set, get) => ({
        assets: {},
        fetchAssetData: async (assetHash: string) => {
          const network = useSettingsStore.getState().network;
          if (get().assets[assetHash]?.assetHash) return;
          // Return constants to include coinGeckoID field and name
          if (isLbtc(assetHash, network)) {
            set(
              (state) => ({ assets: { ...state.assets, [assetHash]: LBTC_ASSET[network] } }),
              false,
              'fetchAssetData/lbtc'
            );
            return;
          }
          if (isUsdt(assetHash, network)) {
            set(
              (state) => ({ assets: { ...state.assets, [assetHash]: USDT_ASSET[network] } }),
              false,
              'fetchAssetData/usdt'
            );
            return;
          }
          // Fetch data from explorer
          let precision, ticker, name;
          try {
            const res = (await axios.get(`${useSettingsStore.getState().explorerLiquidAPI}/asset/${assetHash}`)).data;
            precision = res.precision;
            ticker = res.ticker;
            name = res.name;
          } catch (err) {
            console.error(err);
          } finally {
            const assetData = {
              assetHash,
              precision: precision ?? defaultPrecision,
              ticker: ticker || assetHash.slice(0, 4).toUpperCase(),
              name: name ?? 'Unknown',
            };
            set((state) => ({ assets: { ...state.assets, [assetHash]: assetData } }), false, 'fetchAssetData');
          }
        },
        resetAssetStore: () =>
          set({ assets: initialAssets(useSettingsStore.getState().network) }, false, 'resetAssetStore'),
      }),
      {
        name: 'asset',
        storage: createJSONStorage(() => storage),
      }
    ),
    { name: 'store', store: 'asset' }
  )
);
