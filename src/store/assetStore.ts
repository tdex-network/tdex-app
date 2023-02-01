import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

import type { NetworkString } from '../utils/constants';
import { MAIN_ASSETS } from '../utils/constants';

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
  setAsset: (asset: Asset) => void;
  resetAssets: (network: NetworkString) => void;
}

const initialAssets = (network?: NetworkString): Record<string, Asset> => {
  const result: Record<string, Asset> = {};
  for (const assetConf of MAIN_ASSETS[network as NetworkString]) {
    result[assetConf.assetHash] = assetConf;
  }
  return result;
};

const network = useSettingsStore.getState().network;

export const useAssetStore = create<AssetState & AssetActions>()(
  devtools(
    persist(
      (set) => ({
        assets: initialAssets(network),
        setAsset: (asset) => set({ assets: { [asset.assetHash]: asset } }, false, 'setAsset'),
        resetAssets: (network: NetworkString) => set({ assets: initialAssets(network) }, false, 'resetAssets'),
      }),
      {
        name: 'asset',
        storage: createJSONStorage(() => storage),
      }
    ),
    { name: 'store', store: 'asset' }
  )
);
