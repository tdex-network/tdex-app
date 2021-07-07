import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
} from '@ionic/react';
import type { Mnemonic } from 'ldk';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import type { RouteComponentProps } from 'react-router';

import Header from '../../components/Header';
import PageDescription from '../../components/PageDescription';
import PinModal from '../../components/PinModal';
import { addErrorToast } from '../../redux/actions/toastActions';
import type { WalletState } from '../../redux/reducers/walletReducer';
import { claimPegin } from '../../utils/claim-pegin';
import {
  PIN_TIMEOUT_FAILURE,
  PIN_TIMEOUT_SUCCESS,
} from '../../utils/constants';
import { IncorrectPINError, PinDigitsError } from '../../utils/errors';
import { getIdentity } from '../../utils/storage-helper';

interface ClaimPeginProps extends RouteComponentProps {
  explorerUrl: string;
  explorerBitcoinUrl: string;
  peginAddresses: WalletState['peginAddresses'];
}

const ClaimPegin: React.FC<ClaimPeginProps> = ({
  explorerUrl,
  explorerBitcoinUrl,
  peginAddresses,
}) => {
  // Pin Modal
  const [needReset, setNeedReset] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);
  //
  const [claimTxs, setClaimTxs] = useState<string[]>([]);
  const dispatch = useDispatch();

  const managePinError = () => {
    setIsWrongPin(true);
    setTimeout(() => {
      setIsWrongPin(null);
      setNeedReset(true);
    }, PIN_TIMEOUT_FAILURE);
  };

  const managePinSuccess = () => {
    setIsWrongPin(false);
    setTimeout(() => {
      setIsWrongPin(null);
      setNeedReset(true);
    }, PIN_TIMEOUT_SUCCESS);
  };

  const handleConfirm = (pin: string) => {
    const validRegexp = new RegExp('\\d{6}');
    if (validRegexp.test(pin)) {
      getIdentity(pin)
        .then((mnemonic: Mnemonic) => {
          return claimPegin(
            explorerBitcoinUrl,
            explorerUrl,
            peginAddresses,
            mnemonic,
            dispatch,
            managePinSuccess,
            managePinError,
          );
        })
        .then(txs => {
          if (txs.length) {
            setClaimTxs(txs);
          }
          setModalOpen(false);
        })
        .catch(e => {
          console.error(e);
          managePinError();
          dispatch(addErrorToast(IncorrectPINError));
        });
    } else {
      managePinError();
      dispatch(addErrorToast(PinDigitsError));
    }
  };

  return (
    <IonPage>
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
      />
      <IonContent className="backup-content">
        <IonGrid className="ion-text-center ion-justify-content-center">
          <Header hasBackButton={true} title="CLAIM LIQUID BITCOIN" />
          <PageDescription
            description="In case you think that TDEX automatic pegin functionality has failed, you can claim your Liquid Bitcoin manually."
            title="Claim your Liquid Bitcoin"
          />
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
                  {`You can see your claim transaction${
                    claimTxs.length > 1 ? 's' : ''
                  } at:`}
                  {claimTxs.map((txid, i) => (
                    <li key={i}>
                      <a href={`${explorerUrl}/tx/${txid}`}>{txid}</a>
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
