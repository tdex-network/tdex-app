import { IonLoading } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import PinModal from '../../components/PinModal';
import {
  addErrorToast,
  addSuccessToast,
} from '../../redux/actions/toastActions';
import { AppError, IncorrectPINError } from '../../utils/errors';
import {
  changePin,
  getMnemonicFromSecureStorage,
} from '../../utils/storage-helper';

interface ChangePinModalsProps {
  open: boolean;
  onDeleted: () => void;
  onClose: () => void;
}

const ChangePinModals: React.FC<ChangePinModalsProps> = ({
  open,
  onDeleted,
  onClose,
}) => {
  const [modalOpen, setModalOpen] = useState<'first' | 'second'>();
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState('');
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);
  const dispatch = useDispatch();

  const onError = (e: AppError) => {
    console.error(e);
    dispatch(addErrorToast(e));
    setIsWrongPin(true);
    setTimeout(() => {
      setIsWrongPin(null);
      setPin('');
      onClose();
    }, 2000);
  };

  useEffect(() => {
    if (!modalOpen && open) {
      setModalOpen('first');
    }

    if (!open) {
      setModalOpen(undefined);
      setPin('');
    }
  }, [open]);

  const onFirstPinConfirm = (firstPin: string) => {
    setLoading(true);
    getMnemonicFromSecureStorage(firstPin)
      .then(() => {
        setPin(firstPin);
        setIsWrongPin(false);
        setTimeout(() => {
          setModalOpen('second');
          setIsWrongPin(null);
        }, 500);
      })
      .catch(() => {
        onError(IncorrectPINError);
      })
      .finally(() => setLoading(false));
  };

  const onSecondPinConfirm = (secondPin: string) => {
    setLoading(true);
    changePin(pin, secondPin)
      .then(() => {
        dispatch(addSuccessToast('PIN has been changed.'));
        onDeleted();
      })
      .catch(() => {
        onError(IncorrectPINError);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <IonLoading isOpen={loading} />
      <PinModal
        open={modalOpen === 'first'}
        title="Unlock wallet"
        description="Enter your current PIN."
        onConfirm={onFirstPinConfirm}
        onClose={onClose}
        isWrongPin={isWrongPin}
      />
      <PinModal
        open={modalOpen === 'second'}
        title="New PIN"
        description="Set up the new PIN."
        onConfirm={onSecondPinConfirm}
        onClose={onClose}
        isWrongPin={isWrongPin}
      />
    </div>
  );
};

export default ChangePinModals;
