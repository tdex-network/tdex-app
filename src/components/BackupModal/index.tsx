import {
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonButton,
  IonToolbar,
  IonLoading,
} from '@ionic/react';
import React, { useState } from 'react';
import { getMnemonicFromSecureStorage } from '../../utils/storage-helper';
import { IconClose } from '../icons';
import PageDescription from '../PageDescription';
import PinModal from '../PinModal';
import ShowMnemonic from '../ShowMnemonic';

import './style.scss';

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
  onError: (_: string) => void;
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

  return (
    <div>
      <IonLoading isOpen={isLoading} />
      {!mnemonicToShow ? (
        <PinModal
          open={isOpen}
          onDidDismiss={true}
          onClose={() => {
            if (!isLoading && !mnemonicToShow) onClose('skipped');
          }}
          title="Please enter you secret PIN"
          description="Never share your seed"
          onConfirm={async (pin: string) => {
            try {
              setIsLoading(true);
              const decrypted = await getMnemonicFromSecureStorage(pin);
              setMnemonicToShow(decrypted);
            } catch (e) {
              onError(e);
              console.error(e);
            } finally {
              setIsLoading(false);
            }
          }}
        />
      ) : (
        <IonModal isOpen={isOpen} onDidDismiss={() => onClose('skipped')}>
          <div className="gradient-background" />
          <IonHeader>
            <IonToolbar className="with-back-button">
              <IonTitle>Backup your seed</IonTitle>
              <IonButton
                style={{ zIndex: 10 }}
                onClick={() => onClose('skipped')}
              >
                <IconClose />
              </IonButton>
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
                    className="main-button secondary no-border"
                    onClick={() => onClose('skipped')}
                  >
                    DO IT LATER
                  </IonButton>
                )}
              </div>
            </div>
          </IonContent>
        </IonModal>
      )}
    </div>
  );
};

export default BackupModal;
