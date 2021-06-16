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
import type { IdentityOpts } from 'ldk';
import { IdentityType, MasterPublicKey, address as addressLDK } from 'ldk';
import ElementsPegin from 'pegin';
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
import { addAddress, addPeginAddress } from '../../redux/actions/walletActions';
import { network } from '../../redux/config';
import type { WalletState } from '../../redux/reducers/walletReducer';
import { lastUsedIndexesSelector } from '../../redux/selectors/walletSelectors';
import type { AssetConfig } from '../../utils/constants';
import { BTC_TICKER } from '../../utils/constants';
import { AddressGenerationError } from '../../utils/errors';
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
      let peginModule;
      dispatch(addAddress(addr));
      if (state?.depositAsset?.ticker === BTC_TICKER) {
        if (network.chain === 'liquid') {
          peginModule = new ElementsPegin(
            await ElementsPegin.withGoElements(),
            await ElementsPegin.withLibwally(),
          );
        } else {
          peginModule = new ElementsPegin(
            await ElementsPegin.withGoElements(),
            await ElementsPegin.withLibwally(),
            ElementsPegin.withDynamicFederation(false),
            ElementsPegin.withTestnet(),
            ElementsPegin.withFederationScript('52'),
          );
        }
        const claimScript = addressLDK
          .toOutputScript(addr.confidentialAddress)
          .toString('hex');
        const peginAddress = await peginModule.getMainchainAddress(claimScript);
        dispatch(addPeginAddress(claimScript, peginAddress));
        dispatch(addSuccessToast('New pegin address generated'));
        setAddress(peginAddress);
      } else {
        dispatch(addSuccessToast('New address added to your account.'));
        setAddress(addr.confidentialAddress);
      }
    } catch (e) {
      console.error(e);
      dispatch(addErrorToast(AddressGenerationError));
    } finally {
      setLoading(false);
    }
    // Need 'state' to ensure new lbtcAddress generation
  }, [state?.depositAsset]);

  // Necessary to ensure update of QRcode
  useIonViewWillLeave(() => {
    setAddress(undefined);
  });

  const copyAddress = () => {
    if (address) {
      Clipboard.copy(address)
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
            }, 5000);
          }
        });
    }
  };

  return (
    <IonPage>
      <IonLoading isOpen={loading} />
      <IonContent className="receive">
        <IonGrid>
          <Header
            hasBackButton={true}
            title={`${state?.depositAsset?.name?.toUpperCase() ?? ''} DEPOSIT`}
          />
          <div className="ion-text-center">
            <CurrencyIcon
              currency={state?.depositAsset?.ticker}
              width="48"
              height="48"
            />
          </div>
          {state?.depositAsset?.ticker === BTC_TICKER ? (
            <PageDescription
              description="Send any amount of Bitcoin to receive Liquid Bitcoin."
              title={`Your Bitcoin Pegin address`}
            />
          ) : (
            <PageDescription
              description={`To provide this address to the person sending you ${
                state?.depositAsset?.name ||
                state?.depositAsset?.coinGeckoID ||
                state?.depositAsset?.ticker
              } simply tap to copy it or scan your
              wallet QR code with their device.`}
              title={`Your ${state?.depositAsset?.ticker} address`}
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
                <QRCodeImg value={address} size={192} level="M" />
              </div>
            </div>
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Receive);
