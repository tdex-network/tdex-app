import './style.scss';

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

import ButtonsMainSub from '../../components/ButtonsMainSub';
import Header from '../../components/Header';
import type { TDEXProvider } from '../../services/tdexService/v1/tradeCore';
import { useTdexStore } from '../../store/tdexStore';
import { useToastStore } from '../../store/toastStore';
import type { NetworkString } from '../../utils/constants';
import { InvalidUrl } from '../../utils/errors';

interface LiquidityProvidersProps {
  network: NetworkString;
  providers: TDEXProvider[];
}

export const LiquidityProviders: React.FC<LiquidityProvidersProps> = () => {
  const addProviders = useTdexStore((state) => state.addProviders);
  const clearMarkets = useTdexStore((state) => state.clearMarkets);
  const deleteProvider = useTdexStore((state) => state.deleteProvider);
  const providers = useTdexStore((state) => state.providers);
  const refetchTdexProvidersAndMarkets = useTdexStore((state) => state.refetchTdexProvidersAndMarkets);
  const addErrorToast = useToastStore((state) => state.addErrorToast);
  //
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
      handler: async () => {
        if (providerToDelete) {
          deleteProvider(providerToDelete);
          clearMarkets();
          await useTdexStore.getState().fetchMarkets();
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
                      const url = new URL(newProviderEndpoint);
                      if (
                        newProviderEndpoint.includes('.onion') ||
                        (!newProviderEndpoint.includes('.onion') && url.protocol === 'https:')
                      ) {
                        setNewProvider(false);
                        addProviders([
                          {
                            endpoint: newProviderEndpoint.trim(),
                            name: newProviderName.trim(),
                          },
                        ]);
                      } else {
                        addErrorToast(InvalidUrl);
                      }
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
                      disabled={providerToDelete !== undefined}
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
                  await refetchTdexProvidersAndMarkets();
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
