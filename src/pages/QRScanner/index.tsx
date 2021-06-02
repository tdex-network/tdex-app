import { Plugins } from '@capacitor/core';
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
import {
  addErrorToast,
  addSuccessToast,
} from '../../redux/actions/toastActions';
import { QRCodeScanError } from '../../utils/errors';
import './style.scss';

const { BarcodeScanner } = Plugins;

const QRCodeScanner: React.FC<
  RouteComponentProps<any, any, { address: string; amount: number }>
> = ({ history, location }) => {
  const dispatch = useDispatch();
  const { asset_id } = useParams<{ asset_id: string }>();

  const stopScan = () => {
    document.body.classList.remove('bg-transparent');
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
  };

  useIonViewDidEnter(() => {
    BarcodeScanner.hideBackground();
    document.body.classList.add('bg-transparent');
    BarcodeScanner.checkPermission({ force: true })
      .then(({ granted }: { granted: boolean }) => {
        if (!granted) throw new Error('CAMERA permission not granted.');
        BarcodeScanner.startScan().then((result: any) => {
          if (result.hasContent) {
            console.debug('scanned: ', result.content);
            history.replace(`/withdraw/${asset_id}`, {
              address: result.content,
              amount: location.state.amount,
            });
            dispatch(addSuccessToast('Address scanned!'));
            stopScan();
          }
        });
      })
      .catch((e: any) => {
        console.error(e);
        dispatch(addErrorToast(QRCodeScanError));
      });
  });

  useIonViewWillLeave(() => {
    stopScan();
  });

  return (
    <IonPage id="qr-scanner">
      <IonContent>
        <Header
          title="SCAN QR CODE"
          hasBackButton={false}
          hasCloseButton={false}
        />
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
