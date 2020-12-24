import React, { useRef, useState } from 'react';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
  useIonViewDidEnter,
} from '@ionic/react';
import './style.scss';
import { IconClose } from '../icons';
import PageDescription from '../PageDescription';
import { useSelector } from 'react-redux';
import { decrypt, encrypt } from '../../utils/crypto';
import PinModalInput from '../PinModalInput';

interface PinModalInterface {
  setOpenModal?: any;
  withClose?: boolean;
  openModal: boolean;
  title: string;
  onConfirm: any;
}

const PinModal: React.FC<PinModalInterface> = ({
  openModal,
  title,
  withClose,
  onConfirm,
  setOpenModal,
}) => {
  const mnemonic = useSelector((state: any) => state.wallet.mnemonic);
  const [pin, setPin] = useState('');
  const [validPin, setValidPin] = useState(false);
  const inputRef: any = useRef(null);

  useIonViewDidEnter(() => {
    inputRef?.current?.getInputElement().then((el: any) => {
      el.focus();
    });
  });

  const onPinChange = (e: any) => {
    const { value } = e.target;

    if (value && value.length === 6) {
      let decrypted;
      try {
        decrypted = decrypt(mnemonic, value);
        let encrypted;
        try {
          encrypted = encrypt(decrypted, value);
          setValidPin(encrypted === mnemonic);
        } catch (err) {
          setValidPin(false);
          console.log(err);
        }
      } catch (err) {
        setValidPin(false);
        console.log(err);
      }
    }
    if (value.length < 7 && (value.match(/^\d+$/g) || value === '')) {
      setPin(value);
    }
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
          {withClose && (
            <IonButton
              style={{ zIndex: 10 }}
              onClick={() => {
                setOpenModal(false);
              }}
            >
              <IconClose />
            </IonButton>
          )}
          <IonTitle>{title}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <PageDescription title="Insert PIN">
          <p>Insert the numeric password you’ve set at sign in</p>
        </PageDescription>
        <PinModalInput
          inputRef={openModal ? inputRef : null}
          inputValue={pin}
          onChange={onPinChange}
        />
        <div className="buttons">
          <IonButton
            onClick={() => onConfirm(pin)}
            type="button"
            disabled={!validPin}
            className="main-button"
          >
            Confirm
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default PinModal;
