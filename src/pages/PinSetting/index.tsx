import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
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
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { RouteComponentProps } from 'react-router';
import { useLocation } from 'react-router';

import Checkbox from '../../components/Checkbox';
import Header from '../../components/Header';
import Loader from '../../components/Loader';
import PageDescription from '../../components/PageDescription';
import PinInput from '../../components/PinInput';
import { signIn } from '../../redux/actions/appActions';
import { addErrorToast, addSuccessToast } from '../../redux/actions/toastActions';
import { PIN_TIMEOUT_FAILURE, PIN_TIMEOUT_SUCCESS } from '../../utils/constants';
import type { AppError } from '../../utils/errors';
import { PinDigitsError, PINsDoNotMatchError, SecureStorageError } from '../../utils/errors';
import { clearStorage, getIdentity, setMnemonicInSecureStorage } from '../../utils/storage-helper';
import { TermsContent } from '../Terms';

import './styles.scss';

interface LocationState {
  mnemonic: string;
}

const PinSetting: React.FC<RouteComponentProps> = ({ history }) => {
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
  const dispatch = useDispatch();
  const inputRef = useRef<any>(null);

  const validRegexp = new RegExp('\\d{6}');

  const handleConfirm = () => {
    if (isRepeatScreen && !isPinValidated) {
      if (validRegexp.test(secondPin)) {
        if (secondPin === firstPin) {
          setIsPinInputLocked(true);
          setMnemonicInSecureStorage(
            // Coming from Show Mnemonic or from Backup Wallet 'do it later'
            state?.mnemonic ?? bip39.generateMnemonic(),
            secondPin
          )
            .then(() => {
              dispatch(addSuccessToast('Mnemonic generated and encrypted with your PIN.'));
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
            })
            .catch(() => onError(SecureStorageError));
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
  };

  const onPinDigitsError = (isFirstPin: boolean) => {
    dispatch(addErrorToast(PinDigitsError));
    setIsWrongPin(true);
    setTimeout(() => {
      setIsWrongPin(null);
      if (isFirstPin) {
        setFirstPin('');
      } else {
        setSecondPin('');
      }
    }, PIN_TIMEOUT_FAILURE);
  };

  const onError = (e: AppError) => {
    console.error(e);
    clearStorage().catch(console.error);
    dispatch(addErrorToast(e));
    setIsWrongPin(true);
    setTimeout(() => {
      setIsWrongPin(null);
      isRepeatScreen && setSecondPin('');
    }, PIN_TIMEOUT_FAILURE);
  };

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
  }, [firstPin, secondPin]);

  const handleClickTerms = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    ev.preventDefault();
    setTermsModalIsOpen(true);
  };

  return (
    <IonPage id="pin-setting-page">
      <Loader showLoading={loading} />
      <IonModal id="terms-modal" cssClass="modal-big" isOpen={termsModalIsOpen}>
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
                ? 'Insert again the numeric password.\n' + 'It must match the previous entry'
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
                    I agree with the{' '}
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
                    data-cy="main-button"
                    disabled={!isPinValidated || !isTermsAccepted}
                    onClick={() => {
                      if (isPinValidated && isTermsAccepted) {
                        setLoading(true);
                        getIdentity(firstPin)
                          .then((mnemonic) => {
                            setIsWrongPin(null);
                            setLoading(false);
                            // setIsAuth will cause redirect to /wallet
                            // Restore state
                            dispatch(signIn(mnemonic));
                          })
                          .catch(console.error);
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
