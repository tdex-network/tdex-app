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
import PageDescription from '../PageDescription';
import PinModal from '../PinModal';

import ShowMnemonic from '../ShowMnemonic';

interface BackupModalProps {
  isOpen: boolean;
  onClose: (reason: 'skipped' | 'done') => void;
  mnemonic?: string;
  // below: connected redux props
  backupDone: boolean;
  setDone: () => void;
  onError: (_: string) => void;
}

const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onError,
  setDone,
  backupDone,
  mnemonic,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [mnemonicToShow, setMnemonicToShow] = useState(mnemonic);

  return (
    <div>
      <IonLoading isOpen={isLoading} />
      {!mnemonicToShow ? (
        <PinModal
          open={isOpen}
          title="Please unlock and backup your seed"
          description="Never share your secret words"
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
        <IonModal isOpen={isOpen}>
          <div className="gradient-background" />
          <IonHeader>
            <IonToolbar className="with-back-button">
              <IonTitle>Backup your seed</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="backup-content">
              <PageDescription title="Seed generated !">
                <p>
                  Take time to write down your secret words (or skip and do it
                  later).
                </p>
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
                  DONE
                </IonButton>
                <IonButton
                  className="main-button secondary no-border"
                  onClick={() => onClose('skipped')}
                >
                  SKIP
                </IonButton>
              </div>
            </div>
          </IonContent>
        </IonModal>
      )}
    </div>
  );
};

export default BackupModal;
