import {
  IonAlert,
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonModal,
  IonPage,
  IonRow,
  IonText,
} from '@ionic/react';
import { addCircleOutline, refreshCircleOutline, trash } from 'ionicons/icons';
import React, { useState } from 'react';
import type { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router';
import type { Dispatch } from 'redux';
import type { NetworkString } from 'tdex-sdk';

import ButtonsMainSub from '../../components/ButtonsMainSub';
import Header from '../../components/Header';
import type { TDEXProvider } from '../../redux/actionTypes/tdexActionTypes';
import './style.scss';
import { addProvider, clearMarkets, deleteProvider, updateMarkets } from '../../redux/actions/tdexActions';
import { addErrorToast, addSuccessToast } from '../../redux/actions/toastActions';
import { defaultProviderEndpoints } from '../../redux/config';
import { useTypedDispatch } from '../../redux/hooks';
import { TDEXRegistryError } from '../../utils/errors';
import { getProvidersFromTDexRegistry } from '../../utils/tdex';

interface LiquidityProvidersProps extends RouteComponentProps {
  network: NetworkString;
  providers: TDEXProvider[];
}

export const refreshProviders = async (
  providers: TDEXProvider[],
  network: NetworkString,
  dispatch: Dispatch
): Promise<void> => {
  if (network === 'liquid') {
    try {
      const providersFromRegistry = await getProvidersFromTDexRegistry();
      const currentEndpoints = providers.map((provider) => provider.endpoint);
      const newProviders = providersFromRegistry.filter((p) => !currentEndpoints.includes(p.endpoint));

      const actions = newProviders.map(addProvider);
      const toastSuccessAction = addSuccessToast(`${actions.length} new providers from TDEX registry!`);
      [...actions, toastSuccessAction].forEach(dispatch);
    } catch {
      dispatch(addErrorToast(TDEXRegistryError));
    }
  } else if (network === 'testnet') {
    dispatch(addProvider({ endpoint: defaultProviderEndpoints.testnet, name: 'Default provider' }));
  } else {
    dispatch(addProvider({ endpoint: defaultProviderEndpoints.regtest, name: 'Default provider' }));
  }
};

const LiquidityProviders: React.FC<LiquidityProvidersProps> = ({ providers, network }) => {
  const dispatch = useTypedDispatch();
  const [providerToDelete, setProviderToDelete] = useState<TDEXProvider>();
  const [newProvider, setNewProvider] = useState(false);
  const [newProviderName, setNewProviderName] = useState('');
  const [newProviderEndpoint, setNewProviderEndpoint] = useState('');
  const [registryFetching, setRegistryFetching] = useState(false);

  const isDuplicateProviderEndpoint = () =>
    newProvider && providers.some((provider) => provider.endpoint === newProviderEndpoint);
  const isNewProviderInvalid = () =>
    newProviderName.trim() === '' || newProviderEndpoint.trim() === '' || isDuplicateProviderEndpoint();

  const alertButtons = [
    {
      text: 'Abort',
      role: 'cancel',
      handler: () => setProviderToDelete(undefined),
    },
    {
      text: 'Delete',
      handler: () => {
        if (providerToDelete) {
          dispatch(deleteProvider(providerToDelete));
          dispatch(clearMarkets());
          dispatch(updateMarkets());
        }
      },
    },
  ];

  return (
    <IonPage>
      <IonAlert
        header="Confirm delete"
        isOpen={providerToDelete !== undefined}
        buttons={alertButtons}
        message={`Delete the provider ${providerToDelete?.name} - ${providerToDelete?.endpoint}.`}
        onDidDismiss={() => setProviderToDelete(undefined)}
      />

      <IonContent>
        <IonModal
          isOpen={newProvider}
          onDidDismiss={() => setNewProvider(false)}
          onWillPresent={() => {
            setNewProviderName('');
            setNewProviderEndpoint('');
          }}
        >
          <IonContent>
            <IonGrid>
              <Header
                hasBackButton={false}
                hasCloseButton={true}
                title="CREATE NEW PROVIDER"
                handleClose={() => setNewProvider(false)}
              />
              <IonRow>
                <IonCol>
                  <IonList>
                    <IonItem>
                      <IonLabel position="stacked">Provider name</IonLabel>
                      <IonInput
                        required
                        value={newProviderName}
                        onIonChange={(e) => setNewProviderName(e.detail.value || '')}
                        inputmode="text"
                        placeholder="name the provider to add"
                      />
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked">Endpoint</IonLabel>
                      <IonInput
                        color={isDuplicateProviderEndpoint() ? 'danger' : undefined}
                        required
                        value={newProviderEndpoint}
                        onIonChange={(e) => setNewProviderEndpoint(e.detail.value || '')}
                        inputmode="url"
                        placeholder="i.e http://localhost:9945"
                      />
                      {isDuplicateProviderEndpoint() && (
                        <span className="ion-text-right">
                          <IonText color="danger">This provider already exists</IonText>
                        </span>
                      )}
                    </IonItem>
                  </IonList>
                </IonCol>
              </IonRow>
              <IonRow className="ion-margin-vertical-x2">
                <IonCol>
                  <ButtonsMainSub
                    mainTitle="CONFIRM"
                    subTitle="CANCEL"
                    mainDisabled={isNewProviderInvalid()}
                    mainOnClick={() => {
                      setNewProvider(false);
                      dispatch(
                        addProvider({
                          endpoint: newProviderEndpoint.trim(),
                          name: newProviderName.trim(),
                        })
                      );
                    }}
                    subOnClick={() => setNewProvider(false)}
                  />
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonContent>
        </IonModal>

        <IonGrid>
          <Header title="TDEX PROVIDERS" hasBackButton={true} />
          <IonList>
            <IonListHeader>Providers</IonListHeader>
            {providers.map((provider: TDEXProvider, index: number) => {
              return (
                <IonItem className="provider-container" key={index}>
                  <div className="provider-data">
                    <h2 className="provider-name">{provider.name}</h2>
                    <p className="provider-endpoint">{provider.endpoint}</p>
                  </div>
                  <div className="button-delete ion-text-right">
                    <IonButton
                      color="danger"
                      slot="icon-only"
                      onClick={() => setProviderToDelete(provider)}
                      disabled={providerToDelete != undefined}
                    >
                      <IonIcon icon={trash} />
                    </IonButton>
                  </div>
                </IonItem>
              );
            })}
          </IonList>
          <IonRow className="ion-margin-vertical-x2">
            <IonCol size="12">
              <IonButton className="main-button" onClick={() => setNewProvider(true)}>
                <IonIcon slot="start" icon={addCircleOutline} />
                ADD PROVIDER
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton
                className="main-button"
                disabled={registryFetching}
                onClick={async () => {
                  setRegistryFetching(true);
                  await refreshProviders(providers, network, dispatch);
                  setRegistryFetching(false);
                }}
              >
                <IonIcon slot="start" icon={refreshCircleOutline} />
                Refresh
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(LiquidityProviders);
