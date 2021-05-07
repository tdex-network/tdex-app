import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonPage,
  IonGrid,
  IonRow,
} from '@ionic/react';
import React, { ChangeEvent, useState } from 'react';
import { warningOutline } from 'ionicons/icons';
import { AppError } from '../../utils/errors';
import { IconCheck } from '../../components/icons';
import ButtonsMainSub from '../../components/ButtonsMainSub';

interface BackupProps {
  // connected redux props
  backupDone: boolean;
  setDone: () => void;
  onError: (err: AppError) => void;
}

const Backup: React.FC<BackupProps> = ({ setDone }) => {
  const [isSeedSaved, setIsSeedSaved] = useState(false);

  return (
    <IonPage>
      <IonContent className="backup-content">
        <IonHeader className="ion-no-border">
          <IonToolbar>
            <IonTitle>BACKUP WALLET</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonGrid>
          <IonRow className="ion-text-center">
            <IonIcon slot="icon-only" icon={warningOutline} color="success" />
          </IonRow>
          <IonRow className="ion-text-center">
            <h1>Back Up your Secret phrase</h1>
          </IonRow>
          <IonRow className="ion-text-center">
            <p>
              Your secret 12-words recovery phrase is the only way to recover
              your funds if you lose access to your wallet. Write it down safely
              and store it in a secure location.
            </p>
          </IonRow>
          <IonRow className="ion-text-center">
            <label>
              <input
                type="checkbox"
                name="seedSave"
                checked={isSeedSaved}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setIsSeedSaved(e.target.checked)
                }
              />
              <div className="custom-check">
                <div className="check-icon">
                  <IconCheck />
                </div>
              </div>
              I’ve saved my secret phrase
            </label>
          </IonRow>
          <IonRow>
            <ButtonsMainSub
              mainTitle="CONTINUE TO DEPOSIT"
              subTitle="BACKUP NOW"
              mainDisabled={!isSeedSaved}
              mainOnClick={() => ''}
              subOnClick={() => ''}
            />
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Backup;
