import { IonContent, IonIcon, IonPage, IonGrid, IonRow, IonCol } from '@ionic/react';
import { warningOutline } from 'ionicons/icons';
import React from 'react';

import ButtonsMainSub from '../../components/ButtonsMainSub';
import './style.scss';
import Header from '../../components/Header';
import type { AppError } from '../../utils/errors';

interface BackupProps {
  // connected redux props
  backupDone: boolean;
  setDone: () => void;
  onError: (err: AppError) => void;
}

const BackupOnboarding: React.FC<BackupProps> = () => {
  return (
    <IonPage>
      <IonContent className="backup-onboarding-content">
        <IonGrid className="ion-text-center ion-justify-content-center">
          <Header hasBackButton={true} title="BACKUP WALLET" />
          <IonRow className="icon-row ion-margin-vertical">
            <IonCol>
              <IonIcon icon={warningOutline} color="success" />
            </IonCol>
          </IonRow>
          <IonRow className="ion-text-center">
            <IonCol offset="1" size="10">
              <h2>Back up your secret phrase</h2>
            </IonCol>
          </IonRow>
          <IonRow className="ion-text-left">
            <IonCol offset="1" size="10">
              <p className="ion-no-margin">
                Your secret 12-words recovery phrase is the only way to recover your funds if you lose access to your
                wallet.
              </p>
              <p>Write it down safely and store it in a secure location.</p>
            </IonCol>
          </IonRow>
          <IonRow className="ion-margin-bottom">
            <IonCol>
              <ButtonsMainSub
                mainTitle="BACKUP NOW"
                subTitle="DO IT LATER"
                mainLink="/onboarding/show-mnemonic"
                subLink="/onboarding/pin-setting"
              />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default BackupOnboarding;
