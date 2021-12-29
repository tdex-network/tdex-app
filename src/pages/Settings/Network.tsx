import type { SelectChangeEventDetail } from '@ionic/core';
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

import Header from '../../components/Header';
import PageDescription from '../../components/PageDescription';
import { signIn } from '../../redux/actions/appActions';
import { resetAssets } from '../../redux/actions/assetsActions';
import {
  setDefaultProvider,
  setExplorerBitcoinAPI,
  setExplorerBitcoinUI,
  setExplorerLiquidAPI,
  setExplorerLiquidUI,
  setNetwork,
} from '../../redux/actions/settingsActions';
import { addErrorToast, addSuccessToast } from '../../redux/actions/toastActions';
import { resetTransactionReducer } from '../../redux/actions/transactionsActions';
import { clearAddresses, resetUtxos, setMasterPublicKey } from '../../redux/actions/walletActions';
import { blockstreamExplorerEndpoints, defaultProviderEndpoints } from '../../redux/config';
import { useTypedDispatch, useTypedSelector } from '../../redux/hooks';
import { AppError, IsAlreadyFetchingUtxosError } from '../../utils/errors';
import { fromXpub } from '../../utils/fromXpub';
import { refreshProviders } from '../LiquidityProvider';

const Network = (): JSX.Element => {
  const dispatch = useTypedDispatch();
  const {
    isFetchingUtxos,
    masterPubKey,
    masterBlindKey,
    network: networkReduxState,
    providers,
  } = useTypedSelector(({ settings, tdex, wallet, app }) => ({
    isFetchingUtxos: app.isFetchingUtxos,
    masterPubKey: wallet.masterPubKey,
    masterBlindKey: wallet.masterBlindKey,
    network: settings.network,
    providers: tdex.providers,
  }));
  const [networkSelectState, setNetworkSelectState] = useState<NetworkString>(networkReduxState);

  const handleNetworkChange = async (ev: CustomEvent<SelectChangeEventDetail<NetworkString>>) => {
    try {
      if (isFetchingUtxos) throw IsAlreadyFetchingUtxosError;
      const network = ev.detail.value;
      setNetworkSelectState(network);
      dispatch(setNetwork(network));
      // We set explorer endpoints to Blockstream. User can then adjust favorite endpoints in Explorer setting screen.
      if (network === 'liquid') {
        dispatch(setExplorerLiquidAPI(blockstreamExplorerEndpoints.liquid.explorerLiquidAPI));
        dispatch(setExplorerLiquidUI(blockstreamExplorerEndpoints.liquid.explorerLiquidUI));
        dispatch(setExplorerBitcoinAPI(blockstreamExplorerEndpoints.liquid.explorerBitcoinAPI));
        dispatch(setExplorerBitcoinUI(blockstreamExplorerEndpoints.liquid.explorerBitcoinUI));
        dispatch(setDefaultProvider(defaultProviderEndpoints.liquid));
      } else if (network === 'testnet') {
        dispatch(setExplorerLiquidAPI(blockstreamExplorerEndpoints.testnet.explorerLiquidAPI));
        dispatch(setExplorerLiquidUI(blockstreamExplorerEndpoints.testnet.explorerLiquidUI));
        dispatch(setExplorerBitcoinAPI(blockstreamExplorerEndpoints.testnet.explorerBitcoinAPI));
        dispatch(setExplorerBitcoinUI(blockstreamExplorerEndpoints.testnet.explorerBitcoinUI));
        dispatch(setDefaultProvider(defaultProviderEndpoints.testnet));
      } else {
        dispatch(setExplorerLiquidAPI('http://localhost:3001'));
        dispatch(setExplorerBitcoinAPI('http://localhost:3000'));
        dispatch(setExplorerBitcoinUI('http://localhost:5000'));
        dispatch(setExplorerLiquidUI('http://localhost:5001'));
        dispatch(setDefaultProvider(defaultProviderEndpoints.regtest));
      }
      // Refresh providers
      await refreshProviders(providers, network, dispatch);
      dispatch(clearAddresses());
      dispatch(resetUtxos());
      dispatch(resetAssets(network));
      dispatch(resetTransactionReducer());
      const newXpub = fromXpub(masterPubKey, network);
      dispatch(setMasterPublicKey(newXpub));
      const masterPubKeyIdentity = new MasterPublicKey({
        chain: network,
        type: IdentityType.MasterPublicKey,
        opts: {
          masterPublicKey: masterPubKey,
          masterBlindingKey: masterBlindKey,
          baseDerivationPath: network === 'regtest' || network === 'testnet' ? "m/84'/1'/0'" : "m/84'/0'/0'",
        },
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
