import './style.scss';
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
import Decimal from 'decimal.js';
import React from 'react';
import { useDispatch } from 'react-redux';
import type { RouteComponentProps } from 'react-router';
import { useLocation, useParams, withRouter } from 'react-router';
import type { NetworkString } from 'tdex-sdk';

import Header from '../../components/Header';
import { addErrorToast, addSuccessToast } from '../../redux/actions/toastActions';
import { decodeBip21 } from '../../utils/bip21';
import type { LbtcDenomination } from '../../utils/constants';
import { QRCodeScanError } from '../../utils/errors';
import { isLbtc, fromLbtcToUnit } from '../../utils/helpers';

interface LocationState {
  address: string;
  amount: string;
  lbtcUnit: LbtcDenomination;
  precision: number;
  network: NetworkString;
}

const QRCodeScanner = ({ history }: RouteComponentProps): JSX.Element => {
  const dispatch = useDispatch();
  const { state } = useLocation<LocationState>();
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
          if (result.content.startsWith('liquidnetwork')) {
            const { address, options } = decodeBip21(result.content, 'liquidnetwork');
            // Treat the amount as in btc unit
            // Convert to user favorite unit, taking into account asset precision
            const unit = isLbtc((options?.assetid ?? asset_id) as string, state.network) ? state.lbtcUnit : undefined;
            // If no amount in URI return amount from input field
            const amtConverted = options?.amount
              ? fromLbtcToUnit(new Decimal(options?.amount as string), unit, state?.precision).toString()
              : state.amount;
            history.replace(`/withdraw/${options?.assetid ?? asset_id}`, {
              address,
              amount: amtConverted,
            });
          } else {
            history.replace(`/withdraw/${asset_id}`, {
              address: result.content,
              amount: state.amount,
            });
          }
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
                    ...state,
                    amount: state.amount,
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
