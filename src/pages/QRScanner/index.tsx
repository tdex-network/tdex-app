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
import { RouteComponentProps, useParams, withRouter } from 'react-router';
import { Plugins } from '@capacitor/core';
import { useDispatch } from 'react-redux';
import {
  addErrorToast,
  addSuccessToast,
} from '../../redux/actions/toastActions';
import { QRCodeScanError } from '../../utils/errors';
import Header from '../../components/Header';
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
    document.body.style.background = 'transparent';
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
    <IonPage>
      <IonContent className="content">
        <Header
          title="SCAN QR CODE"
          hasBackButton={false}
          hasCloseButton={false}
        />
        <IonGrid>
          <IonRow>
            <IonCol size="10" offset="1">
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
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(QRCodeScanner);
