import {
  IonContent,
  IonLabel,
  IonPage,
  IonButton,
  useIonViewDidEnter,
  IonLoading,
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
import {
  addErrorToast,
  addSuccessToast,
} from '../../redux/actions/toastActions';

import './style.scss';

const Homescreen: React.FC<RouteComponentProps> = ({ history }) => {
  const [pinModalIsOpen, setPinModalIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState(
    'Searching mnemonic in secure storage...'
  );

  const dispatch = useDispatch();

  const onConfirmPinModal = (pin: string) => {
    setPinModalIsOpen(false);
    setLoadingMessage('Unlocking wallet...');
    setLoading(true);
    getIdentity(pin)
      .then(() => {
        dispatch(addSuccessToast('Your wallet has been unlocked.'));
        dispatch(signIn(pin));
        history.push('/wallet');
      })
      .catch((e) => {
        console.error(e);
        dispatch(addErrorToast('Error: bad PIN. Please retry.'));
        setTimeout(() => setPinModalIsOpen(true), 800);
      })
      .finally(() => setLoading(false));
  };

  useIonViewDidEnter(() => {
    mnemonicInSecureStorage()
      .then((mnemonicExists: boolean) => {
        if (mnemonicExists) setPinModalIsOpen(true);
      })
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
      />
      <div className="gradient-background"></div>
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
