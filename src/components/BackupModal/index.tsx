import {
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonButton,
  IonToolbar,
  IonLoading,
  IonButtons,
  IonIcon,
} from '@ionic/react';
import React, { useState } from 'react';
import { AppError, IncorrectPINError } from '../../utils/errors';
import { getMnemonicFromSecureStorage } from '../../utils/storage-helper';
import PageDescription from '../PageDescription';
import PinModal from '../PinModal';
import ShowMnemonic from '../ShowMnemonic';

import './style.scss';
import {
  PIN_TIMEOUT_FAILURE,
  PIN_TIMEOUT_SUCCESS,
} from '../../utils/constants';
import { closeOutline } from 'ionicons/icons';

interface BackupModalProps {
  isOpen: boolean;
  onClose: (reason: 'skipped' | 'done') => void;
  description: string;
  title: string;
  mnemonic?: string;
  removeSkipBtn?: boolean;
  // below: connected redux props
  backupDone: boolean;
  setDone: () => void;
  onError: (err: AppError) => void;
}

const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  description,
  title,
  onError,
  setDone,
  mnemonic,
  removeSkipBtn,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [mnemonicToShow, setMnemonicToShow] = useState(mnemonic);
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);

  return (
    <div>
      <IonLoading isOpen={isLoading} />
      {mnemonicToShow ? (
        <IonModal isOpen={isOpen} onDidDismiss={() => onClose('skipped')}>
          <div className="gradient-background" />
          <IonHeader className="ion-no-border">
            <IonToolbar className="with-back-button">
              <IonButtons slot="start">
                <IonButton onClick={() => onClose('skipped')}>
                  <IonIcon slot="icon-only" icon={closeOutline} />
                </IonButton>
              </IonButtons>
              <IonTitle>Backup your seed</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="backup-content">
              <PageDescription title={title}>
                <p>{description}</p>
              </PageDescription>
              {<ShowMnemonic mnemonic={mnemonic || mnemonicToShow} />}
              <div className="buttons">
                <IonButton
                  className="main-button"
                  onClick={() => {
                    setDone();
                    onClose('done');
                  }}
                >
                  I CONFIRM
                </IonButton>
                {!removeSkipBtn && (
                  <IonButton
                    className="sub-button"
                    onClick={() => onClose('skipped')}
                  >
                    DO IT LATER
                  </IonButton>
                )}
              </div>
            </div>
          </IonContent>
        </IonModal>
      ) : (
        <PinModal
          open={isOpen}
          onDidDismiss={true}
          title="Please enter you secret PIN"
          description="Never share your seed"
          onConfirm={async (pin: string) => {
            try {
              setIsLoading(true);
              const decrypted = await getMnemonicFromSecureStorage(pin);
              setIsWrongPin(false);
              setTimeout(() => {
                setMnemonicToShow(decrypted);
                setIsWrongPin(null);
              }, PIN_TIMEOUT_SUCCESS);
            } catch (e) {
              setIsWrongPin(true);
              setTimeout(() => {
                setIsWrongPin(null);
              }, PIN_TIMEOUT_FAILURE);
              onError(IncorrectPINError);
              console.error(e);
            } finally {
              setIsLoading(false);
            }
          }}
          isWrongPin={isWrongPin}
        />
      )}
    </div>
  );
};

export default BackupModal;
