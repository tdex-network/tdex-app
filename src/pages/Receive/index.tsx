import {
  IonPage,
  IonContent,
  IonItem,
  IonIcon,
  IonLoading,
  IonGrid,
} from '@ionic/react';
import React, { useEffect, useRef, useState } from 'react';
import { withRouter, useLocation } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { Clipboard } from '@ionic-native/clipboard';
import { QRCodeImg } from '@cheprasov/react-qrcode';
import { checkmarkOutline } from 'ionicons/icons';
import {
  IdentityOpts,
  IdentityType,
  MasterPublicKey,
  address as addressLDK,
} from 'ldk';
import ElementsPegin from 'pegin';
import {
  addErrorToast,
  addSuccessToast,
} from '../../redux/actions/toastActions';
import { WalletState } from '../../redux/reducers/walletReducer';
import { network } from '../../redux/config';
import { addAddress } from '../../redux/actions/walletActions';
import { AddressGenerationError } from '../../utils/errors';
import { AssetConfig, BTC_TICKER } from '../../utils/constants';
import { IdentityRestorerFromState } from '../../utils/identity';
import Header from '../../components/Header';
import { IconCopy, CurrencyIcon } from '../../components/icons';
import PageDescription from '../../components/PageDescription';
import './style.scss';

interface LocationState {
  depositAsset: AssetConfig;
}

const Receive: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [address, setAddress] = useState<string>();
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
    generateAndSetAddress().catch(console.error);
  }, []);

  const copyAddress = () => {
    if (address) {
      Clipboard.copy(address)
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
      if (locationState.depositAsset.ticker === BTC_TICKER) {
        const peginModule = new ElementsPegin(
          await ElementsPegin.withGoElements(),
          await ElementsPegin.withLibwally()
        );
        const btcAddress = await peginModule.getMainchainAddress(
          addressLDK.toOutputScript(addr.confidentialAddress).toString('hex')
        );
        setAddress(btcAddress);
      } else {
        dispatch(addAddress(addr));
        dispatch(addSuccessToast('New address added to your account.'));
        setAddress(addr.confidentialAddress);
      }
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
      <IonContent className="receive">
        <IonGrid>
          <Header
            hasBackButton={true}
            title={`${
              locationState.depositAsset.name?.toUpperCase() ?? ''
            } DEPOSIT`}
          />
          <div className="ion-text-center">
            <CurrencyIcon
              currency={locationState.depositAsset.ticker}
              width="48"
              height="48"
            />
          </div>
          {locationState.depositAsset.ticker === BTC_TICKER ? (
            <PageDescription
              description="Send any amount of Bitcoin to receive Liquid Bitcoin."
              title={`Your Bitcoin Pegin address`}
            />
          ) : (
            <PageDescription
              description={`To provide this address to the person sending you ${
                locationState.depositAsset.name ||
                locationState.depositAsset.coinGeckoID ||
                locationState.depositAsset.ticker
              } simply tap to copy it or scan your
              wallet QR code with their device.`}
              title={`Your ${locationState.depositAsset.ticker} address`}
            />
          )}
          {address && (
            <div>
              <input
                readOnly
                type="text"
                ref={addressRef}
                value={address}
                className="hidden-input"
              />
              <IonItem>
                <div className="item-main-info">
                  <div className="item-start conf-addr">{address}</div>
                  <div className="copy-icon" onClick={copyAddress}>
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
                <QRCodeImg value={address} size={192} />
              </div>
            </div>
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Receive);
