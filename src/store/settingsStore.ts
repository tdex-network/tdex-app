import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

import type { LbtcUnit, NetworkString } from '../utils/constants';
import { CURRENCIES, LBTC_UNITS } from '../utils/constants';

import { storage } from './capacitorPersistentStorage';
import { config } from './config';

export interface Currency {
  name: string;
  symbol: string;
  ticker: 'eur' | 'usd' | 'cad' | 'btc';
}

export interface SettingsState {
  currency: Currency;
  defaultProvider: string;
  lbtcUnit: LbtcUnit;
  explorerLiquidAPI: string;
  explorerBitcoinAPI: string;
  explorerBitcoinUI: string;
  explorerLiquidUI: string;
  electrsBatchAPI: string;
  network: NetworkString;
  torProxy: string;
  websocketExplorerURL: string;
}

interface SettingsActions {
  setCurrency: (currency: Currency) => void;
  setDefaultProvider: (defaultProvider: string) => void;
  setElectrsBatchApi: (electrsBatchAPI: string) => void;
  setExplorerLiquidAPI: (explorerLiquidAPI: string) => void;
  setExplorerBitcoinAPI: (explorerBitcoinAPI: string) => void;
  setExplorerBitcoinUI: (url: string) => void;
  setExplorerLiquidUI: (url: string) => void;
  setLbtcDenomination: (lbtcUnit: LbtcUnit) => void;
  setNetwork: (network: NetworkString) => void;
  setTorProxy: (url: string) => void;
  setWebsocketExplorerURL: (websocketExplorerURL: string) => void;
  resetSettingsStore: () => void;
}

const initialState: SettingsState = {
  currency: CURRENCIES[0],
  defaultProvider: config.defaultProvider.endpoint,
  lbtcUnit: LBTC_UNITS[0],
  explorerLiquidAPI: config.explorers.explorerLiquidAPI,
  explorerBitcoinAPI: config.explorers.explorerBitcoinAPI,
  explorerBitcoinUI: config.explorers.explorerBitcoinUI,
  explorerLiquidUI: config.explorers.explorerLiquidUI,
  electrsBatchAPI: config.explorers.electrsBatchAPI,
  network: config.explorers.chain,
  torProxy: config.torProxy,
  websocketExplorerURL: config.explorers.websocketExplorerURL,
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        setCurrency: (currency) => set({ currency }, false, 'setCurrency'),
        setDefaultProvider: (defaultProvider) => set({ defaultProvider }, false, 'setDefaultProvider'),
        setElectrsBatchApi: (electrsBatchAPI) => set({ electrsBatchAPI }, false, 'setElectrsBatchApi'),
        setExplorerLiquidAPI: (explorerLiquidAPI) => set({ explorerLiquidAPI }, false, 'setExplorerLiquidAPI'),
        setExplorerBitcoinAPI: (explorerBitcoinAPI) => set({ explorerBitcoinAPI }, false, 'setExplorerBitcoinAPI'),
        setExplorerBitcoinUI: (explorerBitcoinUI) => set({ explorerBitcoinUI }, false, 'setExplorerBitcoinUI'),
        setExplorerLiquidUI: (explorerLiquidUI) => set({ explorerLiquidUI }, false, 'setExplorerLiquidUI'),
        setLbtcDenomination: (lbtcUnit) => set({ lbtcUnit }, false, 'setLbtcDenomination'),
        setNetwork: (network) => set({ network }, false, 'setNetwork'),
        setTorProxy: (torProxy) => set({ torProxy }, false, 'setTorProxy'),
        setWebsocketExplorerURL: (websocketExplorerURL) =>
          set({ websocketExplorerURL }, false, 'setWebsocketExplorerURL'),
        resetSettingsStore: () => set(initialState, false, 'resetSettingsStore'),
      }),
      {
        name: 'settings',
        storage: createJSONStorage(() => storage),
      }
    ),
    { name: 'store', store: 'settings' }
  )
);
