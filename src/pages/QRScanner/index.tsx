import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Capacitor } from '@capacitor/core';
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonPage,
  IonRow,
  useIonViewDidEnter,
  useIonViewWillLeave,
} from '@ionic/react';
import React from 'react';
import { useDispatch } from 'react-redux';
import type { RouteComponentProps } from 'react-router';
import { useParams, withRouter } from 'react-router';

import Header from '../../components/Header';
import { addErrorToast, addSuccessToast } from '../../redux/actions/toastActions';
import { QRCodeScanError } from '../../utils/errors';
import './style.scss';

const QRCodeScanner: React.FC<RouteComponentProps<any, any, { address: string; amount: number }>> = ({
  history,
  location,
}) => {
  const dispatch = useDispatch();
  const { asset_id } = useParams<{ asset_id: string }>();

  const stopScan = async () => {
    document.body.classList.remove('bg-transparent');
    if (Capacitor.isPluginAvailable('BarcodeScanner') && Capacitor.isNativePlatform()) {
      try {
        await BarcodeScanner.showBackground();
        await BarcodeScanner.stopScan();
      } catch (err) {
        console.error(err);
      }
    }
  };

  useIonViewDidEnter(async () => {
    if (Capacitor.isPluginAvailable('BarcodeScanner') && Capacitor.isNativePlatform()) {
      try {
        await BarcodeScanner.hideBackground();
        document.body.classList.add('bg-transparent');
        const granted = await BarcodeScanner.checkPermission({ force: true });
        if (!granted) throw new Error('CAMERA permission not granted.');
        const result = await BarcodeScanner.startScan();
        if (result.hasContent && result.content) {
          console.debug('scanned: ', result.content);
          history.replace(`/withdraw/${asset_id}`, {
            address: result.content,
            amount: location.state.amount,
          });
          dispatch(addSuccessToast('Address scanned!'));
        }
        await stopScan();
      } catch (err) {
        console.error(err);
        dispatch(addErrorToast(QRCodeScanError));
      }
    }
  });

  useIonViewWillLeave(async () => {
    await stopScan();
  });

  return (
    <IonPage id="qr-scanner">
      <IonContent>
        <Header title="SCAN QR CODE" hasBackButton={false} hasCloseButton={false} />
        <IonGrid>
          <IonRow className="ion-margin-vertical-x2">
            <IonCol>
              <div className="scan-box" />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="8" offset="2">
              <IonButton
                onClick={() =>
                  history.replace(`/withdraw/${asset_id}`, {
                    ...location.state,
                    amount: location.state.amount,
                  })
                }
                className="sub-button"
              >
                CLOSE
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(QRCodeScanner);
