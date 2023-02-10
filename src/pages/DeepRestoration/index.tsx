import type { RangeValue, RangeChangeEventDetail } from '@ionic/core/components';
import { IonButton, IonCol, IonContent, IonGrid, IonItem, IonPage, IonRange, IonRow } from '@ionic/react';
import React, { useState } from 'react';

import Header from '../../components/Header';
import Loader from '../../components/Loader';
import PinModal from '../../components/PinModal';
import { useToastStore } from '../../store/toastStore';
import { useWalletStore } from '../../store/walletStore';
import { PIN_TIMEOUT_FAILURE, PIN_TIMEOUT_SUCCESS } from '../../utils/constants';
import { DeepRestorationError, IncorrectPINError } from '../../utils/errors';

const DeepRestoration: React.FC = () => {
  const addErrorToast = useToastStore((state) => state.addErrorToast);
  const addSuccessToast = useToastStore((state) => state.addSuccessToast);
  const decryptMnemonic = useWalletStore((state) => state.decryptMnemonic);
  const resetWalletStore = useWalletStore((state) => state.resetWalletStore);
  const sync = useWalletStore((state) => state.sync);
  const subscribeAllScripts = useWalletStore((state) => state.subscribeAllScripts);
  //
  const [rangeValue, setRangeValue] = useState<RangeValue>(20);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);
  const [needReset, setNeedReset] = useState<boolean>(false);
  const [isLoading, setLoading] = useState(false);

  const handlePinConfirm = async (pin: string) => {
    try {
      const mnemonic = await decryptMnemonic(pin);
      setIsWrongPin(false);
      setTimeout(async () => {
        setNeedReset(true);
        setIsPinModalOpen(false);
        setIsWrongPin(null);
        setLoading(true);
        await handleRestoration(mnemonic);
      }, PIN_TIMEOUT_SUCCESS);
    } catch (err) {
      setIsWrongPin(true);
      setTimeout(() => {
        setIsWrongPin(null);
        setNeedReset(true);
      }, PIN_TIMEOUT_FAILURE);
      addErrorToast(IncorrectPINError);
      console.error(err);
    }
  };

  const handleRestoration = async (mnemonic: string) => {
    try {
      resetWalletStore();
      await sync(Number(rangeValue));
      await subscribeAllScripts();
      addSuccessToast('Account discovery successful');
    } catch (err) {
      console.error(err);
      addErrorToast(DeepRestorationError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage id="deep-restoration-page">
      <Loader message="Scanning..." showLoading={isLoading} />
      <PinModal
        needReset={needReset}
        setNeedReset={setNeedReset}
        open={isPinModalOpen}
        title="Account discovery"
        description="Enter your PIN to start scanning"
        onConfirm={handlePinConfirm}
        onClose={() => setIsPinModalOpen(false)}
        isWrongPin={isWrongPin}
        setIsWrongPin={setIsWrongPin}
      />
      <IonContent>
        <IonGrid className="ion-text-center ion-justify-content-center">
          <Header hasBackButton={true} title="DEEP RESTORATION" />
          <IonRow className="ion-margin-vertical">
            <IonCol offset="1" size="10">
              <p>Choose the gap limit for the account discovery</p>
            </IonCol>
          </IonRow>
          <IonRow className="ion-margin-vertical">
            <IonCol>
              <IonItem>
                <IonRange
                  onIonChange={(e: CustomEvent<RangeChangeEventDetail>) => {
                    setRangeValue(e.detail.value);
                  }}
                  min={20}
                  max={100}
                  step={20}
                  pin={true}
                  snaps={true}
                  color="secondary"
                />
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow className="ion-margin-vertical-x2">
            <IonCol offset="1" size="10">
              <p>
                {`Scan the Liquid Network up to ${rangeValue} consecutive unused addresses. If new funds are discovered, they will show up in your balance.`}
              </p>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="9" offset="1.5" sizeMd="6" offsetMd="3">
              <IonButton className="main-button" onClick={() => setIsPinModalOpen(true)}>
                Confirm
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default DeepRestoration;
