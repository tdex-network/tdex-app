import type { SelectChangeEventDetail } from '@ionic/core/components';
import {
  IonCol,
  IonContent,
  IonGrid,
  IonItem,
  IonLabel,
  IonPage,
  IonRow,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import { useEffect } from 'react';

import Header from '../../components/Header';
import PageDescription from '../../components/PageDescription';
import { useAppStore } from '../../store/appStore';
import { useAssetStore } from '../../store/assetStore';
import {
  configProduction,
  configRegtest,
  configTestnet,
  defaultProviderEndpoints,
  mempoolExplorerEndpoints,
} from '../../store/config';
import { useSettingsStore } from '../../store/settingsStore';
import { useTdexStore } from '../../store/tdexStore';
import { useToastStore } from '../../store/toastStore';
import { useWalletStore } from '../../store/walletStore';
import type { NetworkString } from '../../utils/constants';
import { AppError, AppIsBusy } from '../../utils/errors';

const Network = (): JSX.Element => {
  const isFetchingUtxos = useAppStore((state) => state.isFetchingUtxos);
  const isFetchingMarkets = useAppStore((state) => state.isFetchingMarkets);
  const isFetchingTransactions = useAppStore((state) => state.isFetchingTransactions);
  const resetAssetStore = useAssetStore((state) => state.resetAssetStore);
  const setExplorerLiquidAPI = useSettingsStore((state) => state.setExplorerLiquidAPI);
  const setExplorerLiquidUI = useSettingsStore((state) => state.setExplorerLiquidUI);
  const setExplorerBitcoinAPI = useSettingsStore((state) => state.setExplorerBitcoinAPI);
  const setExplorerBitcoinUI = useSettingsStore((state) => state.setExplorerBitcoinUI);
  const setWebsocketExplorerURL = useSettingsStore((state) => state.setWebsocketExplorerURL);
  const setNetwork = useSettingsStore((state) => state.setNetwork);
  const setDefaultProvider = useSettingsStore((state) => state.setDefaultProvider);
  const setElectrsBatchApi = useSettingsStore((state) => state.setElectrsBatchApi);
  const network = useSettingsStore((state) => state.network);
  const refetchTdexProvidersAndMarkets = useTdexStore((state) => state.refetchTdexProvidersAndMarkets);
  const addSuccessToast = useToastStore((state) => state.addSuccessToast);
  const addErrorToast = useToastStore((state) => state.addErrorToast);
  const resetWalletForRestoration = useWalletStore((state) => state.resetWalletForRestoration);
  const sync = useWalletStore((state) => state.sync);
  const computeBalances = useWalletStore((state) => state.computeBalances);
  const subscribeAllScripts = useWalletStore((state) => state.subscribeAllScripts);

  const handleNetworkChange = async (ev: CustomEvent<SelectChangeEventDetail<NetworkString>>) => {
    try {
      if (isFetchingUtxos || isFetchingMarkets || isFetchingTransactions) throw AppIsBusy;
      const networkValue = ev.detail.value;
      setNetwork(networkValue);
    } catch (err) {
      console.error(err);
      if (err instanceof AppError) {
        addErrorToast(err);
      }
    }
  };

  useEffect(() => {
    (async () => {
      try {
        // We set explorer endpoints to Mempool. User can then adjust favorite endpoints in Explorer setting screen.
        if (network === 'liquid') {
          setExplorerLiquidAPI(mempoolExplorerEndpoints.liquid.explorerLiquidAPI);
          setExplorerLiquidUI(mempoolExplorerEndpoints.liquid.explorerLiquidUI);
          setExplorerBitcoinAPI(mempoolExplorerEndpoints.liquid.explorerBitcoinAPI);
          setExplorerBitcoinUI(mempoolExplorerEndpoints.liquid.explorerBitcoinUI);
          setWebsocketExplorerURL(mempoolExplorerEndpoints.liquid.websocketExplorerURL);
          setElectrsBatchApi(configProduction.explorers.electrsBatchAPI);
          setDefaultProvider(defaultProviderEndpoints.liquid);
        } else if (network === 'testnet') {
          setExplorerLiquidAPI(mempoolExplorerEndpoints.testnet.explorerLiquidAPI);
          setExplorerLiquidUI(mempoolExplorerEndpoints.testnet.explorerLiquidUI);
          setExplorerBitcoinAPI(mempoolExplorerEndpoints.testnet.explorerBitcoinAPI);
          setExplorerBitcoinUI(mempoolExplorerEndpoints.testnet.explorerBitcoinUI);
          setWebsocketExplorerURL(mempoolExplorerEndpoints.testnet.websocketExplorerURL);
          setElectrsBatchApi(configTestnet.explorers.electrsBatchAPI);
          setDefaultProvider(defaultProviderEndpoints.testnet);
        } else {
          setExplorerLiquidAPI(configRegtest.explorers.explorerLiquidAPI);
          setExplorerBitcoinAPI(configRegtest.explorers.explorerBitcoinAPI);
          setExplorerBitcoinUI(configRegtest.explorers.explorerBitcoinUI);
          setExplorerLiquidUI(configRegtest.explorers.explorerLiquidUI);
          setWebsocketExplorerURL(configRegtest.explorers.websocketExplorerURL);
          setElectrsBatchApi(configRegtest.explorers.electrsBatchAPI);
          setDefaultProvider(defaultProviderEndpoints.regtest);
        }
        await refetchTdexProvidersAndMarkets();
        resetAssetStore();
        resetWalletForRestoration();
        await sync();
        await subscribeAllScripts();
        await computeBalances();
        addSuccessToast(`Network and explorer endpoints successfully updated`);
      } catch (err) {
        console.error(err);
        if (err instanceof AppError) {
          addErrorToast(err);
        }
      }
    })();
    // Do not include refreshProviders to prevent rerender
    // eslint-disable-next-line
  }, [
    addErrorToast,
    addSuccessToast,
    computeBalances,
    network,
    resetAssetStore,
    resetWalletForRestoration,
    setDefaultProvider,
    setElectrsBatchApi,
    setExplorerBitcoinAPI,
    setExplorerBitcoinUI,
    setExplorerLiquidAPI,
    setExplorerLiquidUI,
    setWebsocketExplorerURL,
    subscribeAllScripts,
    sync,
  ]);

  return (
    <IonPage id="settings-network">
      <IonContent>
        <IonGrid>
          <Header title="NETWORK" hasBackButton={true} hasCloseButton={false} />
          <PageDescription description="Select a network between mainnet, testnet and regtest" title="Set network" />
          <IonRow className="ion-margin-vertical">
            <IonCol size="11" offset="0.5">
              <IonItem className="input">
                <IonLabel>Select your network</IonLabel>
                <IonSelect value={network} onIonChange={handleNetworkChange}>
                  <IonSelectOption value="liquid">Mainnet</IonSelectOption>
                  <IonSelectOption value="testnet">Testnet</IonSelectOption>
                  <IonSelectOption value="regtest">Regtest</IonSelectOption>
                </IonSelect>
              </IonItem>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Network;
