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
} from '@ionic/react';
import { IconBack, IconCheck } from '../../components/icons';
import { useDispatch, useSelector } from 'react-redux';
import { setIsAuth, setMnemonic } from '../../redux/actions/walletActions';
import { Storage } from '@capacitor/core';

interface LoginInterface {
  setup?: boolean;
}

const Login: React.FC<LoginInterface & RouteComponentProps> = ({
  history,
  setup = false,
}) => {
  const dispatch = useDispatch();
  const mnemonic = useSelector((state: any) => state.wallet.mnemonic);
  const [inputValue, setValue] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [error, setError] = useState('');

  const inputRef: any = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  });

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

  const getWallet = async (): Promise<{ value: string }> => {
    return Storage.get({ key: 'wallet' });
  };

  const onConfirm = async () => {
    if (!firstPin && setup) {
      setFirstPin(inputValue);
      setValue('');
    } else if (firstPin) {
      if (firstPin === inputValue) {
        Storage.set({
          key: 'wallet',
          value: JSON.stringify({
            pin: inputValue,
            mnemonic,
          }),
        }).then(() => {
          dispatch(setIsAuth(true));
          history.replace('/');
        });
      } else {
        setError('Wrong pin');
      }
    } else {
      const wallet: { value: string } = await getWallet();
      const walletObj = JSON.parse(wallet.value);
      if (walletObj && inputValue === walletObj.pin) {
        dispatch(setMnemonic(walletObj.mnemonic));
        dispatch(setIsAuth(true));
        history.replace('/');
      } else {
        setError('Wrong pin');
      }
    }
  };

  return (
    <IonPage>
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
            ></input>
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
