import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonPage,
  IonRow,
} from '@ionic/react';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import type { RouteComponentProps } from 'react-router';
import { useLocation } from 'react-router';

import Header from '../../components/Header';
import PageDescription from '../../components/PageDescription';
import { resetAll } from '../../redux/actions/rootActions';
import { removeMnemonicFromSecureStorage } from '../../utils/storage-helper';

interface LocationState {
  pin: string;
}

const DeleteMnemonic: React.FC<RouteComponentProps> = ({ history }) => {
  const { state } = useLocation<LocationState>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const dispatch = useDispatch();

  const deleteMnemonic = async () => {
    setIsLoading(true);
    const success = await removeMnemonicFromSecureStorage(state?.pin);
    if (!success) {
      setErrorMsg(
        'Error: your key has not been deleted. Please contact support.',
      );
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    dispatch(resetAll());
    history.replace('/homescreen');
  };

  return (
    <IonPage id="delete-menemonic">
      <IonContent>
        <IonGrid>
          <Header hasBackButton={true} title="CLEAR MY KEY" />
          <PageDescription
            description='Clicking on "Delete" will delete your mnemonic on this device. Be sure to back it up!'
            title="Delete your mnemonic"
          />
          <IonRow className="ion-margin-vertical-x2">
            <IonCol size="9" offset="1.5" sizeMd="8" offsetMd="2">
              <IonButton
                onClick={deleteMnemonic}
                disabled={isLoading}
                className="main-button"
              >
                Delete
              </IonButton>
            </IonCol>
          </IonRow>
          {errorMsg !== '' && <p>{errorMsg}</p>}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default DeleteMnemonic;
