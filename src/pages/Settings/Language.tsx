import type { SelectChangeEventDetail } from '@ionic/core/components';
import {
  IonCol,
  IonContent,
  IonGrid,
  IonItem,
  IonLabel,
  IonPage,
  IonRow,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import i18n from 'i18next';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Header from '../../components/Header';
import PageDescription from '../../components/PageDescription';

const Language = (): JSX.Element => {
  const [languageSelectState, setLanguageSelectState] = useState<string>(i18n.language);
  const { t } = useTranslation();

  const handleLanguageChange = async (ev: CustomEvent<SelectChangeEventDetail<string>>) => {
    const lng = ev.detail.value;
    setLanguageSelectState(lng);
    await i18n.changeLanguage(lng);
  };

  return (
    <IonPage id="settings-language">
      <IonContent>
        <IonGrid>
          <Header
            className="mb-2"
            title={t('settings.menu.general.language.pageTitle')}
            hasBackButton={true}
            hasCloseButton={false}
          />
          <PageDescription
            description={t('settings.menu.general.language.descriptionContent')}
            title={t('settings.menu.general.language.descriptionTitle')}
          />
          <IonRow className="ion-margin-vertical">
            <IonCol size="11" offset="0.5">
              <IonItem className="input">
                <IonLabel>{t('settings.menu.general.language.selectLabel')}</IonLabel>
                <IonSelect selectedText=" " value={languageSelectState} onIonChange={handleLanguageChange}>
                  <IonSelectOption value="en">{t('settings.menu.general.language.optionEnglish')}</IonSelectOption>
                  <IonSelectOption value="fr">{t('settings.menu.general.language.optionFrench')}</IonSelectOption>
                </IonSelect>
              </IonItem>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Language;
