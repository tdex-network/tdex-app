import './style.scss';
import { IonContent, IonPage, IonGrid, IonRow, IonCol, IonButton, IonInput, IonItem } from '@ionic/react';
import * as bitcoinJS from 'bitcoinjs-lib';
import React, { useEffect, useState } from 'react';

import Header from '../../components/Header';
import Loader from '../../components/Loader';
import PageDescription from '../../components/PageDescription';
import PinModal from '../../components/PinModal';
import { BitcoinService } from '../../services/bitcoinService';
import type { Pegins } from '../../store/bitcoinStore';
import { useBitcoinStore } from '../../store/bitcoinStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useToastStore } from '../../store/toastStore';
import { useWalletStore } from '../../store/walletStore';
import { getBitcoinJSNetwork, PIN_TIMEOUT_FAILURE, PIN_TIMEOUT_SUCCESS } from '../../utils/constants';
import {
  ClaimPeginError,
  IncorrectPINError,
  InvalidBitcoinAddress,
  NoClaimFoundError,
  PinDigitsError,
} from '../../utils/errors';
import { sleep } from '../../utils/helpers';

// Claim Pegin Settings Page
export const ClaimPegin: React.FC = () => {
  const currentBtcBlockHeight = useBitcoinStore.getState().currentBtcBlockHeight;
  const checkIfClaimablePeginUtxo = useBitcoinStore.getState().checkIfClaimablePeginUtxo;
  const restorePeginsFromDepositAddress = useBitcoinStore.getState().restorePeginsFromDepositAddress;
  const pegins = useBitcoinStore((state) => state.pegins);
  const upsertPegins = useBitcoinStore((state) => state.upsertPegins);
  const explorerLiquidAPI = useSettingsStore((state) => state.explorerLiquidAPI);
  const explorerBitcoinAPI = useSettingsStore((state) => state.explorerBitcoinAPI);
  const explorerLiquidUI = useSettingsStore((state) => state.explorerLiquidUI);
  const network = useSettingsStore((state) => state.network);
  const toasts = useToastStore((state) => state.toasts);
  const addErrorToast = useToastStore((state) => state.addErrorToast);
  const addSuccessToast = useToastStore((state) => state.addSuccessToast);
  const decryptMnemonic = useWalletStore((state) => state.decryptMnemonic);
  // Pin Modal
  const [pin, setPin] = useState<string>('');
  const [needReset, setNeedReset] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);
  //
  const [isLoading, setIsLoading] = useState(false);
  const [claimedPegins, setClaimedPegins] = useState<Pegins>({});
  const [inputBtcPeginAddress, setInputBtcPeginAddress] = useState<string>();
  const [mnemonic, setMnemonic] = useState<string>();

  useEffect(() => {
    toasts.forEach((t) => {
      if (t.type === 'error' && t.errorCode === 18) {
        managePinError(true).catch(console.error);
      }
    });
  }, [toasts]);

  // claimPegins effect with pegins in sync with store when claiming
  useEffect(() => {
    (async () => {
      if (inputBtcPeginAddress) {
        if (mnemonic) {
          const bitcoinService = await BitcoinService.fromPin(pin);
          bitcoinService
            .claimPegins(explorerBitcoinAPI, explorerLiquidAPI, pegins, currentBtcBlockHeight, network)
            .then((successPegins) => {
              if (Object.keys(successPegins).length) {
                setClaimedPegins(successPegins);
                upsertPegins(successPegins);
                addSuccessToast(`Claim transaction successful`);
                managePinSuccess().catch(console.error);
                setInputBtcPeginAddress(undefined);
                checkIfClaimablePeginUtxo();
              } else {
                addErrorToast(NoClaimFoundError);
                managePinError(true).catch(console.error);
              }
            })
            .catch((err) => {
              console.error(err);
              addErrorToast(ClaimPeginError);
              managePinError(true).catch(console.error);
            });
        } else {
          setIsLoading(false);
          addErrorToast(NoClaimFoundError);
          managePinError(true).catch(console.error);
        }
      }
      return () => {
        setInputBtcPeginAddress(undefined);
      };
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBtcBlockHeight, explorerBitcoinAPI, explorerLiquidAPI, mnemonic, network, pegins]);

  const managePinError = async (closeModal = false) => {
    setIsLoading(false);
    setIsWrongPin(true);
    setTimeout(() => {
      setIsWrongPin(null);
      setNeedReset(true);
    }, PIN_TIMEOUT_FAILURE);
    if (closeModal) {
      await sleep(PIN_TIMEOUT_FAILURE);
      setModalOpen(false);
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
    setModalOpen(false);
  };

  const handleClaimModalConfirm = async (pin: string) => {
    const validRegexp = new RegExp('\\d{6}');
    if (!validRegexp.test(pin)) {
      addErrorToast(PinDigitsError);
      await managePinError();
    }
    let decryptedMnemonic;
    try {
      decryptedMnemonic = await decryptMnemonic(pin);
      setPin(pin);
    } catch (err) {
      console.error(err);
      addErrorToast(IncorrectPINError);
      managePinError();
    }
    try {
      const addrTrimmed = inputBtcPeginAddress?.trim();
      if (addrTrimmed && bitcoinJS.address.toOutputScript(addrTrimmed, getBitcoinJSNetwork(network))) {
        setIsLoading(true);
        setMnemonic(decryptedMnemonic);
        restorePeginsFromDepositAddress(addrTrimmed);
      }
    } catch (err) {
      console.error(err);
      addErrorToast(InvalidBitcoinAddress);
      managePinError(true).catch(console.error);
    }
  };

  return (
    <IonPage>
      <Loader showLoading={isLoading} delay={0} />
      <PinModal
        open={modalOpen}
        title="Enter your secret PIN"
        description={`Enter your secret PIN to claim funds`}
        onConfirm={handleClaimModalConfirm}
        onClose={() => {
          setModalOpen(false);
        }}
        isWrongPin={isWrongPin}
        needReset={needReset}
        setNeedReset={setNeedReset}
        setIsWrongPin={setIsWrongPin}
      />
      <IonContent id="claim-pegin">
        <IonGrid className="ion-text-center ion-justify-content-center">
          <Header hasBackButton={true} title="CLAIM LIQUID BITCOIN" />
          <PageDescription
            description="Here you can manually claim your deposit in case the process was interrupted abruptly. Please only use this section if your deposit has 102 confirmations or more. You can only claim a deposit made from this application and this set of keys. To claim, please insert the BTC address below."
            title="Claim your Liquid Bitcoin"
          />
          {/**/}
          <IonRow className="ion-margin-vertical-x2">
            <IonCol size="10" offset="1">
              <IonItem className="input">
                <IonInput
                  className="ion-text-left"
                  inputmode="text"
                  onIonChange={(e) => setInputBtcPeginAddress(e.detail.value || '')}
                  placeholder="BTC deposit address"
                  value={inputBtcPeginAddress}
                />
              </IonItem>
            </IonCol>
          </IonRow>
          {/**/}
          <IonRow className="ion-margin-vertical-x2">
            <IonCol size="9" offset="1.5" sizeMd="6" offsetMd="3">
              <IonRow className="ion-justify-content-center">
                <IonButton
                  className="main-button"
                  disabled={!inputBtcPeginAddress}
                  onClick={() => {
                    setModalOpen(true);
                  }}
                >
                  CLAIM
                </IonButton>
              </IonRow>
            </IonCol>
          </IonRow>
          {Object.keys(claimedPegins).length > 0 && (
            <IonRow className="ion-text-left">
              <IonCol size="10" offset="1">
                <ul className="ion-no-padding">
                  <h6>{`Liquid Bitcoin pegin transaction${Object.keys(claimedPegins).length > 1 ? 's' : ''}:`}</h6>
                  {Object.values(claimedPegins)
                    .map((pegin) => pegin.depositUtxos)
                    .flatMap((depositUtxos) => Object.values(depositUtxos ?? []))
                    .filter((utxo) => utxo.claimTxId !== undefined)
                    .map(({ claimTxId }, i) => (
                      <li key={i}>
                        <a
                          href={`${explorerLiquidUI}/tx/${claimTxId}`}
                          target="_blank"
                          rel="noreferrer"
                        >{`${explorerLiquidUI}/tx/${claimTxId}`}</a>
                      </li>
                    ))}
                </ul>
              </IonCol>
            </IonRow>
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};
