import { getProvidersFromTDexRegistry } from '../services/tdexService';
import { defaultProviderEndpoints } from '../store/config';
import { useSettingsStore } from '../store/settingsStore';
import { useTdexStore } from '../store/tdexStore';
import { useToastStore } from '../store/toastStore';
import { TDEXRegistryError } from '../utils/errors';

export const useRefreshProviders = (): (() => Promise<void>) => {
  const addProviders = useTdexStore((state) => state.addProviders);
  const clearMarkets = useTdexStore((state) => state.clearMarkets);
  const providers = useTdexStore((state) => state.providers);
  const clearProviders = useTdexStore((state) => state.clearProviders);
  const addSuccessToast = useToastStore((state) => state.addSuccessToast);
  const addErrorToast = useToastStore((state) => state.addErrorToast);
  const network = useSettingsStore((state) => state.network);

  return async () => {
    if (network === 'liquid' || network === 'testnet') {
      try {
        const providersFromRegistry = await getProvidersFromTDexRegistry(network);
        const currentEndpoints = providers.map((provider) => provider.endpoint);
        const newProviders = providersFromRegistry.filter((p) => !currentEndpoints.includes(p.endpoint));
        if (newProviders.length) {
          clearProviders();
          clearMarkets();
          addProviders(providersFromRegistry);
          await useTdexStore.getState().fetchMarkets();
        }
        addSuccessToast(`${newProviders.length} new providers from TDEX registry!`);
      } catch {
        addErrorToast(TDEXRegistryError);
      }
    } else {
      clearProviders();
      clearMarkets();
      addProviders([{ endpoint: defaultProviderEndpoints.regtest, name: 'Default provider' }]);
      await useTdexStore.getState().fetchMarkets();
    }
  };
};
