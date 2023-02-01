import { IonButton, IonCol, IonContent, IonGrid, IonInput, IonItem, IonPage, IonRow } from '@ionic/react';
import React, { useState } from 'react';

import Header from '../../components/Header';
import { useSettingsStore } from '../../store/settingsStore';
import { useToastStore } from '../../store/toastStore';

export const TorProxy: React.FC = () => {
  const torProxy = useSettingsStore((state) => state.torProxy);
  const setTorProxy = useSettingsStore((state) => state.setTorProxy);
  const addSuccessToast = useToastStore((state) => state.addSuccessToast);
  const [inputTorProxy, setInputTorProxy] = useState<string>(torProxy);

  return (
    <IonPage id="tor-proxy">
      <IonContent>
        <IonGrid>
          <Header title="TOR PROXY" hasBackButton={true} />
          <IonRow className="ion-margin-vertical">
            <IonCol className="ion-text-left" size="10" offset="1">
              <p data-testid="description-p">
                Natively, web browsers do not support the Tor protocol. That's why we are using a Tor proxy to redirect
                requests to onion endpoints. By default, clients use https://proxy.tdex.network as proxy. If you want to
                use your own, specify your proxy endpoint below.
              </p>
            </IonCol>
          </IonRow>
          {/**/}
          <IonRow className="ion-margin-vertical-x2">
            <IonCol size="10" offset="1">
              <IonItem className="input">
                <IonInput
                  className="ion-text-left"
                  inputmode="text"
                  onIonChange={(e) => setInputTorProxy(e.detail.value || '')}
                  placeholder="https://proxy.tdex.network"
                  value={inputTorProxy}
                />
              </IonItem>
            </IonCol>
          </IonRow>
          {/**/}
          <IonRow className="ion-margin-vertical-x2">
            <IonCol size="9" offset="1.5" sizeMd="6" offsetMd="3">
              <IonRow className="ion-justify-content-center">
                <IonButton
                  className="main-button"
                  disabled={!inputTorProxy}
                  onClick={() => {
                    setTorProxy(inputTorProxy);
                    addSuccessToast(`New Tor proxy endpoint has been saved`);
                  }}
                >
                  SAVE ENDPOINT
                </IonButton>
              </IonRow>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};
