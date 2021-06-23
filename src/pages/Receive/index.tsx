import { QRCodeImg } from '@cheprasov/react-qrcode';
import { Clipboard } from '@ionic-native/clipboard';
import {
  IonPage,
  IonContent,
  IonItem,
  IonIcon,
  IonLoading,
  IonGrid,
  useIonViewWillEnter,
  useIonViewWillLeave,
} from '@ionic/react';
import { checkmarkOutline } from 'ionicons/icons';
import type { AddressInterface, IdentityOpts } from 'ldk';
import { IdentityType, MasterPublicKey } from 'ldk';
import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { withRouter, useLocation } from 'react-router';
import type { MasterPublicKeyOpts } from 'tdex-sdk';
import { masterPubKeyRestorerFromState } from 'tdex-sdk';

import Header from '../../components/Header';
import PageDescription from '../../components/PageDescription';
import { IconCopy, CurrencyIcon } from '../../components/icons';
import {
  addErrorToast,
  addSuccessToast,
} from '../../redux/actions/toastActions';
import { addAddress } from '../../redux/actions/walletActions';
import { network } from '../../redux/config';
import type { WalletState } from '../../redux/reducers/walletReducer';
import { lastUsedIndexesSelector } from '../../redux/selectors/walletSelectors';
import type { AssetConfig } from '../../utils/constants';
import { AddressGenerationError } from '../../utils/errors';
import './style.scss';

interface LocationState {
  depositAsset: AssetConfig;
}

const Receive: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [address, setAddress] = useState<AddressInterface>();
  const [loading, setLoading] = useState(false);
  const addressRef: any = useRef(null);
  const dispatch = useDispatch();
  const { state } = useLocation<LocationState>();
  // Hack to prevent undefined state when hitting back button
  const [locationState] = useState(state);

  // select data for MasterPubKey identity
  const masterPubKeyOpts: IdentityOpts<MasterPublicKeyOpts> = useSelector(
    ({ wallet }: { wallet: WalletState }) => {
      return {
        chain: network.chain,
        type: IdentityType.MasterPublicKey,
        opts: {
          masterBlindingKey: wallet.masterBlindKey,
          masterPublicKey: wallet.masterPubKey,
        },
      };
    },
  );

  const lastUsedIndexes = useSelector(lastUsedIndexesSelector);

  useIonViewWillEnter(async () => {
    try {
      setLoading(true);
      const masterPublicKey: MasterPublicKey = new MasterPublicKey(
        masterPubKeyOpts,
      );
      const restoredMasterPubKey = await masterPubKeyRestorerFromState(
        masterPublicKey,
      )(lastUsedIndexes);
      const addr = await restoredMasterPubKey.getNextAddress();
      dispatch(addAddress(addr));
      dispatch(addSuccessToast('New address added to your account.'));
      setAddress(addr);
    } catch (e) {
      console.error(e);
      dispatch(addErrorToast(AddressGenerationError));
    } finally {
      setLoading(false);
    }
    // Need 'state' to ensure new address generation
  }, [state?.depositAsset]);

  // Necessary to ensure update of QRcode
  useIonViewWillLeave(() => {
    setAddress(undefined);
  });

  const copyAddress = () => {
    if (address) {
      Clipboard.copy(address.confidentialAddress)
        .then(() => {
          setCopied(true);
          dispatch(addSuccessToast('Address copied.'));
          setTimeout(() => {
            setCopied(false);
          }, 5000);
        })
        .catch(() => {
          if (addressRef?.current) {
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

  return (
    <IonPage>
      <IonLoading isOpen={loading} message="Please wait..." spinner="lines" />
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
          <PageDescription
            description={`To provide this address to the person sending you ${
              locationState.depositAsset.name ||
              locationState.depositAsset.coinGeckoID ||
              locationState.depositAsset.ticker
            } simply tap to copy it or scan your
              wallet QR code with their device.`}
            title={`Your ${locationState.depositAsset.ticker} address`}
          />
          {address && (
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
                <QRCodeImg value={address.confidentialAddress} size={192} />
              </div>
            </div>
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Receive);
