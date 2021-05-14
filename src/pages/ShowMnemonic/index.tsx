import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonButton,
  IonCol,
} from '@ionic/react';
import { RouteComponentProps, useLocation } from 'react-router';
import { AppError } from '../../utils/errors';
import WordList from '../../components/WordList';
import Header from '../../components/Header';
import Checkbox from '../../components/Checkbox';
import PageDescription from '../../components/PageDescription';
import { AssetConfig } from '../../utils/constants';

interface ShowMnemonicProps extends RouteComponentProps {
  // connected redux props
  setIsBackupDone: (done: boolean) => void;
  onError: (err: AppError) => void;
}

interface LocationState {
  depositAssets: AssetConfig[];
  mnemonic: string;
}

const ShowMnemonic: React.FC<ShowMnemonicProps> = ({
  history,
  setIsBackupDone,
}) => {
  const [isSeedSaved, setIsSeedSaved] = useState(false);
  const { state } = useLocation<LocationState>();

  return (
    <IonPage>
      <IonContent className="show-mnemonic-content">
        <Header hasBackButton={false} title="SHOW MNEMONIC" />
        <IonGrid className="ion-text-center ion-justify-content-center">
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
            <IonCol size="8" offset="2">
              <IonButton
                className="main-button"
                disabled={!isSeedSaved}
                onClick={() => {
                  setIsBackupDone(true);
                  history.push({
                    pathname: '/deposit',
                    state: { depositAssets: state?.depositAssets },
                  });
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
