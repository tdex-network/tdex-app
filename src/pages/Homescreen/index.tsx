import { KeyboardStyle } from '@capacitor/core';
import {
  IonContent,
  IonPage,
  IonLoading,
  useIonViewWillEnter,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RouteComponentProps } from 'react-router';

import logo from '../../assets/img/tdex_3d_logo.svg';
import ButtonsMainSub from '../../components/ButtonsMainSub';
import PinModal from '../../components/PinModal';
import { initApp, signIn } from '../../redux/actions/appActions';
import { addErrorToast } from '../../redux/actions/toastActions';
import { PIN_TIMEOUT_FAILURE } from '../../utils/constants';
import { IncorrectPINError } from '../../utils/errors';
import { setKeyboardTheme } from '../../utils/keyboard';
import {
  getIdentity,
  mnemonicInSecureStorage,
} from '../../utils/storage-helper';
import './style.scss';

const Homescreen: React.FC<RouteComponentProps> = ({ history }) => {
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);
  const [pinModalIsOpen, setPinModalIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [needReset, setNeedReset] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState(
    'Searching mnemonic in secure storage...',
  );
  const appInit = useSelector((state: any) => state.app.appInit);
  const dispatch = useDispatch();

  const onConfirmPinModal = (pin: string) => {
    setLoadingMessage('Unlocking wallet...');
    setLoading(true);
    getIdentity(pin)
      .then(() => {
        setIsWrongPin(false);
        dispatch(signIn(pin));
        setTimeout(() => {
          history.push('/wallet');
          setIsWrongPin(null);
        }, 1500);
      })
      .catch(e => {
        console.error(e);
        setIsWrongPin(true);
        setTimeout(() => {
          setIsWrongPin(null);
          setNeedReset(true);
        }, PIN_TIMEOUT_FAILURE);
        dispatch(addErrorToast(IncorrectPINError));
      })
      .finally(() => setLoading(false));
  };

  useIonViewWillEnter(() => {
    const init = async () => {
      setLoading(true);
      if (!appInit) dispatch(initApp());
      await setKeyboardTheme(KeyboardStyle.Dark);
      const mnemonicExists = await mnemonicInSecureStorage();
      if (mnemonicExists) setPinModalIsOpen(true);
    };
    init()
      .catch(console.error)
      .finally(() => setLoading(false));
  });

  return (
    <IonPage id="homescreen">
      <IonLoading isOpen={loading} message={loadingMessage} />
      <PinModal
        onClose={() => setPinModalIsOpen(false)}
        needReset={needReset}
        setNeedReset={setNeedReset}
        open={pinModalIsOpen}
        title="Enter your secret PIN"
        description="Unlock your wallet"
        onConfirm={onConfirmPinModal}
        isWrongPin={isWrongPin}
      />
      <IonContent>
        <IonGrid className="ion-text-center ion-justify-content-evenly">
          <IonRow className="img-container">
            <IonCol size="8" offset="2" sizeMd="6" offsetMd="3">
              <img src={logo} alt="tdex logo" />
            </IonCol>
          </IonRow>

          <ButtonsMainSub
            mainTitle="Setup wallet"
            mainLink="/onboarding/backup"
            subTitle="Restore wallet"
            subLink="/restore"
            className="btn-container"
          />
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Homescreen;
