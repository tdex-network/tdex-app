import {
  IonContent,
  IonIcon,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import React, { useState } from 'react';
import { warningOutline } from 'ionicons/icons';
import { AppError, IncorrectPINError } from '../../utils/errors';
import ButtonsMainSub from '../../components/ButtonsMainSub';
import Header from '../../components/Header';
import './style.scss';
import Checkbox from '../../components/Checkbox';
import { RouteComponentProps, useLocation } from 'react-router';
import {
  AssetConfig,
  PIN_TIMEOUT_FAILURE,
  PIN_TIMEOUT_SUCCESS,
} from '../../utils/constants';
import PinModal from '../../components/PinModal';
import { getMnemonicFromSecureStorage } from '../../utils/storage-helper';
import { addErrorToast } from '../../redux/actions/toastActions';
import { useDispatch } from 'react-redux';

interface BackupProps extends RouteComponentProps {
  // connected redux props
  backupDone: boolean;
  setIsBackupDone: (done: boolean) => void;
  onError: (err: AppError) => void;
}

interface LocationState {
  depositAssets: AssetConfig[];
}

const Backup: React.FC<BackupProps> = ({ history, setIsBackupDone }) => {
  const [isSeedSaved, setIsSeedSaved] = useState<boolean>(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);
  const { state } = useLocation<LocationState>();
  const dispatch = useDispatch();

  const handlePinConfirm = async (pin: string) => {
    try {
      const mnemonic = await getMnemonicFromSecureStorage(pin);
      setIsWrongPin(false);
      setTimeout(() => {
        history.push({
          pathname: '/show-mnemonic',
          state: { mnemonic, depositAssets: state?.depositAssets },
        });
        setIsPinModalOpen(false);
        setIsWrongPin(null);
      }, PIN_TIMEOUT_SUCCESS);
    } catch (err) {
      setIsWrongPin(true);
      setTimeout(() => {
        setIsWrongPin(null);
      }, PIN_TIMEOUT_FAILURE);
      dispatch(addErrorToast(IncorrectPINError));
      console.error(err);
    }
  };

  return (
    <IonPage>
      <PinModal
        open={isPinModalOpen}
        title="Unlock wallet"
        description="Enter your current PIN."
        onConfirm={handlePinConfirm}
        onClose={() => setIsPinModalOpen(false)}
        isWrongPin={isWrongPin}
      />
      {/* /// */}
      <IonContent className="backup-content">
        <Header hasBackButton={false} title="BACKUP WALLET" />
        <IonGrid className="ion-text-center ion-justify-content-center">
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
                Your secret 12-words recovery phrase is the only way to recover
                your funds if you lose access to your wallet.
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
            mainTitle="CONTINUE TO DEPOSIT"
            subTitle="BACKUP NOW"
            mainDisabled={!isSeedSaved}
            mainOnClick={() =>
              history.push({
                pathname: '/deposit',
                state: { depositAssets: state?.depositAssets },
              })
            }
            subOnClick={() => {
              setIsPinModalOpen(true);
            }}
          />
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Backup;
