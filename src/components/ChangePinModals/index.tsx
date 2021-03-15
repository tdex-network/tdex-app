import { IonLoading } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import PinModal from '../../components/PinModal';
import {
  addErrorToast,
  addSuccessToast,
} from '../../redux/actions/toastActions';
import {
  changePin,
  getMnemonicFromSecureStorage,
} from '../../utils/storage/storage-helper';

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
  const dispatch = useDispatch();

  const onError = (e: any) => {
    console.error(e);
    dispatch(addErrorToast(e));
    setPin('');
    onClose();
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
        setModalOpen('second');
      })
      .catch(onError)
      .finally(() => setLoading(false));
  };

  const onSecondPinConfirm = (secondPin: string) => {
    setLoading(true);
    changePin(pin, secondPin)
      .then(() => {
        dispatch(addSuccessToast('PIN has been changed.'));
        onDeleted();
      })
      .catch(onError)
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
      />
      <PinModal
        open={modalOpen === 'second'}
        title="New PIN"
        description="Set up the new PIN."
        onConfirm={onSecondPinConfirm}
        onClose={onClose}
      />
    </div>
  );
};

export default ChangePinModals;
