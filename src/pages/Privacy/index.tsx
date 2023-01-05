import { IonCol, IonContent, IonGrid, IonPage, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';

import Header from '../../components/Header';

const Privacy: React.FC = () => {
  const { t } = useTranslation();

  return (
    <IonPage id="privacy">
      <IonContent>
        <IonGrid>
          <Header title={t('settings.support.privacy.pageTitle')} hasBackButton={true} />
          <IonRow>
            <IonCol>
              <p>{t('settings.support.privacy.p0')}</p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h3>{t('settings.support.privacy.title')}</h3>

              <h2>{t('settings.support.privacy.t1')}</h2>
              <p>{t('settings.support.privacy.p1')}</p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>{t('settings.support.privacy.t2')}</h2>
              <p>{t('settings.support.privacy.p21')}</p>
              <p>{t('settings.support.privacy.p22')}</p>
              <p>{t('settings.support.privacy.p23')}</p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <p>{t('settings.support.privacy.p3')}</p>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Privacy;
