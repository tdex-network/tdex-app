import React, { useState } from 'react';

import { BitcoinService } from '../../services/bitcoinService';
import { useBitcoinStore } from '../../store/bitcoinStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useToastStore } from '../../store/toastStore';
import { useWalletStore } from '../../store/walletStore';
import { PIN_TIMEOUT_FAILURE, PIN_TIMEOUT_SUCCESS } from '../../utils/constants';
import { ClaimPeginError, IncorrectPINError, NoClaimFoundError, PinDigitsError } from '../../utils/errors';
import { sleep } from '../../utils/helpers';
import Loader from '../Loader';

import PinModal from './index';

export const PinModalClaimPegin: React.FC = () => {
  const pegins = useBitcoinStore((state) => state.pegins);
  const checkIfClaimablePeginUtxo = useBitcoinStore((state) => state.checkIfClaimablePeginUtxo);
  const modalClaimPegin = useBitcoinStore((state) => state.modalClaimPegin);
  const currentBtcBlockHeight = useBitcoinStore((state) => state.currentBtcBlockHeight);
  const setModalClaimPegin = useBitcoinStore((state) => state.setModalClaimPegin);
  const upsertPegins = useBitcoinStore((state) => state.upsertPegins);
  const explorerBitcoinAPI = useSettingsStore((state) => state.explorerBitcoinAPI);
  const explorerLiquidAPI = useSettingsStore((state) => state.explorerLiquidAPI);
  const network = useSettingsStore((state) => state.network);
  const addErrorToast = useToastStore((state) => state.addErrorToast);
  const addSuccessToast = useToastStore((state) => state.addSuccessToast);
  const removeToastByType = useToastStore((state) => state.removeToastByType);
  const subscribeAllScripts = useWalletStore((state) => state.subscribeAllScripts);
  //
  const [needReset, setNeedReset] = useState<boolean>(false);
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const managePinError = async (closeModal = false) => {
    setIsLoading(false);
    setIsWrongPin(true);
    setTimeout(() => {
      setIsWrongPin(null);
      setNeedReset(true);
    }, PIN_TIMEOUT_FAILURE);
    if (closeModal) {
      await sleep(PIN_TIMEOUT_FAILURE);
      setModalClaimPegin({ isOpen: false });
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
    setModalClaimPegin({ isOpen: false });
  };

  const handleClaimModalConfirm = async (pin: string) => {
    setIsLoading(true);
    const validRegexp = new RegExp('\\d{6}');
    if (!validRegexp.test(pin)) {
      addErrorToast(PinDigitsError);
      await managePinError();
    }
    try {
      // Try to claim a specific pegin or all of them
      const pendingPegins = modalClaimPegin.claimScriptToClaim
        ? {
            [modalClaimPegin.claimScriptToClaim]: pegins[modalClaimPegin.claimScriptToClaim],
          }
        : pegins;
      const bitcoinService = await BitcoinService.fromPin(pin);
      bitcoinService
        .claimPegins(explorerBitcoinAPI, explorerLiquidAPI, pendingPegins, currentBtcBlockHeight, network)
        .then(async (successPegins) => {
          if (Object.keys(successPegins).length) {
            upsertPegins(successPegins);
            addSuccessToast(`Claim transaction successful`);
            await managePinSuccess();
            setModalClaimPegin({ claimScriptToClaim: undefined });
            removeToastByType('claim-pegin');
            subscribeAllScripts();
          } else {
            addErrorToast(NoClaimFoundError);
            managePinError(true).catch(console.log);
          }
        })
        .catch((err: any) => {
          console.error(err);
          addErrorToast(ClaimPeginError);
          managePinError(true);
        });
    } catch (err) {
      console.error(err);
      addErrorToast(IncorrectPINError);
      await managePinError();
    }
  };

  return (
    <>
      <Loader showLoading={isLoading} delay={0} />
      <PinModal
        open={modalClaimPegin.isOpen ?? false}
        title="Enter your secret PIN"
        description={`Enter your secret PIN to claim funds`}
        onConfirm={handleClaimModalConfirm}
        onClose={() => {
          setModalClaimPegin({ isOpen: false });
          // Recreate toast (needs rerender)
          removeToastByType('claim-pegin');
          checkIfClaimablePeginUtxo();
        }}
        isWrongPin={isWrongPin}
        needReset={needReset}
        setNeedReset={setNeedReset}
        setIsWrongPin={setIsWrongPin}
      />
    </>
  );
};
