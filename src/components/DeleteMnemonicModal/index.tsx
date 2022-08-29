import { IonButton, IonContent, IonModal, IonGrid, IonCol, IonRow } from '@ionic/react';
import React, { useState } from 'react';

import { removeMnemonicFromStorage } from '../../utils/storage-helper';
import Header from '../Header';
import PageDescription from '../PageDescription';

interface DeleteMnemonicModalProps {
  closeModal: () => void;
  openModal: boolean;
  onConfirm: () => void;
  pin: string;
}

const DeleteMnemonicModal: React.FC<DeleteMnemonicModalProps> = ({ closeModal, openModal, onConfirm, pin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const deleteMnemonic = async () => {
    setIsLoading(true);
    const success = await removeMnemonicFromStorage(pin);
    if (!success) {
      setErrorMsg('Error: your key has not been deleted. Please contact support.');
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    onConfirm();
  };

  return (
    <IonModal isOpen={openModal} className="modal-big withdrawal" keyboardClose={false}>
      <IonContent>
        <IonGrid>
          <Header title="CLEAR MY KEY" hasBackButton={false} hasCloseButton={true} handleClose={closeModal} />
          <PageDescription
            centerDescription={true}
            description='Clicking on "Delete" will delete your mnemonic on this device. Be sure to back it up!'
            title="Delete your mnemonic"
          />
          <IonRow className="ion-margin-vertical-x2">
            <IonCol size="9" offset="1.5" sizeMd="8" offsetMd="2">
              <IonButton onClick={deleteMnemonic} disabled={isLoading} className="main-button">
                Delete
              </IonButton>
            </IonCol>
          </IonRow>
          {errorMsg !== '' && <p>{errorMsg}</p>}
        </IonGrid>
      </IonContent>
    </IonModal>
  );
};

export default DeleteMnemonicModal;
