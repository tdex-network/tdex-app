import { IonContent, IonButton, IonPage, IonInput, IonGrid, IonRow, IonCol } from '@ionic/react';
import * as bip39 from 'bip39';
import classNames from 'classnames';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import type { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router';

import Header from '../../components/Header';
import Loader from '../../components/Loader';
import PageDescription from '../../components/PageDescription';
import PinModal from '../../components/PinModal';
import { useFocus } from '../../hooks/useFocus';
import { useMnemonic } from '../../hooks/useMnemonic';
import { signIn } from '../../redux/actions/appActions';
import { addErrorToast, addSuccessToast } from '../../redux/actions/toastActions';
import { PIN_TIMEOUT_FAILURE, PIN_TIMEOUT_SUCCESS } from '../../utils/constants';
import type { AppError } from '../../utils/errors';
import { InvalidMnemonicError, PINsDoNotMatchError, SecureStorageError } from '../../utils/errors';
import { onPressEnterKeyFactory } from '../../utils/keyboard';
import { clearStorage, getIdentity, setMnemonicInSecureStorage } from '../../utils/storage-helper';
import './style.scss';

interface RestoreWalletProps extends RouteComponentProps {
  // connected redux props
  backupDone: boolean;
  setIsBackupDone: (done: boolean) => void;
}

const RestoreWallet: React.FC<RestoreWalletProps> = ({ history, setIsBackupDone }) => {
  const [mnemonic, setMnemonicWord] = useMnemonic();
  const [modalOpen, setModalOpen] = useState<'first' | 'second'>();
  const [firstPin, setFirstPin] = useState<string>();
  const [needReset, setNeedReset] = useState<boolean>(false);
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
    setFirstPin(newPin);
    setIsWrongPin(false);
    setTimeout(() => {
      setModalOpen('second');
      setIsWrongPin(null);
      setNeedReset(true);
    }, PIN_TIMEOUT_SUCCESS);
  };

  const onSecondPinConfirm = (newPin: string) => {
    if (newPin === firstPin) {
      setLoading(true);
      const restoredMnemonic = mnemonic.join(' ');
      setMnemonicInSecureStorage(restoredMnemonic, newPin)
        .then(() => {
          setIsBackupDone(true);
          dispatch(addSuccessToast('Mnemonic generated and encrypted with your PIN.'));
          getIdentity(newPin)
            .then((mnemonic) => {
              setIsWrongPin(false);
              setTimeout(() => {
                setIsWrongPin(null);
                setLoading(false);
                // setIsAuth will cause redirect to /wallet
                // Restore state
                dispatch(signIn(mnemonic));
              }, PIN_TIMEOUT_SUCCESS);
            })
            .catch(console.error);
        })
        .catch(() => onError(SecureStorageError));
      return;
    }
    onError(PINsDoNotMatchError);
  };

  const onError = (e: AppError) => {
    console.error(e);
    clearStorage().catch(console.error);
    dispatch(addErrorToast(e));
    setIsWrongPin(true);
    setLoading(false);
    setFirstPin('');
    setTimeout(() => {
      setModalOpen('first');
      setIsWrongPin(null);
      setNeedReset(true);
    }, PIN_TIMEOUT_FAILURE);
  };

  return (
    <IonPage>
      <Loader showLoading={loading} />
      <PinModal
        open={modalOpen === 'first' || modalOpen === 'second'}
        title={modalOpen === 'first' ? 'Set your secret PIN' : 'Repeat your secret PIN'}
        description={
          modalOpen === 'first'
            ? "Enter a 6-digit secret PIN to secure your wallet's seed."
            : 'Confirm your secret PIN.'
        }
        onConfirm={modalOpen === 'first' ? onFirstPinConfirm : onSecondPinConfirm}
        onClose={
          modalOpen === 'first'
            ? () => {
                setModalOpen(undefined);
                history.goBack();
              }
            : () => {
                setModalOpen('first');
                setNeedReset(true);
                setFirstPin('');
                setIsWrongPin(null);
              }
        }
        isWrongPin={isWrongPin}
        needReset={needReset}
        setNeedReset={setNeedReset}
        setIsWrongPin={setIsWrongPin}
      />
      <IonContent className="restore-wallet">
        <IonGrid className="ion-text-center">
          <Header hasBackButton={true} title="SECRET PHRASE" />
          <PageDescription
            centerDescription={true}
            description="Paste your 12 words recovery phrase in the correct order"
            title="Restore Wallet"
          />
          <div className="restore-input-wrapper ion-margin-vertical">
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
                    onIonChange={(e) => setMnemonicWord(e.detail.value || '', index)}
                    value={item}
                    type="text"
                    enterkeyhint={index === refs.length - 1 ? 'done' : 'next'}
                  />
                </label>
              );
            })}
          </div>

          <IonRow className="restore-btn-container">
            <IonCol size="9" offset="1.5" sizeMd="6" offsetMd="3">
              <IonButton disabled={mnemonic.includes('')} onClick={handleConfirm} className="main-button">
                RESTORE WALLET
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(RestoreWallet);
