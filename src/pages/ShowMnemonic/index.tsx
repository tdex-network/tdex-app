import { IonContent, IonPage, IonGrid, IonRow, IonButton, IonCol } from '@ionic/react';
import React, { useState } from 'react';
import type { RouteComponentProps } from 'react-router';
import { useLocation } from 'react-router';

import Checkbox from '../../components/Checkbox';
import Header from '../../components/Header';
import PageDescription from '../../components/PageDescription';
import WordList from '../../components/WordList';
import { routerLinks } from '../../routes';
import type { AppError } from '../../utils/errors';

interface ShowMnemonicProps extends RouteComponentProps {
  // connected redux props
  setIsBackupDone: (done: boolean) => void;
  onError: (err: AppError) => void;
}

interface LocationState {
  mnemonic: string;
}

const ShowMnemonic: React.FC<ShowMnemonicProps> = ({ history, setIsBackupDone }) => {
  const [isSeedSaved, setIsSeedSaved] = useState(false);
  const { state } = useLocation<LocationState>();

  return (
    <IonPage>
      <IonContent className="show-mnemonic-content">
        <IonGrid className="ion-text-center ion-justify-content-center">
          <Header hasBackButton={false} title="SHOW MNEMONIC" />
          <PageDescription
            description="Save your 12 words recovery phrase in the correct order"
            title="Secret Phrase"
          />
          <IonRow>
            <IonCol>
              <WordList mnemonic={state?.mnemonic ?? ''} />
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
                  history.push({ pathname: routerLinks.deposit });
                }}
              >
                CONTINUE TO DEPOSIT
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default ShowMnemonic;
