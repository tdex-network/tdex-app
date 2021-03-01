import React, { ChangeEvent, useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonLoading,
} from '@ionic/react';
import { RouteComponentProps, withRouter } from 'react-router';
import PageDescription from '../../components/PageDescription';

import classNames from 'classnames';

import { IconBack, IconWarning } from '../../components/icons';

import './style.scss';
import { useDispatch } from 'react-redux';
import { setMnemonicInSecureStorage } from '../../utils/storage-helper';
import { signIn } from '../../redux/actions/appActions';
import { useMnemonic } from '../../utils/custom-hooks';
import PinModal from '../../components/PinModal';
import {
  addErrorToast,
  addSuccessToast,
} from '../../redux/actions/toastActions';

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
    // TODO check mnemonic validity
    setModalOpen('first');
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
      const restoredMnemonic = mnemonic.join(' ');
      setMnemonicInSecureStorage(restoredMnemonic, pin)
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
                <input
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setMnemonicWord(e, index)
                  }
                  value={item}
                  type="text"
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
