import React, { useEffect, useRef, useState } from 'react';
import {
  IonContent,
  IonModal,
  useIonViewWillEnter,
  useIonViewWillLeave,
  IonGrid,
} from '@ionic/react';
import PageDescription from '../PageDescription';
import PinInput from '../PinInput';
import { useDispatch } from 'react-redux';
import { addErrorToast } from '../../redux/actions/toastActions';
import { PinDigitsError } from '../../utils/errors';
import Header from '../Header';

interface PinModalProps {
  open: boolean;
  title: string;
  description: string;
  isDescriptionCentered?: boolean;
  onConfirm: (pin: string) => void;
  onClose?: () => void;
  onDidDismiss?: boolean;
  isWrongPin: boolean | null;
  needReset?: boolean;
  setNeedReset?: (b: boolean) => void;
}

const PinModal: React.FC<PinModalProps> = ({
  title,
  description,
  onClose,
  open,
  onConfirm,
  onDidDismiss,
  isWrongPin,
  needReset,
  setNeedReset,
}) => {
  const validRegexp = new RegExp('\\d{6}');
  const [pin, setPin] = useState('');
  const dispatch = useDispatch();
  const inputRef = useRef<any>(null);

  useEffect(() => {
    if (needReset) {
      setPin('');
      setNeedReset?.(false);
    }
  }, [needReset]);

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
      id="pin-modal"
      animated={false}
      cssClass="modal-big"
      isOpen={open}
      keyboardClose={false}
      onDidDismiss={onDidDismiss ? onClose : undefined}
    >
      <IonContent scrollY={false}>
        <IonGrid className="ion-text-center ion-justify-content-center">
          <Header
            title="INSERT PIN"
            hasBackButton={false}
            hasCloseButton={!!onClose}
            handleClose={onClose}
          />
          <PageDescription description={description} title={title} />
          <PinInput
            inputRef={inputRef}
            on6digits={handleConfirm}
            onPin={setPin}
            isWrongPin={isWrongPin}
            pin={pin}
          />
        </IonGrid>
      </IonContent>
    </IonModal>
  );
};

export default PinModal;
