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
import { IdentityType, MasterPublicKey } from 'ldk';
import React, { useState } from 'react';
import type { NetworkString } from 'tdex-sdk';
import * as ecc from 'tiny-secp256k1';

import Header from '../../components/Header';
import PageDescription from '../../components/PageDescription';
import { signIn } from '../../redux/actions/appActions';
import { resetAssets } from '../../redux/actions/assetsActions';
import { resetBtcReducer } from '../../redux/actions/btcActions';
import {
  setDefaultProvider,
  setElectrsBatchApi,
  setExplorerBitcoinAPI,
  setExplorerBitcoinUI,
  setExplorerLiquidAPI,
  setExplorerLiquidUI,
  setNetwork,
} from '../../redux/actions/settingsActions';
import { addErrorToast, addSuccessToast } from '../../redux/actions/toastActions';
import { resetTransactionReducer } from '../../redux/actions/transactionsActions';
import { clearAddresses, resetUtxos } from '../../redux/actions/walletActions';
import {
  configProduction,
  configRegtest,
  configTestnet,
  defaultProviderEndpoints,
  mempoolExplorerEndpoints,
} from '../../redux/config';
import { useTypedDispatch, useTypedSelector } from '../../redux/hooks';
import { BASE_DERIVATION_PATH_MAINNET_LEGACY, BASE_DERIVATION_PATH_TESTNET } from '../../utils/constants';
import { AppError, AppIsBusy } from '../../utils/errors';
import { refreshProviders } from '../LiquidityProvider';

const Network = (): JSX.Element => {
  const dispatch = useTypedDispatch();
  const {
    isFetchingUtxos,
    isFetchingMarkets,
    isFetchingTransactions,
    masterPubKey,
    masterBlindKey,
    network: networkReduxState,
    providers,
  } = useTypedSelector(({ settings, tdex, wallet, app }) => ({
    isFetchingUtxos: app.isFetchingUtxos,
    isFetchingMarkets: app.isFetchingMarkets,
    isFetchingTransactions: app.isFetchingTransactions,
    masterPubKey: wallet.masterPubKey,
    masterBlindKey: wallet.masterBlindKey,
    network: settings.network,
    providers: tdex.providers,
  }));
  const [networkSelectState, setNetworkSelectState] = useState<NetworkString>(networkReduxState);

  const handleNetworkChange = async (ev: CustomEvent<SelectChangeEventDetail<NetworkString>>) => {
    try {
      if (isFetchingUtxos || isFetchingMarkets || isFetchingTransactions) throw AppIsBusy;
      const network = ev.detail.value;
      setNetworkSelectState(network);
      dispatch(setNetwork(network));
      // We set explorer endpoints to Mempool. User can then adjust favorite endpoints in Explorer setting screen.
      if (network === 'liquid') {
        dispatch(setExplorerLiquidAPI(mempoolExplorerEndpoints.liquid.explorerLiquidAPI));
        dispatch(setExplorerLiquidUI(mempoolExplorerEndpoints.liquid.explorerLiquidUI));
        dispatch(setExplorerBitcoinAPI(mempoolExplorerEndpoints.liquid.explorerBitcoinAPI));
        dispatch(setExplorerBitcoinUI(mempoolExplorerEndpoints.liquid.explorerBitcoinUI));
        dispatch(setElectrsBatchApi(configProduction.explorers.electrsBatchAPI));
        dispatch(setDefaultProvider(defaultProviderEndpoints.liquid));
      } else if (network === 'testnet') {
        dispatch(setExplorerLiquidAPI(mempoolExplorerEndpoints.testnet.explorerLiquidAPI));
        dispatch(setExplorerLiquidUI(mempoolExplorerEndpoints.testnet.explorerLiquidUI));
        dispatch(setExplorerBitcoinAPI(mempoolExplorerEndpoints.testnet.explorerBitcoinAPI));
        dispatch(setExplorerBitcoinUI(mempoolExplorerEndpoints.testnet.explorerBitcoinUI));
        dispatch(setElectrsBatchApi(configTestnet.explorers.electrsBatchAPI));
        dispatch(setDefaultProvider(defaultProviderEndpoints.testnet));
      } else {
        dispatch(setExplorerLiquidAPI('http://localhost:3001'));
        dispatch(setExplorerBitcoinAPI('http://localhost:3000'));
        dispatch(setExplorerBitcoinUI('http://localhost:5000'));
        dispatch(setExplorerLiquidUI('http://localhost:5001'));
        dispatch(setElectrsBatchApi(configRegtest.explorers.electrsBatchAPI));
        dispatch(setDefaultProvider(defaultProviderEndpoints.regtest));
      }
      // Refresh providers
      await refreshProviders(providers, network, dispatch);
      dispatch(clearAddresses());
      dispatch(resetUtxos());
      dispatch(resetAssets(network));
      dispatch(resetTransactionReducer());
      dispatch(resetBtcReducer());
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
      dispatch(signIn(masterPubKeyIdentity));
      dispatch(addSuccessToast(`Network and explorer endpoints successfully updated`));
    } catch (err) {
      console.error(err);
      if (err instanceof AppError) {
        dispatch(addErrorToast(err));
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
                <IonSelect value={networkSelectState} onIonChange={handleNetworkChange}>
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
