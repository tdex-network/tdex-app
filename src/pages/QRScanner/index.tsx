import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';

//style
import './style.scss';
import { useDispatch } from 'react-redux';
import { setQRCodeAddress } from '../../redux/actions/transactionsActions';
import { withRouter } from 'react-router';

const QRCodeScanner: React.FC<any> = ({ history }: any) => {
  const dispatch = useDispatch();
  const [withBg, setWithBg] = useState(true);
  const scanner = QRScanner;

  useEffect(() => {
    QRScanner.prepare()
      .then((status: QRScannerStatus) => {
        if (status.authorized) {
          setWithBg(false);
          QRScanner.show();
          const scanSub = QRScanner.scan().subscribe((text: string) => {
            setWithBg(true);
            dispatch(setQRCodeAddress(text));
            QRScanner.hide(); // hide camera preview
            QRScanner.destroy(); // hide camera preview
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
  }, []);

  return (
    <IonPage>
      {withBg && <div className="gradient-background" />}
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
