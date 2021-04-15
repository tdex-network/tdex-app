import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonLoading,
  IonInput,
} from '@ionic/react';
import { RouteComponentProps, withRouter } from 'react-router';
import PageDescription from '../../components/PageDescription';
import classNames from 'classnames';
import { IconBack, IconWarning } from '../../components/icons';
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

const RestoreWallet: React.FC<RouteComponentProps> = ({ history }) => {
  const [mnemonic, setMnemonicWord] = useMnemonic();
  const [modalOpen, setModalOpen] = useState<'first' | 'second'>();
  const [pin, setPin] = useState<string>();
  const [isEmpty, setIsEmpty] = useState(true);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const filledMnemonic = mnemonic.filter((item: string) => item);
    const isMnemonicFilled = filledMnemonic.length === 12;
    setIsEmpty(!isMnemonicFilled);
  }, [mnemonic]);

  const handleConfirm = () => {
    if (!bip39.validateMnemonic(mnemonic.join(' '))) {
      dispatch(addErrorToast('Invalid BIP39 mnemonic'));
      return;
    }
    setModalOpen('first');
  };

  // use for keyboard tricks
  const [refs, setFocus] = useFocus(12, handleConfirm);

  const onFirstPinConfirm = (newPin: string) => {
    setPin(newPin);
    setModalOpen('second');
  };

  const onError = (e: Error) => {
    clearStorage();
    dispatch(addErrorToast('Error during setup mnemonic:' + e.message));
    console.error(e);
    setModalOpen(undefined);
    setPin(undefined);
  };

  const onSecondPinConfirm = (newPin: string) => {
    if (newPin === pin) {
      setLoading(true);
      const restoredMnemonic = mnemonic.join(' ');
      setMnemonicInSecureStorage(restoredMnemonic, pin)
        .then((isStored) => {
          if (!isStored) throw new Error('unknow error for secure storage');
          dispatch(
            addSuccessToast('Mnemonic generated and encrypted with your PIN.')
          );
          dispatch(signIn(pin));
          // we don't need to ask backup if the mnemonic is restored
          dispatch(setBackupDone());
          history.push('/wallet');
        })
        .catch(onError)
        .finally(() => setLoading(false));
      return;
    }

    onError(new Error('PINs do not match.'));
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
      <div className="gradient-background"></div>
      <IonHeader>
        <IonToolbar className="with-back-button">
          <IonButton
            onClick={() => {
              history.goBack();
            }}
          >
            <IconBack />
          </IonButton>
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

        <div className="warning-message">
          <div className="warning-icon">
            <IconWarning width="25px" height="25px" viewBox="0 0 25 25" />
          </div>
          <p className="warning">
            Write your secret phrase and store it in a safe place such as safe
            deposit box
          </p>
        </div>
        <div className="buttons restore">
          <IonButton
            disabled={isEmpty}
            onClick={handleConfirm}
            className="main-button"
          >
            Confirm
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(RestoreWallet);
