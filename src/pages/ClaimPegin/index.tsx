import { IonContent, IonPage, IonGrid, IonRow, IonCol, IonButton, IonInput, IonItem } from '@ionic/react';
import * as bitcoinJS from 'bitcoinjs-lib';
import type { Mnemonic } from 'ldk';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { RouteComponentProps } from 'react-router';

import Header from '../../components/Header';
import Loader from '../../components/Loader';
import PageDescription from '../../components/PageDescription';
import PinModal from '../../components/PinModal';
import { updateState } from '../../redux/actions/appActions';
import {
  checkIfClaimablePeginUtxo,
  restorePeginFromDepositAddress,
  upsertPegins,
} from '../../redux/actions/btcActions';
import { addErrorToast, addSuccessToast } from '../../redux/actions/toastActions';
import { watchTransaction } from '../../redux/actions/transactionsActions';
import { network } from '../../redux/config';
import type { DepositPeginUtxo, Pegin, Pegins } from '../../redux/reducers/btcReducer';
import type { ToastOpts } from '../../redux/reducers/toastReducer';
import { claimPegins } from '../../redux/services/btcService';
import { getBitcoinJSNetwork, PIN_TIMEOUT_FAILURE, PIN_TIMEOUT_SUCCESS } from '../../utils/constants';
import {
  ClaimPeginError,
  IncorrectPINError,
  InvalidBitcoinAddress,
  NoClaimFoundError,
  PinDigitsError,
} from '../../utils/errors';
import { sleep } from '../../utils/helpers';
import { getIdentity } from '../../utils/storage-helper';

import './style.scss';

interface ClaimPeginProps extends RouteComponentProps {
  pegins: Pegins;
  explorerLiquidUI: string;
  explorerBitcoinAPI: string;
  explorerLiquidAPI: string;
  toasts: ToastOpts[];
  currentBtcBlockHeight: number;
}

// Claim Pegin Settings Page
const ClaimPegin: React.FC<ClaimPeginProps> = ({
  pegins,
  explorerLiquidUI,
  explorerBitcoinAPI,
  explorerLiquidAPI,
  toasts,
  currentBtcBlockHeight,
}) => {
  // Pin Modal
  const [needReset, setNeedReset] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);
  //
  const [isLoading, setIsLoading] = useState(false);
  const [claimedPegins, setClaimedPegins] = useState<Pegins>({});
  const [inputBtcPeginAddress, setInputBtcPeginAddress] = useState<string>();
  const [mnemonic, setMnemonic] = useState<Mnemonic>();
  const dispatch = useDispatch();

  useEffect(() => {
    toasts.map((t) => {
      if (t.type === 'error' && t.errorCode === 18) {
        managePinError(true).catch(console.error);
      }
    });
  }, [toasts]);

  // claimPegins effect with pegins in sync with store when claiming
  useEffect(() => {
    if (inputBtcPeginAddress) {
      if (mnemonic) {
        claimPegins(explorerBitcoinAPI, explorerLiquidAPI, pegins, mnemonic, currentBtcBlockHeight)
          .then((successPegins) => {
            if (Object.keys(successPegins).length) {
              setClaimedPegins(successPegins);
              Object.values(successPegins).forEach((p: Pegin) => {
                const utxos = Object.values(p.depositUtxos ?? []);
                utxos.forEach((utxo: DepositPeginUtxo) => {
                  if (utxo.claimTxId) {
                    dispatch(watchTransaction(utxo.claimTxId));
                  }
                });
              });
              dispatch(upsertPegins(successPegins));
              dispatch(addSuccessToast(`Claim transaction successful`));
              managePinSuccess().catch(console.error);
              setInputBtcPeginAddress(undefined);
              dispatch(checkIfClaimablePeginUtxo());
              dispatch(updateState());
            } else {
              dispatch(addErrorToast(NoClaimFoundError));
            }
          })
          .catch((err) => {
            console.error(err);
            dispatch(addErrorToast(ClaimPeginError));
            managePinError(true).catch(console.error);
          });
      } else {
        dispatch(addErrorToast(NoClaimFoundError));
        managePinError(true).catch(console.error);
      }
    }
    return () => {
      setInputBtcPeginAddress(undefined);
    };
  }, [pegins]);

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
      dispatch(addErrorToast(PinDigitsError));
      await managePinError();
    }
    await getIdentity(pin)
      .then(async (mnemonic: Mnemonic) => {
        const addrTrimmed = inputBtcPeginAddress?.trim();
        try {
          if (addrTrimmed && bitcoinJS.address.toOutputScript(addrTrimmed, getBitcoinJSNetwork(network.chain))) {
            setIsLoading(true);
            setMnemonic(mnemonic);
            dispatch(restorePeginFromDepositAddress(addrTrimmed));
          }
        } catch (err) {
          console.error(err);
          dispatch(addErrorToast(InvalidBitcoinAddress));
          managePinError(true).catch(console.error);
        }
      })
      .catch((e) => {
        console.error(e);
        dispatch(addErrorToast(IncorrectPINError));
        managePinError();
      });
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

export default ClaimPegin;
