import { IonButton, IonCol, IonContent, IonGrid, IonPage, IonRow } from '@ionic/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import Header from '../../components/Header';
import WordList from '../../components/WordList';
import { clipboardCopy } from '../../utils/clipboard';

interface LocationState {
  mnemonic: string;
}

const ShowMnemonicSettings: React.FC = () => {
  const { state } = useLocation<LocationState>();
  const [copied, setCopied] = useState<boolean>(false);
  const { t } = useTranslation();

  return (
    <IonPage>
      <IonContent className="show-mnemonic-content">
        <IonGrid className="ion-text-center ion-justify-content-center">
          <Header hasBackButton={true} title={t('settings.general.account.identity.showMnemonic.pageTitle')} />
          <h2 className="ion-text-center">{t('settings.general.account.identity.showMnemonic.pageDescTitle')}</h2>
          <IonRow>
            <IonCol>
              <WordList mnemonic={state?.mnemonic ?? ''} />
            </IonCol>
          </IonRow>
          <IonRow className="ion-margin-bottom">
            <IonCol size="9" offset="1.5">
              <IonButton
                className="main-button"
                onClick={() => {
                  clipboardCopy(state?.mnemonic, () => {
                    setCopied(true);
                    setTimeout(() => {
                      setCopied(false);
                    }, 2000);
                  });
                }}
              >
                {copied ? t('copied') : t('copy')}
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default ShowMnemonicSettings;
