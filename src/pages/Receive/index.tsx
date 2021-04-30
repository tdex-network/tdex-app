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
  IonLoading,
  IonButtons,
  IonBackButton,
} from '@ionic/react';
import React, { useEffect, useRef, useState } from 'react';
import { withRouter, RouteComponentProps, useLocation } from 'react-router';
import { IconCopy, CurrencyIcon } from '../../components/icons';
import PageDescription from '../../components/PageDescription';
import './style.scss';
import { useDispatch, useSelector } from 'react-redux';
import { Clipboard } from '@ionic-native/clipboard';
import { QRCodeImg } from '@cheprasov/react-qrcode';
import { checkmarkOutline, chevronBackOutline } from 'ionicons/icons';
import {
  AddressInterface,
  IdentityOpts,
  IdentityType,
  MasterPublicKey,
} from 'ldk';
import {
  addErrorToast,
  addSuccessToast,
} from '../../redux/actions/toastActions';
import { WalletState } from '../../redux/reducers/walletReducer';
import { network } from '../../redux/config';
import { IdentityRestorerFromState } from '../../utils/identity';
import { addAddress } from '../../redux/actions/walletActions';
import { AssetWithTicker } from '../../utils/tdex';
import { AddressGenerationError } from '../../utils/errors';

interface LocationState {
  depositAsset: AssetWithTicker;
}

const Receive: React.FC<RouteComponentProps> = ({ history }) => {
  const [copied, setCopied] = useState(false);
  const [address, setAddress] = useState<AddressInterface>();
  const [loading, setLoading] = useState(false);
  const addressRef: any = useRef(null);
  const dispatch = useDispatch();
  const { state } = useLocation<LocationState>();
  // Hack to prevent undefined state when hitting back button
  const [locationState] = useState(state);

  // select data for MasterPubKey identity
  const masterPubKeyOpts: IdentityOpts = useSelector(
    ({ wallet }: { wallet: WalletState }) => {
      return {
        chain: network.chain,
        type: IdentityType.MasterPublicKey,
        value: {
          masterBlindingKey: wallet.masterBlindKey,
          masterPublicKey: wallet.masterPubKey,
        },
        initializeFromRestorer: true,
        restorer: new IdentityRestorerFromState(
          Object.values(wallet.addresses)
        ),
      };
    }
  );

  useEffect(() => {
    generateAndSetAddress();
  }, []);

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
          if (addressRef && addressRef.current) {
            addressRef.current.select();
            document.execCommand('copy');
            setCopied(true);
            dispatch(addSuccessToast('Address copied.'));
            setTimeout(() => {
              setCopied(false);
            }, 10000);
          }
        });
    }
  };

  const generateAndSetAddress = async () => {
    try {
      setLoading(true);
      const masterPublicKey: MasterPublicKey = new MasterPublicKey(
        masterPubKeyOpts
      );
      await masterPublicKey.isRestored;
      const addr = await masterPublicKey.getNextAddress();
      dispatch(addAddress(addr));
      dispatch(addSuccessToast('New address added to your account.'));
      setAddress(addr);
    } catch (e) {
      console.error(e);
      dispatch(addErrorToast(AddressGenerationError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonLoading isOpen={loading} />
      <div className="gradient-background" />
      <IonHeader className="ion-no-border">
        <IonToolbar className="with-back-button">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" text="" icon={chevronBackOutline} />
          </IonButtons>
          <IonTitle>Receive</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="receive">
        <div className="description-with-icon">
          <div className="img-wrapper">
            <CurrencyIcon
              currency={locationState.depositAsset.ticker}
              width="48px"
              height="48px"
            />
          </div>
          <PageDescription
            align="left"
            title={`Your ${locationState.depositAsset.ticker} address`}
          >
            <p>
              {`To provide this address to the person sending you ${
                locationState.depositAsset.coinGeckoID ||
                locationState.depositAsset.ticker
              } simply tap to copy it or scan your
              wallet QR code with their device.`}
            </p>
          </PageDescription>
        </div>
        {address ? (
          <div>
            <input
              readOnly
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
