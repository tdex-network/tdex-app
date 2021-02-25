import React, { useEffect, useState } from 'react';
import PinModal from '../../components/PinModal';
import { changePin } from '../../utils/storage-helper';

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
  const [pin, setPin] = useState('');

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
    setPin(firstPin);
    setModalOpen('second');
  };

  const onSecondPinConfirm = (secondPin: string) => {
    changePin(pin, secondPin).then(onDeleted).catch(console.error);
  };

  return (
    <div>
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
