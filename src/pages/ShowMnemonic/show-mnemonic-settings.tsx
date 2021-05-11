import React, { useRef, useState } from 'react';
import { useLocation } from 'react-router';
import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonButton,
  IonCol,
} from '@ionic/react';
import { Clipboard } from '@ionic-native/clipboard';
import WordList from '../../components/WordList';
import Header from '../../components/Header';

interface LocationState {
  mnemonic: string;
}

const ShowMnemonicSettings: React.FC = () => {
  const { state } = useLocation<LocationState>();
  const [copied, setCopied] = useState<boolean>(false);
  const mnemonicRef: any = useRef(null);

  const copyMnemonic = () => {
    if (mnemonicRef && state?.mnemonic) {
      Clipboard.copy(state?.mnemonic)
        .then((res: any) => {
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
          }, 2000);
        })
        .catch((e: any) => {
          mnemonicRef.current.select();
          document.execCommand('copy');
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
        <Header hasBackButton={true} title="SHOW MNEMONIC" />
        <IonGrid className="ion-text-center ion-justify-content-center">
          <h2 className="ion-text-center">Secret Phrase</h2>
          <IonRow>
            <IonCol>
              <WordList mnemonic={state?.mnemonic ?? ''} />
            </IonCol>
          </IonRow>

          <input
            type="text"
            ref={mnemonicRef}
            value={state?.mnemonic}
            onChange={() => null}
            className="hidden-input"
          />

          <IonRow className="ion-margin-bottom">
            <IonCol size="8" offset="2">
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
