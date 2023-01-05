import { IonButton, IonCol, IonContent, IonGrid, IonPage, IonRow } from '@ionic/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import type { RouteComponentProps } from 'react-router';
import { useLocation } from 'react-router';
import type { Dispatch } from 'redux';

import Checkbox from '../../components/Checkbox';
import Header from '../../components/Header';
import PageDescription from '../../components/PageDescription';
import WordList from '../../components/WordList';
import { setIsBackupDone } from '../../redux/actions/appActions';
import { addErrorToast } from '../../redux/actions/toastActions';
import type { RootState } from '../../redux/types';
import { routerLinks } from '../../routes';
import type { AppError } from '../../utils/errors';
import { setSeedBackupFlag } from '../../utils/storage-helper';

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
  const { t } = useTranslation();

  return (
    <IonPage>
      <IonContent className="show-mnemonic-content">
        <IonGrid className="ion-text-center ion-justify-content-center">
          <Header hasBackButton={false} title={t('settings.general.account.identity.showMnemonic.pageTitle')} />
          <PageDescription
            centerDescription={true}
            description={t('settings.general.account.identity.showMnemonic.pageDescDesc')}
            title={t('settings.general.account.identity.showMnemonic.pageDescTitle')}
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
            label={<span>{t('settings.general.account.identity.showMnemonic.checkbox')}</span>}
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
                {t('continue')}
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    backupDone: state.app.backupDone,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    setIsBackupDone: (done: boolean) => {
      setSeedBackupFlag(done);
      dispatch(setIsBackupDone(done));
    },
    onError: (err: AppError) => dispatch(addErrorToast(err)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ShowMnemonic);
