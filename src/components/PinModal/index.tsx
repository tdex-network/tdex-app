import React, { useEffect, useRef, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
  useIonViewWillLeave,
  IonBackButton,
  IonIcon,
} from '@ionic/react';
import './style.scss';
import PageDescription from '../PageDescription';
import PinInput from '../PinInput';
import { useDispatch } from 'react-redux';
import { addErrorToast } from '../../redux/actions/toastActions';
import { PinDigitsError } from '../../utils/errors';
import { closeOutline } from 'ionicons/icons';

interface PinModalProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: (pin: string) => void;
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
  const inputRef = useRef<any>(null);

  const handleConfirm = () => {
    if (validRegexp.test(pin)) {
      onConfirm(pin);
      setPin('');
    } else {
      dispatch(addErrorToast(PinDigitsError));
    }
  };

  // Make sure PIN input always has focus when clicking anywhere
  const handleClick = () => {
    if (inputRef && inputRef.current) {
      inputRef.current.setFocus();
    }
  };
  useIonViewWillEnter(() => {
    document.body.addEventListener('click', handleClick);
  });
  useIonViewWillLeave(() => {
    document.body.removeEventListener('click', handleClick);
  });

  useEffect(() => {
    if (pin.trim().length === 6) handleConfirm();
  }, [pin]);

  return (
    <IonModal
      animated={false}
      cssClass="modal-big withdrawal"
      isOpen={open}
      keyboardClose={false}
      onDidDismiss={onDidDismiss ? onClose : undefined}
    >
      <div className="gradient-background" />
      <IonHeader className="ion-no-border">
        <IonToolbar className="with-back-button">
          {onClose && (
            <IonButtons slot="start">
              <IonButton onClick={() => onClose()}>
                <IonIcon slot="icon-only" icon={closeOutline} />
              </IonButton>
            </IonButtons>
          )}
          <IonTitle>Insert PIN</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent scrollY={false}>
        <PageDescription title={title}>
          <p>{description}</p>
        </PageDescription>
        <PinInput
          inputRef={inputRef}
          on6digits={handleConfirm}
          onPin={(p: string) => setPin(p)}
          isWrongPin={isWrongPin}
        />
      </IonContent>
    </IonModal>
  );
};

export default PinModal;
