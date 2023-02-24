import './styles.scss';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { Preferences } from '@capacitor/preferences';
import {
  IonContent,
  useIonViewWillEnter,
  useIonViewWillLeave,
  IonPage,
  IonRow,
  IonCol,
  IonButton,
  IonGrid,
  IonModal,
} from '@ionic/react';
import * as bip39 from 'bip39';
import type { MouseEventHandler } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { RouteComponentProps } from 'react-router';
import { useLocation } from 'react-router';

import Checkbox from '../../components/Checkbox';
import Header from '../../components/Header';
import Loader from '../../components/Loader';
import PageDescription from '../../components/PageDescription';
import PinInput from '../../components/PinInput';
import { useToastStore } from '../../store/toastStore';
import { useWalletStore } from '../../store/walletStore';
import { PIN_TIMEOUT_FAILURE, PIN_TIMEOUT_SUCCESS } from '../../utils/constants';
import type { AppError } from '../../utils/errors';
import { PinDigitsError, PINsDoNotMatchError, SecureStorageError } from '../../utils/errors';
import { TermsContent } from '../Terms';

interface LocationState {
  mnemonic: string;
}

const PinSetting: React.FC<RouteComponentProps> = ({ history }) => {
  const addErrorToast = useToastStore((state) => state.addErrorToast);
  const addSuccessToast = useToastStore((state) => state.addSuccessToast);
  const decryptMnemonic = useWalletStore((state) => state.decryptMnemonic);
  const setMnemonicEncrypted = useWalletStore((state) => state.setMnemonicEncrypted);
  const setIsAuthorized = useWalletStore((state) => state.setIsAuthorized);
  const generateMasterKeys = useWalletStore((state) => state.generateMasterKeys);
  const sync = useWalletStore((state) => state.sync);
  const subscribeAllScripts = useWalletStore((state) => state.subscribeAllScripts);
  //
  const { state } = useLocation<LocationState>();
  const [firstPin, setFirstPin] = useState<string>('');
  const [secondPin, setSecondPin] = useState<string>('');
  const [isRepeatScreen, setIsRepeatScreen] = useState<boolean>(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState<boolean>(false);
  const [isPinValidated, setIsPinValidated] = useState<boolean>(false);
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPinInputLocked, setIsPinInputLocked] = useState<boolean>(false);
  const [termsModalIsOpen, setTermsModalIsOpen] = useState(false);
  const inputRef = useRef<any>(null);

  const onPinDigitsError = useCallback(
    (isFirstPin: boolean) => {
      addErrorToast(PinDigitsError);
      setIsWrongPin(true);
      setTimeout(() => {
        setIsWrongPin(null);
        if (isFirstPin) {
          setFirstPin('');
        } else {
          setSecondPin('');
        }
      }, PIN_TIMEOUT_FAILURE);
    },
    [addErrorToast]
  );

  const onError = useCallback(
    (e: AppError) => {
      console.error(e);
      Preferences.clear().catch(console.error);
      addErrorToast(e);
      setIsWrongPin(true);
      setTimeout(() => {
        setIsWrongPin(null);
        isRepeatScreen && setSecondPin('');
      }, PIN_TIMEOUT_FAILURE);
    },
    [addErrorToast, isRepeatScreen]
  );

  const handleConfirm = useCallback(async () => {
    const validRegexp = new RegExp('\\d{6}');
    if (isRepeatScreen && !isPinValidated) {
      if (validRegexp.test(secondPin)) {
        if (secondPin === firstPin) {
          setIsPinInputLocked(true);
          try {
            // Coming from Show Mnemonic or from Backup Wallet 'do it later'
            await setMnemonicEncrypted(state?.mnemonic ?? bip39.generateMnemonic(), secondPin);
            addSuccessToast('Mnemonic generated and encrypted with your PIN.');
            setIsWrongPin(false);
            setIsPinValidated(true);
            if (Capacitor.isPluginAvailable('Keyboard')) {
              setTimeout(() => {
                Keyboard.hide().catch(console.error);
              }, 250);
              setTimeout(() => {
                Keyboard.hide().catch(console.error);
              }, 500);
              setTimeout(() => {
                Keyboard.hide().catch(console.error);
              }, 1000);
              setTimeout(() => {
                Keyboard.hide().catch(console.error);
              }, 1500);
            }
          } catch (_) {
            onError(SecureStorageError);
          }
        } else {
          onError(PINsDoNotMatchError);
        }
      } else {
        onPinDigitsError(false);
      }
    } else {
      if (validRegexp.test(firstPin)) {
        setIsWrongPin(false);
        setTimeout(() => {
          setIsRepeatScreen(true);
          setIsWrongPin(null);
        }, PIN_TIMEOUT_SUCCESS);
      } else {
        onPinDigitsError(true);
      }
    }
  }, [
    addSuccessToast,
    firstPin,
    isPinValidated,
    isRepeatScreen,
    onError,
    onPinDigitsError,
    secondPin,
    setMnemonicEncrypted,
    state?.mnemonic,
  ]);

  // Make sure PIN input always has focus when clicking anywhere
  const handleClick = () => {
    if (inputRef?.current) {
      inputRef.current.setFocus();
    }
  };
  useIonViewWillEnter(() => {
    document.body.addEventListener('click', handleClick);
  });
  useIonViewWillLeave(() => {
    document.body.removeEventListener('click', handleClick);
  });

  useEffect(() => {
    if ((!isRepeatScreen && firstPin.trim().length === 6) || (isRepeatScreen && secondPin.trim().length === 6))
      handleConfirm();
  }, [firstPin, handleConfirm, isRepeatScreen, secondPin]);

  const handleClickTerms: MouseEventHandler<HTMLAnchorElement> = (ev) => {
    ev.preventDefault();
    setTermsModalIsOpen(true);
  };

  return (
    <IonPage id="pin-setting-page">
      <Loader showLoading={loading} />
      <IonModal id="terms-modal" className="modal-big" isOpen={termsModalIsOpen}>
        <IonContent>
          <IonGrid>
            <Header
              title="TERMS & CONDITIONS"
              hasBackButton={false}
              hasCloseButton={true}
              handleClose={() => setTermsModalIsOpen(false)}
            />
            {TermsContent}
          </IonGrid>
        </IonContent>
      </IonModal>
      <IonContent>
        <IonGrid className="ion-text-center ion-justify-content-center">
          <Header
            hasBackButton={true}
            handleBack={() => {
              if (state?.mnemonic) {
                // Pass mnemonic to avoid regenerate it
                history.replace({
                  pathname: '/onboarding/show-mnemonic',
                  state: { mnemonic: state?.mnemonic },
                });
              } else {
                history.goBack();
              }
            }}
            hasCloseButton={false}
            title="SETUP WALLET"
          />
          <PageDescription
            centerDescription={true}
            description={
              isRepeatScreen
                ? 'Insert again the numeric password.\nIt must match the previous entry'
                : 'Your password must be 6 character long and must be set with only numbers'
            }
            title={isRepeatScreen ? 'Repeat PIN' : 'Set security PIN'}
          />
          <IonRow className="ion-margin-vertical">
            <IonCol>
              <PinInput
                isLocked={isPinInputLocked}
                inputRef={inputRef}
                isWrongPin={isWrongPin}
                on6digits={handleConfirm}
                onPin={isRepeatScreen ? setSecondPin : setFirstPin}
                pin={isRepeatScreen ? secondPin : firstPin}
              />
            </IonCol>
          </IonRow>

          {isRepeatScreen && (
            <>
              <Checkbox
                handleChange={setIsTermsAccepted}
                inputName="agreement"
                isChecked={isTermsAccepted}
                label={
                  <span className="terms-label">
                    {'I agree with the '}
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <a href="#" onClick={handleClickTerms}>
                      Terms and Conditions
                    </a>
                  </span>
                }
              />
              <IonRow className="ion-margin-vertical-x2">
                <IonCol size="9" offset="1.5">
                  <IonButton
                    className="main-button"
                    data-testid="main-button"
                    disabled={!isPinValidated || !isTermsAccepted}
                    onClick={async () => {
                      if (isPinValidated && isTermsAccepted) {
                        setLoading(true);
                        try {
                          const mnemonic = await decryptMnemonic(firstPin);
                          setIsWrongPin(null);
                          setLoading(false);
                          setIsAuthorized(true);
                          generateMasterKeys(mnemonic);
                          await sync();
                          await subscribeAllScripts();
                        } catch (err) {
                          console.error(err);
                        }
                      }
                    }}
                  >
                    CONTINUE
                  </IonButton>
                </IonCol>
              </IonRow>
            </>
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default PinSetting;
