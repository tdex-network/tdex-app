import React, { useState } from 'react';
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

const RestoreWallet: React.FC<RouteComponentProps> = ({ history }) => {
  const [words, setWords] = useState(new Array(12).fill(null));

  const handleChangeInput = (e: any, index: number) => {
    const { value } = e.target;

    const copy = words;
    copy[index] = value;
    console.log(words);
    setWords(copy);
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
      <IonContent>
        <PageDescription title="RestoreWallet">
          <p>Paste your 12-word recovery phrase in the correct order</p>
        </PageDescription>

        <div className="restore-input-wrapper">
          {[...new Array(12).fill(1)].map((item, index) => {
            return (
              <label
                className={classNames('restore-input', {
                  active: words[index],
                })}
              >
                <div className="input-number">{index + 1}</div>
                <input
                  onChange={(e) => handleChangeInput(e, index)}
                  type="text"
                ></input>
              </label>
            );
          })}
        </div>

        <div className="warning-message">
          <div className="warning-icon">
            <IconWarning />
          </div>
          <p className="warning">
            Write your secret phrase and store it in a safe place such as safe
            deposit box
          </p>
        </div>
        <div className="buttons restore">
          <IonButton disabled={true} className="main-button">
            Confirm
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(RestoreWallet);
