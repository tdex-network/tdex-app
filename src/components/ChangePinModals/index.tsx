import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import PinModal from '../../components/PinModal';
import { addErrorToast, addSuccessToast } from '../../redux/actions/toastActions';
import { PIN_TIMEOUT_FAILURE, PIN_TIMEOUT_SUCCESS } from '../../utils/constants';
import type { AppError } from '../../utils/errors';
import { IncorrectPINError } from '../../utils/errors';
import { changePin, getMnemonicFromStorage } from '../../utils/storage-helper';
import Loader from '../Loader';

interface ChangePinModalsProps {
  open: boolean;
  onDeleted: () => void;
  onClose: () => void;
}

const ChangePinModals: React.FC<ChangePinModalsProps> = ({ open, onDeleted, onClose }) => {
  const [modalOpen, setModalOpen] = useState<'first' | 'second'>();
  const [loading, setLoading] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);
  const [needReset, setNeedReset] = useState<boolean>(false);
  const dispatch = useDispatch();
  const { t } = useTranslation();

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
  }, [modalOpen, open]);

  const onFirstPinConfirm = (firstPin: string) => {
    setLoading(true);
    getMnemonicFromStorage(firstPin)
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
      .finally(() => {
        setLoading(false);
        setNeedReset(true);
      });
  };

  const onSecondPinConfirm = (secondPin: string) => {
    setLoading(true);
    changePin(currentPin, secondPin)
      .then(() => {
        dispatch(addSuccessToast(t('changePinModals.toastSuccess')));
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
        title={t('changePinModals.firstModal.title')}
        description={t('changePinModals.firstModal.desc')}
        onConfirm={onFirstPinConfirm}
        onClose={onClose}
        isWrongPin={isWrongPin}
        setIsWrongPin={setIsWrongPin}
      />
      <PinModal
        needReset={needReset}
        setNeedReset={setNeedReset}
        open={open && modalOpen === 'second'}
        title={t('changePinModals.secondModal.title')}
        description={t('changePinModals.secondModal.desc')}
        onConfirm={onSecondPinConfirm}
        onClose={onClose}
        isWrongPin={isWrongPin}
        setIsWrongPin={setIsWrongPin}
      />
    </div>
  );
};

export default ChangePinModals;
