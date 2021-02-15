import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { RouteComponentProps, withRouter } from 'react-router';
import PageDescription from '../../components/PageDescription';
import './style.scss';
import {
  IonContent,
  IonHeader,
  IonButton,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewDidEnter,
} from '@ionic/react';
import { IconBack, IconCheck } from '../../components/icons';
import { useDispatch, useSelector } from 'react-redux';
import * as bip39 from 'bip39';
import { signIn } from '../../redux/actions/appActions';
import { setMnemonicInSecureStorage } from '../../utils/storage-helper';

const Login: React.FC<RouteComponentProps> = ({ history }) => {
  const dispatch = useDispatch();
  const { mnemonic, isAuth } = useSelector((state: any) => ({
    mnemonic: state.wallet.mnemonic,
    isAuth: state.wallet.isAuth,
  }));
  const [isStateAuth, setIsStateAuth] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const inputRef: any = useRef(null);

  useIonViewDidEnter(() => {
    inputRef?.current?.focus();
  });

  useEffect(() => {
    if (isAuth && !isStateAuth) {
      setIsStateAuth(true);
      history.push('/wallet');
    }
  }, [isAuth]);

  const storeMnemonic = (mnemonicStr: string) => {
    setMnemonicInSecureStorage(mnemonicStr).then(() => {
      dispatch(signIn());
    });
  };

  const onConfirm = async () => {
    if (!mnemonic) {
      const newMnemonic = bip39.generateMnemonic();
      storeMnemonic(newMnemonic);
    } else {
      storeMnemonic(mnemonic);
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
        <PageDescription title="Set security PIN">
          <p className="task-description">
            Clicking on generate will randomly create a mnemonic of 12 words. It
            will be used as the seed of your wallet and will be stored in the
            secure storage of your device.
          </p>
        </PageDescription>
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

        <div className="buttons login">
          <IonButton
            className={classNames('main-button', {
              secondary: !acceptTerms,
            })}
            disabled={!acceptTerms}
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
