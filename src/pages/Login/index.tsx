import React, { ChangeEvent, useEffect, useState } from 'react';
import classNames from 'classnames';
import { RouteComponentProps, withRouter } from 'react-router';
import PageDescription from '../../components/PageDescription';
import './style.scss';
import {
  IonContent,
  IonHeader,
  IonButton,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { IconBack, IconCheck } from '../../components/icons';
import { useDispatch, useSelector } from 'react-redux';
import * as bip39 from 'bip39';
import { signIn } from '../../redux/actions/appActions';
import { setMnemonicInSecureStorage } from '../../utils/storage-helper';
import PinModal from '../../components/PinModal';

const Login: React.FC<RouteComponentProps> = ({ history }) => {
  const dispatch = useDispatch();
  const isAuth = useSelector((state: any) => state.wallet.isAuth);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [modalOpen, setModalOpen] = useState<'first' | 'second'>();
  const [pin, setPin] = useState<string>();

  useEffect(() => {
    if (isAuth) {
      history.push('/wallet');
    }
  }, [isAuth]);

  const onConfirm = async () => {
    // setMnemonicInSecureStorage(newMnemonic);
    if (acceptTerms) setModalOpen('first');
  };

  const onFirstPinConfirm = (newPin: string) => {
    setPin(newPin);
    setModalOpen('second');
  };

  const onSecondPinConfirm = (newPin: string) => {
    if (newPin === pin) {
      const generatedMnemonic = bip39.generateMnemonic();
      setMnemonicInSecureStorage(generatedMnemonic, pin)
        .then((isStored) => {
          if (!isStored) throw new Error('unknow error for secure storage');
          dispatch(signIn(pin));
        })
        .catch(console.error);
      return;
    }

    // TODO handle error correctly in PinModal
    console.error('pin do not match');
  };

  const cancelSecondModal = () => {
    setPin(undefined);
    setModalOpen('first');
  };

  return (
    <IonPage>
      <PinModal
        open={modalOpen === 'first'}
        title="Set your secret PIN"
        description="Enter a 6-digit secret PIN to secure your wallet's seed."
        onConfirm={onFirstPinConfirm}
        onClose={() => {
          setModalOpen(undefined);
          history.goBack();
        }}
      />
      <PinModal
        open={modalOpen === 'second'}
        title="Repeat your secret PIN"
        description="Confirm your secret PIN."
        onConfirm={onSecondPinConfirm}
        onClose={cancelSecondModal}
      />
      <div className="gradient-background" />
      <IonHeader>
        <IonToolbar className="with-back-button">
          <IonButton
            onClick={() => {
              history.goBack();
            }}
          >
            <IconBack />
          </IonButton>
          <IonTitle>SETUP WALLET</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="login">
        <PageDescription title="Create your TDEX wallet">
          <p className="task-description">
            Clicking on generate will randomly create a mnemonic of 12 words. It
            will be used as the seed of your wallet and will be stored in the
            secure storage of your device.
          </p>
        </PageDescription>
        <label className="terms">
          <input
            type="checkbox"
            name="agreement"
            checked={acceptTerms}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setAcceptTerms(e.target.checked)
            }
          />
          <div className="custom-check">
            <div className="check-icon">
              <IconCheck />
            </div>
          </div>
          I agree with <a href="/"> Terms and Conditions</a>
        </label>

        <div className="buttons login">
          <IonButton
            className={classNames('main-button', {
              secondary: !acceptTerms,
            })}
            disabled={!acceptTerms}
            onClick={onConfirm}
          >
            Confirm
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Login);
