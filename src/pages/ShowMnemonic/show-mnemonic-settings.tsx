import { Clipboard } from '@ionic-native/clipboard';
import { IonContent, IonPage, IonGrid, IonRow, IonButton, IonCol } from '@ionic/react';
import React, { useState } from 'react';
import { useLocation } from 'react-router';

import Header from '../../components/Header';
import WordList from '../../components/WordList';

interface LocationState {
  mnemonic: string;
}

const ShowMnemonicSettings: React.FC = () => {
  const { state } = useLocation<LocationState>();
  const [copied, setCopied] = useState<boolean>(false);

  const copyMnemonic = () => {
    if (state?.mnemonic) {
      Clipboard.copy(state?.mnemonic)
        .then(() => {
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
          }, 2000);
        })
        .catch(() => {
          // For web platform
          navigator.clipboard.writeText(state?.mnemonic).catch(console.error);
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
          }, 2000);
        });
    }
  };

  return (
    <IonPage>
      <IonContent className="show-mnemonic-content">
        <IonGrid className="ion-text-center ion-justify-content-center">
          <Header hasBackButton={true} title="SHOW MNEMONIC" />
          <h2 className="ion-text-center">Secret Phrase</h2>
          <IonRow>
            <IonCol>
              <WordList mnemonic={state?.mnemonic ?? ''} />
            </IonCol>
          </IonRow>
          <IonRow className="ion-margin-bottom">
            <IonCol size="9" offset="1.5">
              <IonButton className="main-button" onClick={copyMnemonic}>
                {copied ? 'Copied' : 'Copy'}
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default ShowMnemonicSettings;
