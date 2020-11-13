import React, { ChangeEvent, useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonButton,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { RouteComponentProps, withRouter } from 'react-router';
import PageDescription from '../../components/PageDescription';

import classNames from 'classnames';

import { IconBack, IconWarning } from '../../components/icons';

import './style.scss';
import { useMnemonic } from '../../utils/custom-hooks';
import { useDispatch } from 'react-redux';
import { setMnemonic } from '../../redux/actions/walletActions';
// import { Mnemonic, IdentityType } from 'tdex-sdk';

const RestoreWallet: React.FC<RouteComponentProps> = ({ history }) => {
  const [mnemonic, setMnemonicWord] = useMnemonic();
  const [isEmpty, setIsEmpty] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const filledMnemonic = mnemonic.filter((item: string) => item);
    const isMnemonicFilled = filledMnemonic.length === 12;
    setIsEmpty(!isMnemonicFilled);
  }, [mnemonic]);

  const handleConfirm = () => {
    dispatch(setMnemonic(mnemonic.join(' ')));
    history.push('/setup');
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
