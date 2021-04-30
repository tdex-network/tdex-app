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
  IonButtons,
  IonBackButton,
} from '@ionic/react';
import { IconCheck } from '../../components/icons';
import { useDispatch } from 'react-redux';
import * as bip39 from 'bip39';
import { signIn } from '../../redux/actions/appActions';
import {
  clearStorage,
  setMnemonicInSecureStorage,
} from '../../utils/storage-helper';
import PinModal from '../../components/PinModal';
import {
  addErrorToast,
  addSuccessToast,
} from '../../redux/actions/toastActions';
import BackupModal from '../../redux/containers/backupModalContainer';
import {
  AppError,
  PINsDoNotMatchError,
  SecureStorageError,
} from '../../utils/errors';
import {
  PIN_TIMEOUT_FAILURE,
  PIN_TIMEOUT_SUCCESS,
} from '../../utils/constants';
import { chevronBackOutline } from 'ionicons/icons';

const Login: React.FC<RouteComponentProps> = ({ history }) => {
  const dispatch = useDispatch();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState<'first' | 'second'>();
  const [pin, setPin] = useState<string>();
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [mnemonic, setMnemonic] = useState<string>();
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);

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
    setIsWrongPin(false);
    setTimeout(() => {
      setIsWrongPin(null);
      setModalOpen('second');
    }, PIN_TIMEOUT_SUCCESS);
  };

  const onError = (e: AppError) => {
    console.error(e);
    clearStorage();
    dispatch(addErrorToast(e));
    setIsWrongPin(true);
    setTimeout(() => {
      setIsWrongPin(null);
      setModalOpen(undefined);
      setPin(undefined);
    }, PIN_TIMEOUT_FAILURE);
  };

  const onSecondPinConfirm = (newPin: string) => {
    if (!mnemonic) throw Error('mnemonic should be generated.');
    if (newPin === pin) {
      setLoading(true);
      setMnemonicInSecureStorage(mnemonic, pin)
        .then(() => {
          dispatch(
            addSuccessToast('Mnemonic generated and encrypted with your PIN.')
          );
          dispatch(signIn(pin));
          setIsWrongPin(false);
          setTimeout(() => {
            history.push('/wallet');
            setIsWrongPin(null);
          }, 1500);
        })
        .catch(() => onError(SecureStorageError))
        .finally(() => setLoading(false));
      return;
    }
    // else PIN 1 != PIN 2
    onError(PINsDoNotMatchError);
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
        isWrongPin={isWrongPin}
      />
      <PinModal
        open={modalOpen === 'second'}
        title="Repeat your secret PIN"
        description="Confirm your secret PIN."
        onConfirm={onSecondPinConfirm}
        onClose={cancelSecondModal}
        isWrongPin={isWrongPin}
      />
      <div className="gradient-background" />
      <IonHeader className="ion-no-border">
        <IonToolbar className="with-back-button">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" text="" icon={chevronBackOutline} />
          </IonButtons>
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
        {mnemonic && (
          <BackupModal
            title="Seed generated !"
            description="Take time to write down your secret words (or skip and do it later)."
            isOpen={backupModalOpen}
            mnemonic={mnemonic}
            onClose={(_: 'done' | 'skipped') => {
              onBackupDone();
            }}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Login);
