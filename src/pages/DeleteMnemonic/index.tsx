import { IonButton, IonCol, IonContent, IonGrid, IonPage, IonRow } from '@ionic/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import type { RouteComponentProps } from 'react-router';
import { useLocation } from 'react-router';

import Header from '../../components/Header';
import PageDescription from '../../components/PageDescription';
import { resetAll } from '../../redux/actions/rootActions';
import { removeMnemonicFromStorage } from '../../utils/storage-helper';

interface LocationState {
  pin: string;
}

const DeleteMnemonic: React.FC<RouteComponentProps> = ({ history }) => {
  const { state } = useLocation<LocationState>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const deleteMnemonic = async () => {
    setIsLoading(true);
    const success = await removeMnemonicFromStorage(state?.pin);
    if (!success) {
      setErrorMsg(t('settings.general.account.security.deleteMnemonic.error'));
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    dispatch(resetAll());
    history.replace('/homescreen');
  };

  return (
    <IonPage id="delete-menemonic">
      <IonContent>
        <IonGrid>
          <Header hasBackButton={true} title={t('settings.general.account.security.deleteMnemonic.pageTitle')} />
          <PageDescription
            description={t('settings.general.account.security.deleteMnemonic.pageDescDesc')}
            title={t('settings.general.account.security.deleteMnemonic.pageDescTitle')}
          />
          <IonRow className="ion-margin-vertical-x2">
            <IonCol size="9" offset="1.5" sizeMd="8" offsetMd="2">
              <IonButton onClick={deleteMnemonic} disabled={isLoading} className="main-button">
                {t('settings.general.account.security.deleteMnemonic.btn')}
              </IonButton>
            </IonCol>
          </IonRow>
          {errorMsg !== '' && <p>{errorMsg}</p>}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default DeleteMnemonic;
