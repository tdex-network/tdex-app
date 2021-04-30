import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonLoading,
  IonInput,
  IonButtons,
  IonBackButton,
} from '@ionic/react';
import { RouteComponentProps, withRouter } from 'react-router';
import PageDescription from '../../components/PageDescription';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import {
  clearStorage,
  setMnemonicInSecureStorage,
} from '../../utils/storage-helper';
import { setBackupDone, signIn } from '../../redux/actions/appActions';
import { useFocus, useMnemonic } from '../../utils/custom-hooks';
import PinModal from '../../components/PinModal';
import {
  addErrorToast,
  addSuccessToast,
} from '../../redux/actions/toastActions';
import * as bip39 from 'bip39';
import { onPressEnterKeyFactory } from '../../utils/keyboard';
import './style.scss';
import {
  AppError,
  InvalidMnemonicError,
  PINsDoNotMatchError,
  SecureStorageError,
} from '../../utils/errors';
import {
  PIN_TIMEOUT_FAILURE,
  PIN_TIMEOUT_SUCCESS,
} from '../../utils/constants';
import { chevronBackOutline } from 'ionicons/icons';

const RestoreWallet: React.FC<RouteComponentProps> = ({ history }) => {
  const [mnemonic, setMnemonicWord] = useMnemonic();
  const [modalOpen, setModalOpen] = useState<'first' | 'second'>();
  const [pin, setPin] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);
  const dispatch = useDispatch();

  const handleConfirm = () => {
    if (!bip39.validateMnemonic(mnemonic.join(' '))) {
      dispatch(addErrorToast(InvalidMnemonicError));
      return;
    }
    setModalOpen('first');
  };

  // use for keyboard tricks
  const [refs, setFocus] = useFocus(12, handleConfirm);

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
    if (newPin === pin) {
      setLoading(true);
      const restoredMnemonic = mnemonic.join(' ');
      setMnemonicInSecureStorage(restoredMnemonic, pin)
        .then(() => {
          dispatch(
            addSuccessToast('Mnemonic generated and encrypted with your PIN.')
          );
          setIsWrongPin(false);
          dispatch(signIn(pin));
          dispatch(setBackupDone());
          setTimeout(() => {
            // we don't need to ask backup if the mnemonic is restored
            history.push('/wallet');
            setIsWrongPin(null);
          }, PIN_TIMEOUT_SUCCESS);
        })
        .catch(() => onError(SecureStorageError))
        .finally(() => setLoading(false));
      return;
    }
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
      <IonHeader className="ion-no-border">
        <IonToolbar className="with-back-button">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" text="" icon={chevronBackOutline} />
          </IonButtons>
          <IonTitle>Secret phrase</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="restore-wallet">
        <PageDescription title="RestoreWallet">
          <p>Paste your 12-word recovery phrase in the correct order</p>
        </PageDescription>

        <div className="restore-input-wrapper">
          {mnemonic.map((item: string, index: number) => {
            return (
              <label
                key={index}
                className={classNames('restore-input', {
                  active: mnemonic[index],
                })}
              >
                <div className="input-number">{index + 1}</div>
                <IonInput
                  ref={refs[index]}
                  className="input-word"
                  onKeyDown={onPressEnterKeyFactory(() => setFocus(index + 1))}
                  onIonChange={(e) =>
                    setMnemonicWord(e.detail.value || '', index)
                  }
                  value={item}
                  type="text"
                  enterkeyhint={index === refs.length - 1 ? 'done' : 'next'}
                />
              </label>
            );
          })}
        </div>

        <div className="buttons restore">
          <IonButton
            disabled={mnemonic.includes('')}
            onClick={handleConfirm}
            className="main-button"
          >
            RESTORE WALLET
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(RestoreWallet);
