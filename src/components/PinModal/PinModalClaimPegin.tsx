import type { Mnemonic } from 'ldk';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { updateState } from '../../redux/actions/appActions';
import { checkIfClaimablePeginUtxo, setModalClaimPegin, upsertPegins } from '../../redux/actions/btcActions';
import { addErrorToast, addSuccessToast, removeToastByType } from '../../redux/actions/toastActions';
import { watchTransaction } from '../../redux/actions/transactionsActions';
import type { BtcState, Pegin, Pegins } from '../../redux/reducers/btcReducer';
import { claimPegins } from '../../redux/services/btcService';
import { PIN_TIMEOUT_FAILURE, PIN_TIMEOUT_SUCCESS } from '../../utils/constants';
import { ClaimPeginError, IncorrectPINError, NoClaimFoundError, PinDigitsError } from '../../utils/errors';
import { sleep } from '../../utils/helpers';
import { getIdentity } from '../../utils/storage-helper';
import Loader from '../Loader';

import PinModal from './index';

interface PinModalClaimPeginProps {
  currentBtcBlockHeight: number;
  explorerLiquidAPI: string;
  explorerBitcoinAPI: string;
  pegins: Pegins;
  modalClaimPegins: BtcState['modalClaimPegins'];
}

const PinModalClaimPegin: React.FC<PinModalClaimPeginProps> = ({
  currentBtcBlockHeight,
  explorerLiquidAPI,
  explorerBitcoinAPI,
  pegins,
  modalClaimPegins,
}) => {
  const [needReset, setNeedReset] = useState<boolean>(false);
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const managePinError = async (closeModal = false) => {
    setIsLoading(false);
    setIsWrongPin(true);
    setTimeout(() => {
      setIsWrongPin(null);
      setNeedReset(true);
    }, PIN_TIMEOUT_FAILURE);
    if (closeModal) {
      await sleep(PIN_TIMEOUT_FAILURE);
      dispatch(setModalClaimPegin({ isOpen: false }));
    }
  };

  const managePinSuccess = async () => {
    setIsLoading(false);
    setIsWrongPin(false);
    setTimeout(() => {
      setIsWrongPin(null);
      setNeedReset(true);
    }, PIN_TIMEOUT_SUCCESS);
    await sleep(PIN_TIMEOUT_SUCCESS);
    dispatch(setModalClaimPegin({ isOpen: false }));
  };

  const handleClaimModalConfirm = async (pin: string) => {
    setIsLoading(true);
    const validRegexp = new RegExp('\\d{6}');
    if (!validRegexp.test(pin)) {
      dispatch(addErrorToast(PinDigitsError));
      await managePinError();
    }
    getIdentity(pin)
      .then(async (mnemonic: Mnemonic) => {
        // Try to claim a specific pegin or all of them
        const pendingPegins = modalClaimPegins.claimScriptToClaim
          ? {
              [modalClaimPegins.claimScriptToClaim]: pegins[modalClaimPegins.claimScriptToClaim],
            }
          : pegins;
        claimPegins(explorerBitcoinAPI, explorerLiquidAPI, pendingPegins, mnemonic, currentBtcBlockHeight)
          .then(async (successPegins) => {
            if (Object.keys(successPegins).length) {
              Object.values(successPegins).forEach((p: Pegin) => {
                const utxos = Object.values(p.depositUtxos ?? []);
                utxos.forEach((utxo) => {
                  if (utxo.claimTxId) {
                    dispatch(watchTransaction(utxo.claimTxId));
                  }
                });
              });
              dispatch(upsertPegins(successPegins));
              dispatch(addSuccessToast(`Claim transaction successful`));
              await managePinSuccess();
              dispatch(setModalClaimPegin({ claimScriptToClaim: undefined }));
              dispatch(removeToastByType('claim-pegin'));
              dispatch(updateState());
            } else {
              dispatch(addErrorToast(NoClaimFoundError));
              managePinError(true).catch(console.log);
            }
          })
          .catch((err) => {
            console.error(err);
            dispatch(addErrorToast(ClaimPeginError));
            managePinError(true);
          });
      })
      .catch((e) => {
        console.error(e);
        dispatch(addErrorToast(IncorrectPINError));
        managePinError();
      });
  };

  return (
    <>
      <Loader showLoading={isLoading} delay={0} />
      <PinModal
        open={modalClaimPegins.isOpen}
        title="Enter your secret PIN"
        description={`Enter your secret PIN to claim funds`}
        onConfirm={handleClaimModalConfirm}
        onClose={() => {
          dispatch(setModalClaimPegin({ isOpen: false }));
          // Recreate toast (needs rerender)
          dispatch(removeToastByType('claim-pegin'));
          dispatch(checkIfClaimablePeginUtxo());
        }}
        isWrongPin={isWrongPin}
        needReset={needReset}
        setNeedReset={setNeedReset}
        setIsWrongPin={setIsWrongPin}
      />
    </>
  );
};

export default PinModalClaimPegin;
