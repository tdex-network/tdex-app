import {
  IonPage,
  IonTitle,
  IonContent,
  IonItem,
  IonButton,
  IonToolbar,
  IonHeader,
  IonIcon,
  useIonViewWillEnter,
} from '@ionic/react';
import React, { useEffect, useRef, useState } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { IconBack, IconBTC, IconCopy } from '../../components/icons';
import PageDescription from '../../components/PageDescription';
import './style.scss';
import { useDispatch } from 'react-redux';
import { Clipboard } from '@ionic-native/clipboard';
import { QRCodeImg } from '@cheprasov/react-qrcode';
import { checkmarkOutline } from 'ionicons/icons';
import { getIdentity } from '../../redux/services/walletService';
import { setAddresses } from '../../redux/actions/walletActions';
import { Mnemonic } from 'ldk';
import { AddressInterface } from 'tdex-sdk';

const Receive: React.FC<RouteComponentProps> = ({ history }) => {
  const [copied, setCopied] = useState(false);
  const [address, setAddress] = useState<AddressInterface>();
  const addressRef: any = useRef(null);
  const dispatch = useDispatch();

  useIonViewWillEnter(() => {
    getIdentity().then((identity: Mnemonic) => {
      identity.isRestored.then(() => {
        setAddress(identity.getNextAddress());
        dispatch(setAddresses(identity.getAddresses()));
      });
    });
  });

  const copyAddress = () => {
    if (address) {
      Clipboard.copy(address.confidentialAddress)
        .then((res: any) => {
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
          }, 5000);
        })
        .catch((e: any) => {
          addressRef.current.select();
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
          }, 10000);
        });
    }
  };

  return (
    <IonPage>
      <div className="gradient-background"></div>
      <IonHeader>
        <IonToolbar className="with-back-button">
          <IonButton
            style={{ zIndex: 10 }}
            onClick={() => {
              history.goBack();
            }}
          >
            <IconBack />
          </IonButton>
          <IonTitle>Receive</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="receive">
        <div className="description-with-icon">
          <div className="img-wrapper">
            <IconBTC width="48px" height="48px" />
          </div>
          <PageDescription align="left" title="Your BTC address">
            <p>
              To provide this address to the person sending you Bitcoin simply
              tap to copy it or scan your wallet QR code with their device.
            </p>
          </PageDescription>
        </div>
        <input
          type="text"
          ref={addressRef}
          value={address?.confidentialAddress}
          className="hidden-input"
        />
        <IonItem>
          <div className="item-main-info">
            <div className="item-start conf-addr">
              {address?.confidentialAddress}
            </div>
            <div
              className="icon-wrapper copy-icon"
              onClick={() => copyAddress()}
            >
              {copied ? (
                <IonIcon
                  className="copied-icon"
                  color="success"
                  icon={checkmarkOutline}
                />
              ) : (
                <IconCopy
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="#fff"
                />
              )}
            </div>
          </div>
        </IonItem>
        <div className="qr-code-container">
          {address && (
            <QRCodeImg value={address.confidentialAddress} size={192} />
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Receive);
