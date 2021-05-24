import React, { useState } from 'react';
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
} from '@ionic/react';
import { RouteComponentProps, withRouter } from 'react-router';
import { TDEXProvider } from '../../redux/actionTypes/tdexActionTypes';
import { trash } from 'ionicons/icons';
import './style.scss';
import { useDispatch } from 'react-redux';
import {
  addProvider,
  clearMarkets,
  deleteProvider,
  updateMarkets,
} from '../../redux/actions/tdexActions';
import Header from '../../components/Header';
import ButtonsMainSub from '../../components/ButtonsMainSub';

interface LiquidityProvidersProps extends RouteComponentProps {
  providers: TDEXProvider[];
}

const LiquidityProviders: React.FC<LiquidityProvidersProps> = ({
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
                        onIonChange={(e) =>
                          setNewProviderName(e.detail.value || '')
                        }
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
                </IonCol>
              </IonRow>

              <IonRow className="ion-margin-vertical-x2">
                <IonCol>
                  <ButtonsMainSub
                    mainTitle="CONFIRM"
                    subTitle="CANCEL"
                    mainDisabled={
                      newProviderName.trim() === '' ||
                      newProviderEndpoint.trim() === ''
                    }
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
            <IonCol size="9" offset="1.5">
              <IonButton
                className="main-button"
                onClick={() => setNewProvider(true)}
              >
                ADD PROVIDER
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(LiquidityProviders);
