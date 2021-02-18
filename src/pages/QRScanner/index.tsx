import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewDidEnter,
  useIonViewDidLeave,
} from '@ionic/react';
import React from 'react';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';

//style
import './style.scss';
import { useDispatch } from 'react-redux';
import { withRouter } from 'react-router';

const QRCodeScanner: React.FC<any> = ({ history }: any) => {
  const dispatch = useDispatch();
  const scanner = QRScanner;

  useIonViewDidEnter(() => {
    QRScanner.prepare()
      .then((status: QRScannerStatus) => {
        if (status.authorized) {
          QRScanner.show();
          const scanSub = QRScanner.scan().subscribe((text: string) => {
            scanSub.unsubscribe(); // stop scanning
            history.goBack();
          });
        } else if (status.denied) {
          scanner.openSettings();
        } else {
          scanner.openSettings();
        }
      })
      .catch((e: any) => {
        console.log('Error is', e);
        QRScanner.hide();
      });
  });

  useIonViewDidLeave(() => {
    QRScanner.hide();
    QRScanner.destroy();
  });

  return (
    <IonPage>
      <IonHeader className="semitransparent">
        <IonToolbar className="with-back-button">
          <IonTitle>SCAN QR CODE</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="qr-scanner">
        <div className="rect">
          <div className="rect-border" />
        </div>
        <IonButton onClick={() => history.goBack()} className="cancel-btn">
          CLOSE
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(QRCodeScanner);
