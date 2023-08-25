import React, { useEffect, useState } from 'react';

import PinModal from '../../components/PinModal';
import { useToastStore } from '../../store/toastStore';
import { useWalletStore } from '../../store/walletStore';
import { PIN_TIMEOUT_FAILURE, PIN_TIMEOUT_SUCCESS } from '../../utils/constants';
import { decrypt } from '../../utils/crypto';
import type { AppError } from '../../utils/errors';
import { IncorrectPINError } from '../../utils/errors';
import Loader from '../Loader';

interface ChangePinModalsProps {
  open: boolean;
  onDeleted: () => void;
  onClose: () => void;
}

const ChangePinModals: React.FC<ChangePinModalsProps> = ({ open, onDeleted, onClose }) => {
  const addErrorToast = useToastStore((state) => state.addErrorToast);
  const addSuccessToast = useToastStore((state) => state.addSuccessToast);
  const changePin = useWalletStore((state) => state.changePin);
  const encryptedMnemonic = useWalletStore((state) => state.encryptedMnemonic);
  //
  const [modalOpen, setModalOpen] = useState<'first' | 'second'>();
  const [loading, setLoading] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);
  const [needReset, setNeedReset] = useState<boolean>(false);

  const onError = (e: AppError) => {
    console.error(e);
    addErrorToast(e);
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
  }, [modalOpen, open]);

  const onFirstPinConfirm = async (firstPin: string) => {
    setLoading(true);
    if (!encryptedMnemonic) throw new Error('No mnemonic found in wallet');
    try {
      await decrypt(encryptedMnemonic, firstPin);
      setCurrentPin(firstPin);
      setIsWrongPin(false);
      setTimeout(() => {
        setModalOpen('second');
        setIsWrongPin(null);
      }, PIN_TIMEOUT_SUCCESS);
    } catch (_) {
      onError(IncorrectPINError);
    } finally {
      setLoading(false);
      setNeedReset(true);
    }
  };

  const onSecondPinConfirm = (secondPin: string) => {
    setLoading(true);
    changePin(currentPin, secondPin)
      .then(() => {
        addSuccessToast('PIN has been changed.');
        onDeleted();
      })
      .catch(() => {
        onError(IncorrectPINError);
      })
      .finally(() => {
        setLoading(false);
        setNeedReset(true);
      });
  };

  return (
    <div>
      <Loader showLoading={loading} />
      <PinModal
        needReset={needReset}
        setNeedReset={setNeedReset}
        open={open && modalOpen === 'first'}
        title="Unlock wallet"
        description="Enter your current PIN."
        onConfirm={onFirstPinConfirm}
        onClose={onClose}
        isWrongPin={isWrongPin}
        setIsWrongPin={setIsWrongPin}
      />
      <PinModal
        needReset={needReset}
        setNeedReset={setNeedReset}
        open={open && modalOpen === 'second'}
        title="New PIN"
        description="Set up the new PIN."
        onConfirm={onSecondPinConfirm}
        onClose={onClose}
        isWrongPin={isWrongPin}
        setIsWrongPin={setIsWrongPin}
      />
    </div>
  );
};

export default ChangePinModals;
