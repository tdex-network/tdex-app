import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { RouteComponentProps, withRouter } from 'react-router';
import PageDescription from '../../components/PageDescription';
import PinInput from '../../components/PinInput';
import './style.scss';
import {
  IonContent,
  IonHeader,
  IonButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonLoading,
} from '@ionic/react';
import { IconBack, IconCheck } from '../../components/icons';
import { useDispatch, useSelector } from 'react-redux';
import { Storage } from '@capacitor/core';
import * as bip39 from 'bip39';
import { signIn } from '../../redux/actions/appActions';
import { encrypt } from '../../utils/crypto';

interface LoginInterface {
  setup?: boolean;
}

const Login: React.FC<LoginInterface & RouteComponentProps> = ({
  history,
  setup = false,
}) => {
  const dispatch = useDispatch();
  const { mnemonic, isAuth } = useSelector((state: any) => ({
    mnemonic: state.wallet.mnemonic,
    isAuth: state.wallet.isAuth,
  }));
  const [inputValue, setValue] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [isStateAuth, setIsStateAuth] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [error, setError] = useState('');

  const inputRef: any = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  });

  useEffect(() => {
    if (isAuth && !isStateAuth) {
      setIsStateAuth(true);
      history.push('/wallet');
    }
  }, [isAuth]);

  useEffect(() => {
    setDisabled(
      !!(
        error ||
        inputValue.length < 6 ||
        (firstPin && (!acceptTerms || firstPin !== inputValue))
      )
    );
  }, [inputValue, acceptTerms, firstPin, error]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    value.length <= 6 && setValue(value);
    error && setError('');
  };

  const storeMnemonic = (mnemonicStr: string) => {
    Storage.set({
      key: 'wallet',
      value: JSON.stringify({
        mnemonic: encrypt(mnemonicStr, inputValue),
      }),
    }).then(() => {
      dispatch(signIn(inputValue));
    });
  };

  const onConfirm = async () => {
    if (!firstPin) {
      setFirstPin(inputValue);
      setValue('');
    } else if (firstPin) {
      if (firstPin === inputValue) {
        if (!mnemonic) {
          const newMnemonic = bip39.generateMnemonic();
          storeMnemonic(newMnemonic);
        } else {
          storeMnemonic(mnemonic);
        }
      } else {
        setError('Wrong pin');
      }
    }
  };

  return (
    <IonPage>
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
        {!firstPin ? (
          <PageDescription title="Set security PIN">
            <p className="task-description">
              Your password must be 6 character long and must be set with only
              numbers
            </p>
          </PageDescription>
        ) : (
          <PageDescription title="Repeat PIN">
            <p className="task-description">
              Insert again the numeric password, it must match the previous
              entry
            </p>
          </PageDescription>
        )}

        <PinInput
          inputRef={inputRef}
          onChange={onChange}
          inputValue={inputValue}
          error={error}
        />

        {firstPin && (
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
        )}

        <div className="buttons login">
          <IonButton
            className={classNames('main-button', {
              secondary: disabled,
            })}
            disabled={disabled}
            onClick={onConfirm}
          >
            Confirm
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Login);
