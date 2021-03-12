import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewDidEnter,
  useIonViewWillLeave,
} from '@ionic/react';
import React from 'react';
import { Plugins } from '@capacitor/core';
import { useDispatch } from 'react-redux';
import {
  addErrorToast,
  addSuccessToast,
} from '../../redux/actions/toastActions';
import { RouteComponentProps, useParams, withRouter } from 'react-router';

import './style.scss';

const { BarcodeScanner } = Plugins;

const QRCodeScanner: React.FC<
  RouteComponentProps<any, any, { address: string; amount: number }>
> = ({ history, location }) => {
  const dispatch = useDispatch();
  // route parameter asset_id
  const { asset_id } = useParams<{ asset_id: string }>();

  const stopScan = () => {
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
  };

  useIonViewDidEnter(() => {
    BarcodeScanner.hideBackground();
    BarcodeScanner.startScan()
      .then((result: any) => {
        if (result.hasContent) {
          console.debug('scanned: ', result.content);
          history.replace(`/withdraw/${asset_id}`, {
            address: result.content,
            amount: location.state.amount,
          });
          dispatch(addSuccessToast('Address scanned!'));
          stopScan();
        }
      })
      .catch((e: any) => {
        console.error(e);
        dispatch(addErrorToast(e));
      });
  });

  useIonViewWillLeave(() => {
    stopScan();
  });

  return (
    <IonPage>
      <IonHeader className="semitransparent">
        <IonToolbar className="with-back-button">
          <IonTitle>SCAN QR CODE</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="content">
        <div className="qr-scanner">
          <div className="rect">
            <div className="rect-border" />
          </div>
          <div className="btn-container">
            <IonButton
              onClick={() =>
                history.replace(`/withdraw/${asset_id}`, {
                  ...location.state,
                  amount: location.state.amount,
                })
              }
              className="cancel-btn"
            >
              CLOSE
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(QRCodeScanner);
