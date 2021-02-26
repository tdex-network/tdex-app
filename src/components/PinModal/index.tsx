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
import PinInput from '../PinInput';

interface PinModalProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: (pin: string) => void;
  onClose?: () => void;
}

const PinModal: React.FC<PinModalProps> = ({
  title,
  description,
  onClose,
  open,
  onConfirm,
}) => {
  const validRegexp = new RegExp('\\d{6}');
  const [pin, setPin] = useState('');

  return (
    <IonModal
      isOpen={open}
      cssClass="modal-big withdrawal"
      keyboardClose={false}
    >
      <div className="gradient-background" />
      <IonHeader>
        <IonToolbar className="with-back-button">
          {onClose && (
            <IonButton style={{ zIndex: 10 }} onClick={() => onClose()}>
              <IconClose />
            </IonButton>
          )}
          <IonTitle>Insert PIN</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <PageDescription title={title}>
          <p>{description}</p>
        </PageDescription>
        <PinInput onPin={(p: string) => setPin(p)} />
        <div className="buttons">
          <IonButton
            onClick={() => {
              if (validRegexp.test(pin)) onConfirm(pin);
            }}
            type="button"
            disabled={!validRegexp.test(pin)}
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
