import { useAppStore } from '../store/appStore';
import { useAssetStore } from '../store/assetStore';
import { useBitcoinStore } from '../store/bitcoinStore';
import { useRateStore } from '../store/rateStore';
import { useSettingsStore } from '../store/settingsStore';
import { useTdexStore } from '../store/tdexStore';
import { useToastStore } from '../store/toastStore';
import { useWalletStore } from '../store/walletStore';

export function resetAllStores(): void {
  useAppStore.getState().resetAppStore();
  useAssetStore.getState().resetAssetStore();
  useBitcoinStore.getState().resetBitcoinStore();
  useRateStore.getState().resetRateStore();
  useSettingsStore.getState().resetSettingsStore();
  useTdexStore.getState().resetTdexStore();
  useToastStore.getState().resetToastStore();
  useWalletStore.getState().resetWalletStore();
}
