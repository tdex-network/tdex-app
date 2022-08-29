import './style.scss';
import { IonContent, IonIcon, IonPage, IonGrid, IonRow, IonCol } from '@ionic/react';
import { warningOutline } from 'ionicons/icons';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import type { RouteComponentProps } from 'react-router';
import type { Dispatch } from 'redux';

import ButtonsMainSub from '../../components/ButtonsMainSub';
import Checkbox from '../../components/Checkbox';
import Header from '../../components/Header';
import PinModal from '../../components/PinModal';
import { setIsBackupDone } from '../../redux/actions/appActions';
import { addErrorToast } from '../../redux/actions/toastActions';
import { useTypedDispatch } from '../../redux/hooks';
import type { RootState } from '../../redux/types';
import { routerLinks } from '../../routes';
import { PIN_TIMEOUT_FAILURE, PIN_TIMEOUT_SUCCESS } from '../../utils/constants';
import type { AppError } from '../../utils/errors';
import { IncorrectPINError } from '../../utils/errors';
import { getMnemonicFromStorage, setSeedBackupFlag } from '../../utils/storage-helper';

interface BackupProps extends RouteComponentProps {
  // connected redux props
  backupDone: boolean;
  setIsBackupDone: (done: boolean) => void;
  onError: (err: AppError) => void;
}

const Backup: React.FC<BackupProps> = ({ history, setIsBackupDone }) => {
  const [isSeedSaved, setIsSeedSaved] = useState<boolean>(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);
  const [needReset, setNeedReset] = useState<boolean>(false);
  const dispatch = useTypedDispatch();

  const handlePinConfirm = async (pin: string) => {
    try {
      const mnemonic = await getMnemonicFromStorage(pin);
      setIsWrongPin(false);
      setTimeout(() => {
        history.push({
          pathname: routerLinks.showMnemonic,
          state: { mnemonic },
        });
        setIsPinModalOpen(false);
        setIsWrongPin(null);
      }, PIN_TIMEOUT_SUCCESS);
    } catch (err) {
      setIsWrongPin(true);
      setTimeout(() => {
        setIsWrongPin(null);
        setNeedReset(true);
      }, PIN_TIMEOUT_FAILURE);
      dispatch(addErrorToast(IncorrectPINError));
      console.error(err);
    }
  };

  return (
    <IonPage>
      <PinModal
        needReset={needReset}
        setNeedReset={setNeedReset}
        open={isPinModalOpen}
        title="Unlock wallet"
        description="Enter your current PIN."
        onConfirm={handlePinConfirm}
        onClose={() => setIsPinModalOpen(false)}
        isWrongPin={isWrongPin}
        setIsWrongPin={setIsWrongPin}
      />
      {/* /// */}
      <IonContent className="backup-content">
        <IonGrid className="ion-text-center ion-justify-content-center">
          <Header hasBackButton={false} title="BACKUP WALLET" />
          <IonRow className="icon-row ion-margin-vertical">
            <IonCol>
              <IonIcon icon={warningOutline} color="success" />
            </IonCol>
          </IonRow>
          <IonRow className="ion-text-center">
            <IonCol offset="1" size="10">
              <h2>Back up your secret phrase</h2>
            </IonCol>
          </IonRow>
          <IonRow className="ion-text-left">
            <IonCol offset="1" size="10">
              <p className="ion-no-margin">
                Your secret 12-words recovery phrase is the only way to recover your funds if you lose access to your
                wallet.
              </p>
              <p>Write it down safely and store it in a secure location.</p>
            </IonCol>
          </IonRow>
          <Checkbox
            className="ion-margin-vertical-x2"
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
          <ButtonsMainSub
            className="ion-margin-vertical-x2"
            mainTitle="CONTINUE TO RECEIVE"
            subTitle="BACKUP NOW"
            mainDisabled={!isSeedSaved}
            mainOnClick={() => history.push({ pathname: routerLinks.deposit })}
            subOnClick={() => {
              setIsPinModalOpen(true);
            }}
          />
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

export default connect(mapStateToProps, mapDispatchToProps)(Backup);
