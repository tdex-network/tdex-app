import { IonContent, IonModal, useIonViewWillEnter, useIonViewWillLeave, IonGrid } from '@ionic/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { addErrorToast } from '../../redux/actions/toastActions';
import { PIN_TIMEOUT_FAILURE } from '../../utils/constants';
import { PinDigitsError } from '../../utils/errors';
import Header from '../Header';
import PageDescription from '../PageDescription';
import PinInput from '../PinInput';

interface PinModalProps {
  open: boolean;
  title: string;
  description: string;
  isDescriptionCentered?: boolean;
  onConfirm: (pin: string) => void;
  onClose?: () => void;
  onDidDismiss?: boolean;
  isWrongPin: boolean | null;
  setIsWrongPin: (b: boolean | null) => void;
  needReset: boolean;
  setNeedReset: (b: boolean) => void;
}

const PinModal: React.FC<PinModalProps> = ({
  title,
  description,
  onClose,
  open,
  onConfirm,
  onDidDismiss,
  isWrongPin,
  setIsWrongPin,
  needReset,
  setNeedReset,
}) => {
  const [pin, setPin] = useState('');
  const [isPinInputLocked, setIsPinInputLocked] = useState<boolean>(false);
  const dispatch = useDispatch();
  const inputRef = useRef<any>(null);

  const handleConfirm = useCallback(() => {
    const validRegexp = new RegExp('\\d{6}');
    if (validRegexp.test(pin)) {
      setIsPinInputLocked(true);
      onConfirm(pin);
    } else {
      dispatch(addErrorToast(PinDigitsError));
      setIsWrongPin(true);
      setTimeout(() => {
        setIsWrongPin(null);
        setNeedReset(true);
      }, PIN_TIMEOUT_FAILURE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  // Make sure PIN input always has focus when clicking anywhere
  const handleClick = () => {
    if (inputRef?.current) {
      inputRef.current.setFocus();
    }
  };
  useIonViewWillEnter(() => {
    document.body.addEventListener('click', handleClick);
  });
  useIonViewWillLeave(() => {
    setIsPinInputLocked(false);
    setPin('');
    document.body.removeEventListener('click', handleClick);
  });

  useEffect(() => {
    if (pin.trim().length === 6) handleConfirm();
  }, [handleConfirm, pin]);

  useEffect(() => {
    if (needReset) {
      setPin('');
      setIsPinInputLocked(false);
      setNeedReset?.(false);
    }
    return () => {
      setPin('');
      setIsPinInputLocked(false);
      setNeedReset?.(false);
    };
  }, [needReset, setNeedReset]);

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
          <Header title="INSERT PIN" hasBackButton={false} hasCloseButton={!!onClose} handleClose={onClose} />
          <PageDescription centerDescription={true} description={description} title={title} />
          <PinInput
            isLocked={isPinInputLocked}
            inputRef={inputRef}
            isWrongPin={isWrongPin}
            on6digits={handleConfirm}
            onPin={setPin}
            pin={pin}
          />
        </IonGrid>
      </IonContent>
    </IonModal>
  );
};

export default PinModal;
