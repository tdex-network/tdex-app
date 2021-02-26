import {
  IonPage,
  IonTitle,
  IonContent,
  IonItem,
  IonButton,
  IonToolbar,
  IonHeader,
  IonIcon,
  IonSpinner,
} from '@ionic/react';
import React, { useRef, useState } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { IconBack, IconBTC, IconCopy } from '../../components/icons';
import PageDescription from '../../components/PageDescription';
import './style.scss';
import { useDispatch } from 'react-redux';
import { Clipboard } from '@ionic-native/clipboard';
import { QRCodeImg } from '@cheprasov/react-qrcode';
import { checkmarkOutline } from 'ionicons/icons';
import { setAddresses } from '../../redux/actions/walletActions';
import { Mnemonic, AddressInterface } from 'ldk';
import { getIdentity } from '../../utils/storage-helper';
import PinModal from '../../components/PinModal';
import {
  addErrorToast,
  addSuccessToast,
} from '../../redux/actions/toastActions';

const Receive: React.FC<RouteComponentProps> = ({ history }) => {
  const [copied, setCopied] = useState(false);
  const [address, setAddress] = useState<AddressInterface>();
  const [modalOpen, setModalOpen] = useState(true);
  const [pinError, setPinError] = useState<string>();
  const addressRef: any = useRef(null);
  const dispatch = useDispatch();

  const copyAddress = () => {
    if (address) {
      Clipboard.copy(address.confidentialAddress)
        .then((res: any) => {
          setCopied(true);
          dispatch(addSuccessToast('Address copied.'));
          setTimeout(() => {
            setCopied(false);
          }, 5000);
        })
        .catch((e: any) => {
          addressRef.current.select();
          document.execCommand('copy');
          setCopied(true);
          dispatch(addSuccessToast('Address copied.'));
          setTimeout(() => {
            setCopied(false);
          }, 10000);
        });
    }
  };

  const onPinConfirm = (pin: string) => {
    getIdentity(pin)
      .then((identity: Mnemonic) => {
        setModalOpen(false);
        identity.isRestored.then(() => {
          setAddress(identity.getNextAddress());
          dispatch(setAddresses(identity.getAddresses()));
          dispatch(addSuccessToast('New address added to your account.'));
        });
      })
      .catch((e) => {
        setPinError(e);
        console.error(e);
        dispatch(addErrorToast('Error during address generation.'));
        setModalOpen(true);
      });
  };

  return (
    <IonPage>
      <PinModal
        error={pinError}
        onReset={() => setPinError(undefined)}
        open={modalOpen}
        title="Unlock your seed"
        description={`Enter your secret PIN.`}
        onConfirm={onPinConfirm}
        onClose={
          address
            ? () => {
                setModalOpen(false);
              }
            : undefined
        }
      />
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
        {address ? (
          <div>
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
              <QRCodeImg value={address.confidentialAddress} size={192} />
            </div>{' '}
          </div>
        ) : (
          <div className="align-center">
            <IonSpinner name="crescent" color="primary" />
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Receive);
