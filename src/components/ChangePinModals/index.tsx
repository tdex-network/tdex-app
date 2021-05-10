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
import {
  PIN_TIMEOUT_FAILURE,
  PIN_TIMEOUT_SUCCESS,
} from '../../utils/constants';

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
  const [currentPin, setCurrentPin] = useState('');
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);
  const [needReset, setNeedReset] = useState<boolean>(false);
  const dispatch = useDispatch();

  const onError = (e: AppError) => {
    console.error(e);
    dispatch(addErrorToast(e));
    setIsWrongPin(true);
    setTimeout(() => {
      setIsWrongPin(null);
      setCurrentPin('');
      setNeedReset(true);
    }, PIN_TIMEOUT_FAILURE);
  };

  useEffect(() => {
    if (!modalOpen && open) {
      setModalOpen('first');
    }
    if (!open) {
      setModalOpen(undefined);
      setCurrentPin('');
    }
  }, [open]);

  const onFirstPinConfirm = (firstPin: string) => {
    setLoading(true);
    getMnemonicFromSecureStorage(firstPin)
      .then(() => {
        setCurrentPin(firstPin);
        setIsWrongPin(false);
        setTimeout(() => {
          setModalOpen('second');
          setIsWrongPin(null);
        }, PIN_TIMEOUT_SUCCESS);
      })
      .catch(() => {
        onError(IncorrectPINError);
      })
      .finally(() => setLoading(false));
  };

  const onSecondPinConfirm = (secondPin: string) => {
    setLoading(true);
    changePin(currentPin, secondPin)
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
        needReset={needReset}
        setNeedReset={setNeedReset}
        open={modalOpen === 'first'}
        title="Unlock wallet"
        description="Enter your current PIN."
        onConfirm={onFirstPinConfirm}
        onClose={onClose}
        isWrongPin={isWrongPin}
      />
      <PinModal
        needReset={needReset}
        setNeedReset={setNeedReset}
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
