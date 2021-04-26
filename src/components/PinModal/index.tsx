import React, { useEffect, useState } from 'react';
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
import { useDispatch } from 'react-redux';
import { addErrorToast } from '../../redux/actions/toastActions';

interface PinModalProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: (pin: string) => any;
  onClose?: () => void;
  onDidDismiss?: boolean;
  isWrongPin: boolean | null;
}

const PinModal: React.FC<PinModalProps> = ({
  title,
  description,
  onClose,
  open,
  onConfirm,
  onDidDismiss,
  isWrongPin,
}) => {
  const validRegexp = new RegExp('\\d{6}');
  const [pin, setPin] = useState('');
  const dispatch = useDispatch();
  const handleConfirm = () => {
    if (validRegexp.test(pin)) {
      onConfirm(pin);
      setPin('');
    } else {
      dispatch(addErrorToast('PIN must contain 6 digits.'));
    }
  };

  useEffect(() => {
    if (pin.trim().length === 6) {
      console.log('handleConfirm');
      handleConfirm();
    }
  }, [pin]);

  return (
    <IonModal
      isOpen={open}
      onDidDismiss={onDidDismiss ? onClose : undefined}
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
        <PinInput
          on6digits={handleConfirm}
          onPin={(p: string) => setPin(p)}
          isWrongPin={isWrongPin}
        />
      </IonContent>
    </IonModal>
  );
};

export default PinModal;
