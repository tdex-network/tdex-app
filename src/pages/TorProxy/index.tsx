import { IonButton, IonCol, IonContent, IonGrid, IonInput, IonItem, IonPage, IonRow } from '@ionic/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import type { RouteComponentProps } from 'react-router';

import Header from '../../components/Header';
import { setTorProxy } from '../../redux/actions/settingsActions';
import { addSuccessToast } from '../../redux/actions/toastActions';
import { useTypedDispatch } from '../../redux/hooks';
import type { RootState } from '../../redux/types';

interface TorProxyProps extends RouteComponentProps {
  torProxy: string;
}

const TorProxy: React.FC<TorProxyProps> = ({ torProxy }) => {
  const [inputTorProxy, setInputTorProxy] = useState<string>(torProxy);
  const dispatch = useTypedDispatch();
  const { t } = useTranslation();

  return (
    <IonPage id="tor-proxy">
      <IonContent>
        <IonGrid>
          <Header title={t('settings.general.torProxy.pageTitle')} hasBackButton={true} />
          <IonRow className="ion-margin-vertical">
            <IonCol className="ion-text-left" size="10" offset="1">
              <p data-testid="description-p">{t('settings.general.torProxy.desc')}</p>
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
                    dispatch(addSuccessToast(t('settings.general.torProxy.addProxyToastSuccess')));
                  }}
                >
                  {t('settings.general.torProxy.addProxyBtn')}
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
