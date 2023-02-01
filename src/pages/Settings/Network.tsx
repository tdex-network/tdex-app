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
// import * as ecc from 'tiny-secp256k1';

import Header from '../../components/Header';
import PageDescription from '../../components/PageDescription';
import { useRefreshProviders } from '../../hooks/useRefreshProviders';
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
import { useToastStore } from '../../store/toastStore';
import { useWalletStore } from '../../store/walletStore';
import type { NetworkString } from '../../utils/constants';
import { AppError, AppIsBusy } from '../../utils/errors';

const Network = (): JSX.Element => {
  const isFetchingUtxos = useAppStore((state) => state.isFetchingUtxos);
  const isFetchingMarkets = useAppStore((state) => state.isFetchingMarkets);
  const isFetchingTransactions = useAppStore((state) => state.isFetchingTransactions);
  const resetAssets = useAssetStore((state) => state.resetAssets);
  const setExplorerLiquidAPI = useSettingsStore((state) => state.setExplorerLiquidAPI);
  const setExplorerLiquidUI = useSettingsStore((state) => state.setExplorerLiquidUI);
  const setExplorerBitcoinAPI = useSettingsStore((state) => state.setExplorerBitcoinAPI);
  const setExplorerBitcoinUI = useSettingsStore((state) => state.setExplorerBitcoinUI);
  const setNetwork = useSettingsStore((state) => state.setNetwork);
  const setDefaultProvider = useSettingsStore((state) => state.setDefaultProvider);
  const setElectrsBatchApi = useSettingsStore((state) => state.setElectrsBatchApi);
  const network = useSettingsStore((state) => state.network);
  const addSuccessToast = useToastStore((state) => state.addSuccessToast);
  const addErrorToast = useToastStore((state) => state.addErrorToast);
  const masterPublicKey = useWalletStore((state) => state.masterPublicKey);
  const masterBlindingKey = useWalletStore((state) => state.masterBlindingKey);
  //
  const refreshProviders = useRefreshProviders();

  const handleNetworkChange = async (ev: CustomEvent<SelectChangeEventDetail<NetworkString>>) => {
    try {
      if (isFetchingUtxos || isFetchingMarkets || isFetchingTransactions) throw AppIsBusy;
      const networkValue = ev.detail.value;
      setNetwork(networkValue);
      // We set explorer endpoints to Mempool. User can then adjust favorite endpoints in Explorer setting screen.
      if (network === 'liquid') {
        setExplorerLiquidAPI(mempoolExplorerEndpoints.liquid.explorerLiquidAPI);
        setExplorerLiquidUI(mempoolExplorerEndpoints.liquid.explorerLiquidUI);
        setExplorerBitcoinAPI(mempoolExplorerEndpoints.liquid.explorerBitcoinAPI);
        setExplorerBitcoinUI(mempoolExplorerEndpoints.liquid.explorerBitcoinUI);
        setElectrsBatchApi(configProduction.explorers.electrsBatchAPI);
        setDefaultProvider(defaultProviderEndpoints.liquid);
      } else if (network === 'testnet') {
        setExplorerLiquidAPI(mempoolExplorerEndpoints.testnet.explorerLiquidAPI);
        setExplorerLiquidUI(mempoolExplorerEndpoints.testnet.explorerLiquidUI);
        setExplorerBitcoinAPI(mempoolExplorerEndpoints.testnet.explorerBitcoinAPI);
        setExplorerBitcoinUI(mempoolExplorerEndpoints.testnet.explorerBitcoinUI);
        setElectrsBatchApi(configTestnet.explorers.electrsBatchAPI);
        setDefaultProvider(defaultProviderEndpoints.testnet);
      } else {
        setExplorerLiquidAPI('http://localhost:3001');
        setExplorerBitcoinAPI('http://localhost:3000');
        setExplorerBitcoinUI('http://localhost:5000');
        setExplorerLiquidUI('http://localhost:5001');
        setElectrsBatchApi(configRegtest.explorers.electrsBatchAPI);
        setDefaultProvider(defaultProviderEndpoints.regtest);
      }
      await refreshProviders();
      resetAssets(networkValue);
      // clearAddresses();
      // resetUtxos();
      // resetTransactionReducer();
      // resetBtcReducer();
      /*
      const masterPubKeyIdentity = new MasterPublicKey({
        chain: network,
        type: IdentityType.MasterPublicKey,
        opts: {
          masterPublicKey: masterPubKey,
          masterBlindingKey: masterBlindKey,
          baseDerivationPath: network === 'liquid' ? BASE_DERIVATION_PATH_MAINNET_LEGACY : BASE_DERIVATION_PATH_TESTNET,
        },
        ecclib: ecc,
      });
       */
      // signIn(masterPubKeyIdentity);
      addSuccessToast(`Network and explorer endpoints successfully updated`);
    } catch (err) {
      console.error(err);
      if (err instanceof AppError) {
        addErrorToast(err);
      }
    }
  };

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
