import React, { ChangeEvent, useState } from 'react';
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
  IonLoading,
  IonModal,
} from '@ionic/react';
import { IconBack, IconCheck } from '../../components/icons';
import { useDispatch } from 'react-redux';
import * as bip39 from 'bip39';
import { signIn } from '../../redux/actions/appActions';
import { setMnemonicInSecureStorage } from '../../utils/storage-helper';
import PinModal from '../../components/PinModal';
import {
  addErrorToast,
  addSuccessToast,
} from '../../redux/actions/toastActions';
import ShowMnemonic from '../../components/ShowMnemonic';

const Login: React.FC<RouteComponentProps> = ({ history }) => {
  const dispatch = useDispatch();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState<'first' | 'second'>();
  const [pin, setPin] = useState<string>();
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [mnemonic, setMnemonic] = useState('');

  const onConfirm = () => {
    if (acceptTerms) {
      setMnemonic(bip39.generateMnemonic());
      setBackupModalOpen(true);
    }
  };

  const onBackupDone = () => {
    setBackupModalOpen(false);
    if (mnemonic) setModalOpen('first');
  };

  const onFirstPinConfirm = (newPin: string) => {
    setPin(newPin);
    setModalOpen('second');
  };

  const onError = (e: string) => {
    dispatch(addErrorToast(e));
    console.error(e);
    setModalOpen(undefined);
    setPin(undefined);
  };

  const onSecondPinConfirm = (newPin: string) => {
    if (newPin === pin) {
      setLoading(true);
      setMnemonicInSecureStorage(mnemonic, pin)
        .then((isStored) => {
          if (!isStored) throw new Error('unknow error for secure storage');
          dispatch(
            addSuccessToast('Mnemonic generated and encrypted with your PIN.')
          );
          dispatch(signIn(pin));
          history.push('/wallet');
        })
        .catch(onError)
        .finally(() => setLoading(false));
      return;
    }
    onError('PINs do not match.');
  };

  const cancelSecondModal = () => {
    setPin(undefined);
    setModalOpen('first');
  };

  return (
    <IonPage>
      <IonLoading isOpen={loading} />
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

        <IonModal isOpen={backupModalOpen}>
          <div className="gradient-background" />
          <IonHeader>
            <IonToolbar className="with-back-button">
              <IonTitle>Backup your seed</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="backup-content">
              <p>Never share your mnemonic</p>
              <ShowMnemonic mnemonic={mnemonic} />
              <div className="buttons">
                <IonButton className="main-button" onClick={onBackupDone}>
                  OK
                </IonButton>
              </div>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Login);
