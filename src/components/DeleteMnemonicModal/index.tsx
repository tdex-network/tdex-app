import React, { useState } from 'react';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import './style.scss';
import { IconClose } from '../icons';
import PageDescription from '../PageDescription';
import { removeMnemonicFromSecureStorage } from '../../utils/storage-helper';

interface NewPinModalInterface {
  openModal: boolean;
  setOpenModal: any;
}

const DeleteMnemonicModal: React.FC<NewPinModalInterface> = ({
  openModal,
  setOpenModal,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const deleteMnemonic = async () => {
    setIsLoading(true);
    const success = await removeMnemonicFromSecureStorage();
    if (!success) {
      setErrorMsg(
        'Error: your key has not been deleted. Please contact support.'
      );
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    setOpenModal(false);
  };

  return (
    <IonModal
      isOpen={openModal}
      cssClass="modal-big withdrawal"
      keyboardClose={false}
    >
      <div className="gradient-background" />
      <IonHeader>
        <IonToolbar className="with-back-button">
          <IonButton
            style={{ zIndex: 10 }}
            onClick={() => {
              setOpenModal(false);
            }}
          >
            <IconClose />
          </IonButton>
          <IonTitle>CLEAR MY KEY</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <PageDescription title="Delete your secret mnemonic">
          <p>
            Clicking on "Delete" will delete your key on this device. Be sure to
            backup your mnemonic!
          </p>
        </PageDescription>
        <div className="buttons">
          <IonButton
            onClick={() => deleteMnemonic()}
            disabled={isLoading}
            type="button"
            className="main-button"
          >
            Delete
          </IonButton>
        </div>
        {errorMsg !== '' && <p>{errorMsg}</p>}
      </IonContent>
    </IonModal>
  );
};

export default DeleteMnemonicModal;
