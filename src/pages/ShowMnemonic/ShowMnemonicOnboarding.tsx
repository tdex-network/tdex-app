import { IonContent, IonPage, IonGrid, IonRow, IonButton, useIonViewWillEnter, IonCol } from '@ionic/react';
import * as bip39 from 'bip39';
import React, { useState } from 'react';
import { useLocation } from 'react-router';
import type { RouteComponentProps } from 'react-router';

import Checkbox from '../../components/Checkbox';
import Header from '../../components/Header';
import PageDescription from '../../components/PageDescription';
import WordList from '../../components/WordList';
import { useAppStore } from '../../store/appStore';

interface LocationState {
  mnemonic: string;
}

export const ShowMnemonicOnboarding: React.FC<RouteComponentProps> = ({ history }) => {
  const isBackupDone = useAppStore((state) => state.isBackupDone);
  const setIsBackupDone = useAppStore((state) => state.setIsBackupDone);
  //
  const { state } = useLocation<LocationState>();
  const [isSeedSaved, setIsSeedSaved] = useState(false);
  const [mnemonic, setMnemonic] = useState<string>('');

  useIonViewWillEnter(() => {
    if (!isBackupDone || !state?.mnemonic) {
      setMnemonic(bip39.generateMnemonic());
    }
  }, [isBackupDone]);

  return (
    <IonPage>
      <IonContent className="show-mnemonic-content">
        <IonGrid className="ion-text-center ion-justify-content-center">
          <Header hasBackButton={true} title="SHOW MNEMONIC" />
          <PageDescription
            centerDescription={true}
            description="Save your 12 words recovery phrase in the correct order"
            title="Secret Phrase"
          />
          <IonRow>
            <IonCol>
              <WordList mnemonic={mnemonic} />
            </IonCol>
          </IonRow>
          <Checkbox
            handleChange={(checked) => {
              setIsSeedSaved(checked);
              if (!checked) {
                setIsBackupDone(false);
              }
            }}
            inputName="seedSave"
            isChecked={isSeedSaved}
            label={<span>I have saved my secret phrase</span>}
          />
          <IonRow className="ion-margin-vertical-x2">
            <IonCol size="9" offset="1.5">
              <IonButton
                className="main-button"
                disabled={!isSeedSaved}
                onClick={() => {
                  setIsBackupDone(true);
                  history.push({
                    pathname: '/onboarding/pin-setting',
                    state: { mnemonic },
                  });
                }}
              >
                CONTINUE
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};
