import React, { useState } from 'react';
import {
  IonAlert,
  IonButton,
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
import { IconBack, IconClose } from '../../components/icons';
import { TDEXProvider } from '../../redux/actionTypes/tdexActionTypes';
import { trash } from 'ionicons/icons';
import './style.scss';
import { useDispatch } from 'react-redux';
import { addProvider, deleteProvider } from '../../redux/actions/tdexActions';
import { update } from '../../redux/actions/appActions';

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
          dispatch(update());
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
      <div className="gradient-background" />
      <IonHeader>
        <IonToolbar className="with-back-button">
          <IonButton
            onClick={() => {
              history.goBack();
            }}
          >
            <IconBack />
          </IonButton>
          <IonTitle>TDEX providers</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList>
          <IonListHeader>Providers</IonListHeader>
          {providers.map((provider: TDEXProvider, index: number) => {
            return (
              <IonItem key={index}>
                <div slot="start">
                  <h3>{provider.name}</h3>
                  <p>Endpoint: {provider.endpoint}</p>
                </div>
                <div slot="end">
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
          <div className="gradient-background" />
          <IonHeader>
            <IonToolbar className="with-back-button">
              <IonButton
                style={{ zIndex: 10 }}
                onClick={() => setNewProvider(false)}
              >
                <IconClose />
              </IonButton>
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
                  type="text"
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
                  type="url"
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
