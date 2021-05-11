import React, { useEffect, useRef, useState } from 'react';
import {
  IonContent,
  useIonViewWillEnter,
  useIonViewWillLeave,
  IonPage,
  IonRow,
  IonCol,
  IonButton,
  IonGrid,
  IonLoading,
} from '@ionic/react';
import PinInput from '../../components/PinInput';
import { useDispatch } from 'react-redux';
import {
  addErrorToast,
  addSuccessToast,
} from '../../redux/actions/toastActions';
import {
  AppError,
  PinDigitsError,
  PINsDoNotMatchError,
  SecureStorageError,
} from '../../utils/errors';
import Header from '../../components/Header';
import PageDescription from '../../components/PageDescription';
import Checkbox from '../../components/Checkbox';
import {
  PIN_TIMEOUT_FAILURE,
  PIN_TIMEOUT_SUCCESS,
} from '../../utils/constants';
import {
  clearStorage,
  setMnemonicInSecureStorage,
} from '../../utils/storage-helper';
import { signIn } from '../../redux/actions/appActions';
import { RouteComponentProps, useLocation } from 'react-router';
import * as bip39 from 'bip39';
import { Plugins } from '@capacitor/core';
const { Keyboard } = Plugins;

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
              dispatch(
                addSuccessToast(
                  'Mnemonic generated and encrypted with your PIN.'
                )
              );
              setIsWrongPin(false);
              setIsPinValidated(true);
              Keyboard.hide().catch(console.error);
            })
            .catch(() => onError(SecureStorageError));
        } else {
          onError(PINsDoNotMatchError);
        }
      } else {
        dispatch(addErrorToast(PinDigitsError));
      }
    } else {
      if (validRegexp.test(firstPin)) {
        setIsWrongPin(false);
        setTimeout(() => {
          setIsRepeatScreen(true);
          setIsWrongPin(null);
        }, PIN_TIMEOUT_SUCCESS);
      } else {
        dispatch(addErrorToast(PinDigitsError));
      }
    }
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
    if (inputRef && inputRef.current) {
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
    if (
      (!isRepeatScreen && firstPin.trim().length === 6) ||
      (isRepeatScreen && secondPin.trim().length === 6)
    )
      handleConfirm();
  }, [firstPin, secondPin]);

  return (
    <IonPage id="pin-setting-page">
      <IonLoading isOpen={loading} />
      <IonContent>
        <Header
          hasBackButton={true}
          handleBack={() =>
            history.replace({
              pathname: '/onboarding/show-mnemonic',
              state: { mnemonic: state?.mnemonic },
            })
          }
          hasCloseButton={false}
          title="SETUP WALLET"
        />
        <IonGrid className="ion-text-center ion-justify-content-center">
          <PageDescription
            description={
              isRepeatScreen
                ? 'Insert again the numeric password.\n' +
                  'It must match the previous entry'
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
                  <span>
                    I agree with the <a href="/terms">Terms and Conditions</a>
                  </span>
                }
              />
              <IonRow className="ion-margin-vertical-x2">
                <IonCol size="8" offset="2">
                  <IonButton
                    className="main-button"
                    disabled={!isTermsAccepted}
                    onClick={() => {
                      if (isPinValidated && isTermsAccepted) {
                        setLoading(true);
                        dispatch(signIn(firstPin));
                        setIsWrongPin(null);
                        history.push('/wallet');
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
