import React, { useState } from 'react';
import {
  IonAlert,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonModal,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { RouteComponentProps, withRouter } from 'react-router';
import { TDEXProvider } from '../../redux/actionTypes/tdexActionTypes';
import { chevronBackOutline, closeOutline, trash } from 'ionicons/icons';
import './style.scss';
import { useDispatch } from 'react-redux';
import {
  addProvider,
  clearMarkets,
  deleteProvider,
  updateMarkets,
} from '../../redux/actions/tdexActions';

interface LiquidityProvidersProps extends RouteComponentProps {
  providers: TDEXProvider[];
}

const LiquidityProviders: React.FC<LiquidityProvidersProps> = ({
  history,
  providers,
}) => {
  const dispatch = useDispatch();
  const [providerToDelete, setProviderToDelete] = useState<TDEXProvider>();
  const [newProvider, setNewProvider] = useState(false);
  const [newProviderName, setNewProviderName] = useState('');
  const [newProviderEndpoint, setNewProviderEndpoint] = useState('');

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
      <IonHeader className="ion-no-border">
        <IonToolbar className="with-back-button">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" text="" icon={chevronBackOutline} />
          </IonButtons>
          <IonTitle>TDEX providers</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList>
          <IonListHeader>Providers</IonListHeader>
          {providers.map((provider: TDEXProvider, index: number) => {
            return (
              <IonItem key={index}>
                <div className="provider">
                  <h2 className="provider-name">{provider.name}</h2>
                  <p className="provider-endpoint">{provider.endpoint}</p>
                </div>
                <div className="button-delete">
                  <IonButton
                    color="danger"
                    onClick={() => setProviderToDelete(provider)}
                    disabled={providerToDelete != undefined}
                  >
                    {' '}
                    <IonIcon icon={trash} />
                  </IonButton>
                </div>
              </IonItem>
            );
          })}
        </IonList>
        <div className="buttons">
          <IonButton
            className="main-button"
            onClick={() => setNewProvider(true)}
          >
            ADD PROVIDER
          </IonButton>
        </div>
        <IonModal
          isOpen={newProvider}
          onDidDismiss={() => setNewProvider(false)}
          onWillPresent={() => {
            setNewProviderName('');
            setNewProviderEndpoint('');
          }}
        >
          <IonHeader>
            <IonToolbar className="with-back-button">
              <IonButtons slot="start">
                <IonButton
                  onClick={() => {
                    setNewProvider(false);
                  }}
                >
                  <IonIcon slot="icon-only" icon={closeOutline} />
                </IonButton>
              </IonButtons>
              <IonTitle>Create new provider</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
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
                  required
                  value={newProviderEndpoint}
                  onIonChange={(e) =>
                    setNewProviderEndpoint(e.detail.value || '')
                  }
                  inputmode="url"
                  placeholder="i.e http://localhost:9945"
                />
              </IonItem>
            </IonList>
            <div className="buttons">
              <IonButton
                className="main-button"
                disabled={
                  newProviderName.trim() === '' ||
                  newProviderEndpoint.trim() === ''
                }
                onClick={() => {
                  setNewProvider(false);
                  dispatch(
                    addProvider({
                      endpoint: newProviderEndpoint.trim(),
                      name: newProviderName.trim(),
                    })
                  );
                }}
              >
                CONFIRM
              </IonButton>
              <IonButton
                className="main-button secondary"
                onClick={() => setNewProvider(false)}
              >
                CANCEL
              </IonButton>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(LiquidityProviders);
