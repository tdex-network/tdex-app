import './style.scss';
import { IonButton, IonCol, IonContent, IonGrid, IonInput, IonPage, IonRow } from '@ionic/react';
import * as bip39 from 'bip39';
import classNames from 'classnames';
import React, { useState } from 'react';
import type { RouteComponentProps } from 'react-router';

import Header from '../../components/Header';
import Loader from '../../components/Loader';
import PageDescription from '../../components/PageDescription';
import PinModal from '../../components/PinModal';
import { useFocus } from '../../hooks/useFocus';
import { useMnemonic } from '../../hooks/useMnemonic';
import { useAppStore } from '../../store/appStore';
import { useToastStore } from '../../store/toastStore';
import { useWalletStore } from '../../store/walletStore';
import { PIN_TIMEOUT_FAILURE, PIN_TIMEOUT_SUCCESS } from '../../utils/constants';
import type { AppError } from '../../utils/errors';
import { InvalidMnemonicError, PINsDoNotMatchError } from '../../utils/errors';
import { onPressEnterKeyFactory } from '../../utils/keyboard';

export const RestoreWallet: React.FC<RouteComponentProps> = ({ history }) => {
  const setIsBackupDone = useAppStore((state) => state.setIsBackupDone);
  const addErrorToast = useToastStore((state) => state.addErrorToast);
  const addSuccessToast = useToastStore((state) => state.addSuccessToast);
  const setMnemonicEncrypted = useWalletStore((state) => state.setMnemonicEncrypted);
  const setIsAuthorized = useWalletStore((state) => state.setIsAuthorized);
  const generateMasterKeysAndPaths = useWalletStore((state) => state.generateMasterKeysAndPaths);
  const sync = useWalletStore((state) => state.sync);
  const subscribeAllScripts = useWalletStore((state) => state.subscribeAllScripts);
  //
  const [mnemonic, setMnemonicWord] = useMnemonic();
  const [modalOpen, setModalOpen] = useState<'first' | 'second'>();
  const [firstPin, setFirstPin] = useState<string>();
  const [needReset, setNeedReset] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);

  const handleConfirm = () => {
    if (!bip39.validateMnemonic(mnemonic.join(' '))) {
      addErrorToast(InvalidMnemonicError);
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

  const onSecondPinConfirm = async (newPin: string) => {
    if (newPin === firstPin) {
      setLoading(true);
      const mnemonicStr = mnemonic.join(' ');
      await setMnemonicEncrypted(mnemonicStr, newPin);
      addSuccessToast('Mnemonic generated and encrypted with your PIN.');
      setIsWrongPin(false);
      setIsBackupDone(true);
      setIsAuthorized(true);
      generateMasterKeysAndPaths(mnemonicStr);
      await sync();
      await subscribeAllScripts();
      setTimeout(() => {
        setModalOpen(undefined);
        setIsWrongPin(null);
        setLoading(false);
      }, PIN_TIMEOUT_SUCCESS);
    } else {
      onError(PINsDoNotMatchError);
    }
  };

  const onError = (e: AppError) => {
    console.error(e);
    addErrorToast(e);
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
