import './style.scss';
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
import React, { useState } from 'react';
import { useLocation } from 'react-router';

import BtcIcon from '../../assets/img/coins/btc.svg';
import CurrencyIcon from '../../components/CurrencyIcon';
import Header from '../../components/Header';
import Loader from '../../components/Loader';
import PageDescription from '../../components/PageDescription';
import { IconCopy } from '../../components/icons';
import { BitcoinService } from '../../services/bitcoinService';
import type { Asset } from '../../store/assetStore';
import { useBitcoinStore } from '../../store/bitcoinStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useToastStore } from '../../store/toastStore';
import { useWalletStore } from '../../store/walletStore';
import { clipboardCopy } from '../../utils/clipboard';
import { BTC_TICKER } from '../../utils/constants';
import { AddressGenerationError } from '../../utils/errors';

interface LocationState {
  depositAsset: Asset;
}

export const Receive: React.FC = () => {
  const upsertPegins = useBitcoinStore((state) => state.upsertPegins);
  const addErrorToast = useToastStore((state) => state.addErrorToast);
  const addSuccessToast = useToastStore((state) => state.addSuccessToast);
  const network = useSettingsStore((state) => state.network);
  const addScriptDetails = useWalletStore((state) => state.addScriptDetails);
  const getNextAddress = useWalletStore((state) => state.getNextAddress);
  //
  const [copied, setCopied] = useState(false);
  const [address, setAddress] = useState<string>();
  const [loading, setLoading] = useState(false);
  const { state } = useLocation<LocationState>();

  useIonViewWillEnter(async () => {
    try {
      setLoading(true);
      const scriptDetail = await getNextAddress(false);
      addScriptDetails(scriptDetail);
      if (state?.depositAsset?.ticker === BTC_TICKER) {
        const peginModule = await BitcoinService.getPeginModule(network);
        const claimScript = scriptDetail.script;
        const peginAddress = await peginModule.getMainchainAddress(claimScript);
        const derivationPath = scriptDetail.derivationPath;
        if (!derivationPath) throw new Error('Derivation path is required');
        upsertPegins({
          [claimScript]: {
            depositAddress: {
              claimScript,
              address: peginAddress,
              derivationPath,
            },
          },
        });
        addSuccessToast('New pegin address generated');
        setAddress(peginAddress);
      } else {
        addSuccessToast('New address added to your account.');
        setAddress(scriptDetail.confidentialAddress);
      }
    } catch (e) {
      console.error(e);
      addErrorToast(AddressGenerationError);
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
  const title = state?.depositAsset?.name
    ? state?.depositAsset?.name?.toUpperCase()
    : state?.depositAsset?.ticker
    ? state?.depositAsset?.ticker?.toUpperCase()
    : '';

  return (
    <IonPage id="receive-page">
      <Loader showLoading={loading} />
      <IonContent className="receive">
        <IonGrid>
          <Header hasBackButton={true} title={`RECEIVE ${title}`} />
          <div className="ion-text-center">
            {isBitcoin ? (
              <img src={BtcIcon} alt="btc icon" className="currency-icon" width={48} height={48} />
            ) : (
              <CurrencyIcon assetHash={state?.depositAsset?.assetHash} size={48} />
            )}
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
                      addSuccessToast('Address copied!');
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
