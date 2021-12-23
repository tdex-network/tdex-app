import { QRCodeImg } from '@cheprasov/react-qrcode';
import {
  IonPage,
  IonContent,
  IonItem,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  useIonViewWillEnter,
  useIonViewWillLeave,
} from '@ionic/react';
import classNames from 'classnames';
import { checkmarkOutline } from 'ionicons/icons';
import type { IdentityOpts, StateRestorerOpts } from 'ldk';
import { MasterPublicKey, address as addressLDK } from 'ldk';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router';
import type { MasterPublicKeyOpts } from 'tdex-sdk';
import { masterPubKeyRestorerFromState } from 'tdex-sdk';

import Header from '../../components/Header';
import Loader from '../../components/Loader';
import PageDescription from '../../components/PageDescription';
import { IconCopy, CurrencyIcon } from '../../components/icons';
import { upsertPegins } from '../../redux/actions/btcActions';
import { addErrorToast, addSuccessToast } from '../../redux/actions/toastActions';
import { addAddress } from '../../redux/actions/walletActions';
import { getPeginModule } from '../../redux/services/btcService';
import { clipboardCopy } from '../../utils/clipboard';
import type { AssetConfig } from '../../utils/constants';
import { BTC_TICKER } from '../../utils/constants';
import { AddressGenerationError } from '../../utils/errors';

import './style.scss';

interface LocationState {
  depositAsset: AssetConfig;
}

interface ReceiveProps {
  lastUsedIndexes: StateRestorerOpts;
  masterPubKeyOpts: IdentityOpts<MasterPublicKeyOpts>;
}

const Receive: React.FC<ReceiveProps> = ({ lastUsedIndexes, masterPubKeyOpts }) => {
  const [copied, setCopied] = useState(false);
  const [address, setAddress] = useState<string>();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { state } = useLocation<LocationState>();

  useIonViewWillEnter(async () => {
    try {
      setLoading(true);
      const masterPublicKey: MasterPublicKey = new MasterPublicKey(masterPubKeyOpts);
      const restoredMasterPubKey = await masterPubKeyRestorerFromState(masterPublicKey)(lastUsedIndexes);
      const addr = await restoredMasterPubKey.getNextAddress();
      dispatch(addAddress(addr));
      if (state?.depositAsset?.ticker === BTC_TICKER) {
        const peginModule = await getPeginModule();
        const claimScript = addressLDK.toOutputScript(addr.confidentialAddress).toString('hex');
        const peginAddress = await peginModule.getMainchainAddress(claimScript);
        const derivationPath = addr.derivationPath;
        if (!derivationPath) throw new Error('Derivation path is required');
        dispatch(
          upsertPegins({
            [claimScript]: {
              depositAddress: {
                claimScript,
                address: peginAddress,
                derivationPath,
              },
            },
          })
        );
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
    // Need 'state' to ensure new address generation
  }, [state?.depositAsset]);

  // Necessary to ensure update of QRcode
  useIonViewWillLeave(() => {
    setAddress(undefined);
  });

  const isBitcoin = state?.depositAsset?.ticker === BTC_TICKER;

  return (
    <IonPage id="receive-page">
      <Loader showLoading={loading} />
      <IonContent className="receive">
        <IonGrid>
          <Header hasBackButton={true} title={`${state?.depositAsset?.name?.toUpperCase() ?? ''} DEPOSIT`} />
          <div className="ion-text-center">
            <CurrencyIcon currency={state?.depositAsset?.ticker} width="48" height="48" />
          </div>
          {isBitcoin && (
            <PageDescription
              description="Send bitcoin here to convert them to Liquid Bitcoin. This trustless process requires 102 confirmations on the Bitcoin chain (around a day) for your funds to become available."
              title={`Bitcoin Pegin Address`}
            />
          )}
          {address && (
            <div
              className={classNames('addr-container', {
                'addr-container__margin-top': !isBitcoin,
              })}
            >
              <IonRow>
                <IonCol size="8" offset="2">
                  <div className="qr-code-container">
                    <QRCodeImg value={address} size={192} level="M" />
                  </div>
                </IonCol>
              </IonRow>

              <IonItem>
                <div className="addr-txt">{address}</div>
                <div
                  className="copy-icon"
                  onClick={() => {
                    clipboardCopy(address, () => {
                      setCopied(true);
                      dispatch(addSuccessToast('Address copied!'));
                      setTimeout(() => {
                        setCopied(false);
                      }, 2000);
                    });
                  }}
                >
                  {copied ? (
                    <IonIcon className="copied-icon" color="success" icon={checkmarkOutline} />
                  ) : (
                    <IconCopy width="24" height="24" viewBox="0 0 24 24" fill="#fff" />
                  )}
                </div>
              </IonItem>
            </div>
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Receive;
