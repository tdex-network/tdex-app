import {
  IonContent,
  IonLabel,
  IonPage,
  IonButton,
  IonLoading,
  useIonViewWillEnter,
} from '@ionic/react';
import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { useDispatch } from 'react-redux';
import { signIn } from '../../redux/actions/appActions';
import PinModal from '../../components/PinModal';
import {
  getIdentity,
  mnemonicInSecureStorage,
} from '../../utils/storage-helper';
import { addErrorToast } from '../../redux/actions/toastActions';
import './style.scss';
import { setKeyboardTheme } from '../../utils/keyboard';
import { KeyboardStyle } from '@capacitor/core';
import { IncorrectPINError } from '../../utils/errors';
import { PIN_TIMEOUT_FAILURE } from '../../utils/constants';

const Homescreen: React.FC<RouteComponentProps> = ({ history }) => {
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);
  const [pinModalIsOpen, setPinModalIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState(
    'Searching mnemonic in secure storage...'
  );

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
      .catch((e) => {
        console.error(e);
        setIsWrongPin(true);
        setTimeout(() => {
          setIsWrongPin(null);
        }, PIN_TIMEOUT_FAILURE);
        dispatch(addErrorToast(IncorrectPINError));
      })
      .finally(() => setLoading(false));
  };

  useIonViewWillEnter(() => {
    const init = async () => {
      setLoading(true);
      await setKeyboardTheme(KeyboardStyle.Dark);
      const mnemonicExists = await mnemonicInSecureStorage();
      if (mnemonicExists) setPinModalIsOpen(true);
    };

    init()
      .catch(console.error)
      .finally(() => setLoading(false));
  });

  return (
    <IonPage>
      <IonLoading isOpen={loading} message={loadingMessage} />
      <PinModal
        open={pinModalIsOpen}
        title="Enter your secret PIN"
        description="Unlock your wallet."
        onConfirm={onConfirmPinModal}
        isWrongPin={isWrongPin}
      />
      <div className="gradient-background" />
      <IonContent>
        <div className="main-page-wrapper">
          <img className="logo" src="./assets/img/logo.png" />
          <div className="buttons homescreen">
            <IonButton className="main-button" routerLink="/login">
              <IonLabel>Setup wallet</IonLabel>
            </IonButton>
            <IonButton className="sub-button" routerLink="/restore">
              Restore wallet
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Homescreen;
