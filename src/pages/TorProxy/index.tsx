import { IonButton, IonCol, IonContent, IonGrid, IonInput, IonItem, IonPage, IonRow } from '@ionic/react';
import React, { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import type { RouteComponentProps } from 'react-router';

import Header from '../../components/Header';
import { setTorProxy } from '../../redux/actions/settingsActions';
import { addSuccessToast } from '../../redux/actions/toastActions';
import type { RootState } from '../../redux/types';

interface TorProxyProps extends RouteComponentProps {
  torProxy: string;
}

const TorProxy: React.FC<TorProxyProps> = ({ torProxy }) => {
  const [inputTorProxy, setInputTorProxy] = useState<string>(torProxy);
  const dispatch = useDispatch();

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
                    dispatch(setTorProxy(inputTorProxy));
                    dispatch(addSuccessToast(`New Tor proxy endpoint has been saved`));
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

const mapStateToProps = (state: RootState) => {
  return {
    torProxy: state.settings.torProxy,
  };
};

export default connect(mapStateToProps)(TorProxy);
