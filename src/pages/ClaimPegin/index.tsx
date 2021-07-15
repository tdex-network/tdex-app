import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonInput,
  IonItem,
} from '@ionic/react';
import type { Mnemonic, AddressInterface } from 'ldk';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import type { RouteComponentProps } from 'react-router';

import Header from '../../components/Header';
import Loader from '../../components/Loader';
import PageDescription from '../../components/PageDescription';
import PinModal from '../../components/PinModal';
import {
  addErrorToast,
  addSuccessToast,
} from '../../redux/actions/toastActions';
import { deletePeginAddresses } from '../../redux/actions/walletActions';
import type { WalletState } from '../../redux/reducers/walletReducer';
import { claimPegin, searchPeginAddressData } from '../../utils/claim-pegin';
import {
  PIN_TIMEOUT_FAILURE,
  PIN_TIMEOUT_SUCCESS,
} from '../../utils/constants';
import {
  ClaimPeginError,
  IncorrectPINError,
  NoClaimFoundError,
  NoPeginAddressFoundError,
  PinDigitsError,
} from '../../utils/errors';
import { sleep } from '../../utils/helpers';
import { getIdentity } from '../../utils/storage-helper';
import './style.scss';

interface ClaimPeginProps extends RouteComponentProps {
  addresses: Record<string, AddressInterface>;
  explorerUrl: string;
  explorerBitcoinUrl: string;
  peginAddresses: WalletState['peginAddresses'];
}

const ClaimPegin: React.FC<ClaimPeginProps> = ({
  addresses,
  explorerUrl,
  explorerBitcoinUrl,
  peginAddresses,
}) => {
  // Pin Modal
  const [needReset, setNeedReset] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);
  //
  const [isLoading, setIsLoading] = useState(false);
  const [claimTxs, setClaimTxs] = useState<string[]>([]);
  const [btcPeginAddress, setBtcPeginAddress] = useState<string>();
  const dispatch = useDispatch();

  const managePinError = async (closeModal = false) => {
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
    setIsWrongPin(false);
    setTimeout(() => {
      setIsWrongPin(null);
      setNeedReset(true);
    }, PIN_TIMEOUT_SUCCESS);
    await sleep(PIN_TIMEOUT_SUCCESS);
    setModalOpen(false);
  };

  const handleConfirm = async (pin: string) => {
    const validRegexp = new RegExp('\\d{6}');
    if (!validRegexp.test(pin)) {
      dispatch(addErrorToast(PinDigitsError));
      await managePinError();
    }
    getIdentity(pin)
      .then(async (mnemonic: Mnemonic) => {
        setIsLoading(true);
        let peginAddr: WalletState['peginAddresses'] | undefined;
        if (btcPeginAddress) {
          try {
            peginAddr = await searchPeginAddressData(
              addresses,
              btcPeginAddress,
            );
          } catch (err) {
            console.error(err);
            dispatch(addErrorToast(ClaimPeginError));
            await managePinError(true);
          }
        } else {
          if (Object.values(peginAddresses).length) {
            peginAddr = peginAddresses;
          } else {
            dispatch(addErrorToast(NoPeginAddressFoundError));
            await managePinError(true);
            return;
          }
        }
        if (peginAddr) {
          claimPegin(
            explorerBitcoinUrl,
            explorerUrl,
            peginAddr,
            mnemonic,
            dispatch,
          )
            .then(txs => {
              if (txs?.length) {
                setClaimTxs(txs);
                dispatch(addSuccessToast(`Claim Transaction broadcasted`));
                managePinSuccess();
                dispatch(deletePeginAddresses());
                setBtcPeginAddress(undefined);
              } else {
                dispatch(addErrorToast(NoClaimFoundError));
                managePinError(true);
              }
            })
            .catch(err => {
              console.error(err);
              dispatch(addErrorToast(ClaimPeginError));
              managePinError(true);
            });
        } else {
          dispatch(addErrorToast(NoClaimFoundError));
          await managePinError(true);
        }
      })
      .catch(e => {
        console.error(e);
        dispatch(addErrorToast(IncorrectPINError));
        managePinError();
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <IonPage>
      <Loader showLoading={isLoading} delay={0} />
      <PinModal
        open={modalOpen}
        title="Enter your secret PIN"
        description={`Enter your secret PIN to claim funds`}
        onConfirm={handleConfirm}
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
            description="In case you think that TDEX automatic pegin functionality has failed, you can claim your Liquid Bitcoin manually."
            title="Claim your Liquid Bitcoin"
          />
          {/**/}
          <IonRow className="ion-margin-vertical-x2">
            <IonCol size="10" offset="1">
              <IonItem className="input">
                <IonInput
                  className="ion-text-left"
                  inputmode="text"
                  onIonChange={e => setBtcPeginAddress(e.detail.value || '')}
                  placeholder="Optional BTC Pegin Address"
                  value={btcPeginAddress}
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
                  onClick={() => {
                    setModalOpen(true);
                  }}
                >
                  CLAIM
                </IonButton>
              </IonRow>
            </IonCol>
          </IonRow>
          {claimTxs.length > 0 && (
            <IonRow className="ion-text-left">
              <IonCol size="10" offset="1">
                <ul className="ion-no-padding">
                  <h6>{`Liquid Bitcoin pegin transaction${
                    claimTxs.length > 1 ? 's' : ''
                  }:`}</h6>
                  {claimTxs.map((txid, i) => (
                    <li key={i}>
                      <a
                        href={`${explorerUrl}/tx/${txid}`}
                        target="_blank"
                      >{`${explorerUrl}/tx/${txid}`}</a>
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
