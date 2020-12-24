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
import { useDispatch, useSelector } from 'react-redux';
import { decrypt, encrypt } from '../../utils/crypto';
import PinModalInput from '../PinModalInput';
import { Storage } from '@capacitor/core';
import { setMnemonic } from '../../redux/actions/walletActions';

interface NewPinModalInterface {
  openModal: boolean;
  setOpenModal: any;
}

const NewPinModal: React.FC<NewPinModalInterface> = ({
  openModal,
  setOpenModal,
}) => {
  const mnemonic = useSelector((state: any) => state.wallet.mnemonic);
  const [title, setTitle] = useState('ENTER OLD PIN');
  const [pin, setPin] = useState('');
  const [mnemonicPhrase, setMnemonicPhrase] = useState('');
  const [oldPinChecked, setOldPinChecked] = useState(false);
  const [validPin, setValidPin] = useState(false);
  const [firstPin, setFirstPin] = useState('');
  const inputRef: any = useRef(null);
  const dispatch = useDispatch();

  useIonViewDidEnter(() => {
    inputRef?.current?.getInputElement().then((el: any) => {
      el.focus();
    });
  });

  const onPinChange = (e: any) => {
    const { value } = e.detail;
    if (!oldPinChecked) {
      onOldPinChange(value);
    } else {
      onNewPinChange(value);
    }
  };

  const onOldPinChange = (value: string) => {
    if (value && value.length === 6) {
      try {
        const decrypted = decrypt(mnemonic, value);
        const encrypted = encrypt(decrypted, value);
        setValidPin(encrypted === mnemonic);
      } catch (err) {
        setValidPin(false);
        console.log(err);
      }
    }
    if (value.length < 7 && (value.match(/^\d+$/g) || value === '')) {
      setPin(value);
    }
  };

  const onNewPinChange = (value: string) => {
    if (value.length < 7 && (value.match(/^\d+$/g) || value === '')) {
      if (value && value.length === 6) {
        if (firstPin) {
          setValidPin(value === firstPin);
        } else {
          setValidPin(true);
        }
      }
      setPin(value);
    }
  };

  const onConfirm = () => {
    if (!oldPinChecked) {
      setMnemonicPhrase(decrypt(mnemonic, pin));
      setOldPinChecked(true);
      setValidPin(false);
      setPin('');
      setTitle('ENTER NEW PIN');
      inputRef?.current?.getInputElement().then((el: any) => {
        el.focus();
      });
    } else if (oldPinChecked && !firstPin) {
      setFirstPin(pin);
      setValidPin(false);
      setPin('');
      setTitle('REPEAT NEW PIN');
      inputRef?.current?.getInputElement().then((el: any) => {
        el.focus();
      });
    } else if (oldPinChecked && firstPin) {
      const newMnemonic = encrypt(mnemonicPhrase, pin);
      const walletObj = { mnemonic: newMnemonic };
      Storage.set({
        key: 'wallet',
        value: JSON.stringify(walletObj),
      });
      dispatch(setMnemonic(newMnemonic));
      setOpenModal(false);
      setPin('');
      setValidPin(false);
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
          <IonButton
            style={{ zIndex: 10 }}
            onClick={() => {
              setOpenModal(false);
            }}
          >
            <IconClose />
          </IonButton>
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
            onClick={() => onConfirm()}
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

export default NewPinModal;
