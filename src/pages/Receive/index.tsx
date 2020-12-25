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
import React, { useRef, useState } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { IconBack, IconBTC, IconCopy } from '../../components/icons';
import PageDescription from '../../components/PageDescription';
import './style.scss';
import { useSelector, useDispatch } from 'react-redux';
import { Clipboard } from '@ionic-native/clipboard';
import { QRCodeImg } from '@cheprasov/react-qrcode';
import { checkmarkOutline } from 'ionicons/icons';
import { storageAddresses } from '../../utils/storage-helper';
import { setAddresses } from '../../redux/actions/walletActions';
import { getIdentity } from '../../redux/services/walletService';

const Receive: React.FC<RouteComponentProps> = ({ history }) => {
  const { mnemonic, addresses } = useSelector((state: any) => ({
    mnemonic: state.wallet.mnemonic,
    addresses: state.wallet.addresses,
  }));

  const identity = getIdentity(mnemonic, addresses);
  const [copied, setCopied] = useState(false);
  const [address, setAddress] = useState<any>();
  const addressRef: any = useRef(null);
  const dispatch = useDispatch();

  useIonViewWillEnter(() => {
    const nextAddress = identity.getNextAddress();
    setAddress(nextAddress);
    const data = [...addresses, nextAddress];
    storageAddresses(data).then(() => {
      dispatch(setAddresses(data));
    });
  });

  const copyAddress = () => {
    if (addressRef) {
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
