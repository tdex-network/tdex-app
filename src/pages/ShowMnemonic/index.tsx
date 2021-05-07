import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonButton,
  useIonViewWillEnter,
  IonCol,
} from '@ionic/react';
import './style.scss';
import { AppError } from '../../utils/errors';
import { IconCheck } from '../../components/icons';
import { useLocation } from 'react-router';
import WordList from '../../components/WordList';
import * as bip39 from 'bip39';
import Header from '../../components/Header';

interface ShowMnemonicProps {
  // connected redux props
  backupDone: boolean;
  setIsBackupDone: (done: boolean) => void;
  onError: (err: AppError) => void;
}

interface LocationState {
  onboarding: boolean;
}

const ShowMnemonic: React.FC<ShowMnemonicProps> = ({
  backupDone,
  setIsBackupDone,
}) => {
  let { state } = useLocation<LocationState>();
  state = { onboarding: true };
  //const [isSeedSaved, setIsSeedSaved] = useState(false);
  const [mnemonic, setMnemonic] = useState<string>('');

  useIonViewWillEnter(() => {
    setMnemonic(bip39.generateMnemonic());
  });

  return (
    <IonPage>
      <IonContent className="show-mnemonic-content">
        <Header hasBackBtn={state?.onboarding} title="SHOW MNEMONIC" />
        <IonGrid className="ion-text-center ion-justify-content-center">
          <IonRow>
            <IonCol size="8" offset="2">
              <h2>Secret Phrase</h2>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="8" offset="2">
              <p className="ion-no-margin">
                Save your 12-words recovery phrase in the correct order
              </p>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <WordList mnemonic={mnemonic} />
            </IonCol>
          </IonRow>
          <IonRow className="ion-text-center ion-margin-vertical">
            <IonCol size="8" offset="2">
              <label>
                <input
                  type="checkbox"
                  name="seedSave"
                  checked={backupDone}
                  onChange={(e) => setIsBackupDone(e.target.checked)}
                />
                <div className="custom-check">
                  <div className="check-icon">
                    <IconCheck />
                  </div>
                </div>
                <span>I’ve saved my secret phrase</span>
              </label>
            </IonCol>
          </IonRow>
          <IonRow className="ion-margin-vertical-x2">
            <IonCol size="8" offset="2">
              <IonButton className="main-button" disabled={!backupDone}>
                CONTINUE
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default ShowMnemonic;
