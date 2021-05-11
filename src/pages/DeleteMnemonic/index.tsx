import React, { useState } from 'react';
import { RouteComponentProps, useLocation } from 'react-router';
import { useDispatch } from 'react-redux';
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonPage,
  IonRow,
} from '@ionic/react';
import Header from '../../components/Header';
import PageDescription from '../../components/PageDescription';
import { removeMnemonicFromSecureStorage } from '../../utils/storage-helper';
import { setSignedUp } from '../../redux/actions/appActions';
import { setIsAuth } from '../../redux/actions/walletActions';

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
        'Error: your key has not been deleted. Please contact support.'
      );
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    dispatch(setSignedUp(false));
    dispatch(setIsAuth(false));
    history.replace('/homescreen');
  };

  return (
    <IonPage id="delete-menemonic">
      <IonContent>
        <Header hasBackButton={true} title="CLEAR MY KEY" />
        <IonGrid>
          <PageDescription
            description='Clicking on "Delete" will delete your mnemonic on this device. Be sure to back it up!'
            title="Delete your mnemonic"
          />
          <IonRow className="ion-margin-vertical-x2">
            <IonCol size="10" offset="1" sizeMd="8" offsetMd="2">
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
