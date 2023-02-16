import { IonContent, IonPage, IonGrid, IonIcon, IonItem } from '@ionic/react';
import { checkmarkOutline } from 'ionicons/icons';
import { useState } from 'react';
import type { RouteComponentProps } from 'react-router';

import Header from '../../components/Header';
import PageDescription from '../../components/PageDescription';
import { IconCopy } from '../../components/icons';
import { useSettingsStore } from '../../store/settingsStore';
import { useToastStore } from '../../store/toastStore';
import { useWalletStore } from '../../store/walletStore';
import { clipboardCopy } from '../../utils/clipboard';
import { BASE_DERIVATION_PATH_MAINNET, BASE_DERIVATION_PATH_TESTNET } from '../../utils/constants';

interface WalletInfoProps extends RouteComponentProps {
  masterPubKey: string;
  network: string;
}

export const WalletInfo: React.FC<WalletInfoProps> = () => {
  const network = useSettingsStore((state) => state.network);
  const addSuccessToast = useToastStore((state) => state.addSuccessToast);
  const masterPublicKey = useWalletStore((state) => state.masterPublicKey);

  const [xpubCopied, setXpubCopied] = useState(false);
  const [pathCopied, setPathCopied] = useState(false);
  const derivationPath = network === 'liquid' ? BASE_DERIVATION_PATH_MAINNET : BASE_DERIVATION_PATH_TESTNET;

  return (
    <IonPage>
      <IonContent className="show-xpub-content">
        <IonGrid className="ion-text-center ion-justify-content-center">
          <Header hasBackButton={true} title="INFORMATION" />
          <PageDescription
            description="Additional wallet information useful for view-only wallet restoration."
            title="Wallet Information"
          />
          <h6 className="ion-text-left mt-8">Extended Public Key</h6>
          <IonItem>
            <div className="addr-txt addr-txt__multiline">{masterPublicKey}</div>
            <div
              className="copy-icon"
              onClick={() => {
                clipboardCopy(masterPublicKey, () => {
                  setXpubCopied(true);
                  addSuccessToast('xPub copied!');
                  setTimeout(() => {
                    setXpubCopied(false);
                  }, 2000);
                });
              }}
            >
              {xpubCopied ? (
                <IonIcon className="copied-icon" color="success" icon={checkmarkOutline} />
              ) : (
                <IconCopy width="24" height="24" viewBox="0 0 24 24" fill="#fff" />
              )}
            </div>
          </IonItem>

          <h6 className="ion-text-left mt-8">Base Derivation Path</h6>
          <IonItem>
            <div className="addr-txt">{derivationPath}</div>
            <div
              className="copy-icon"
              onClick={() => {
                clipboardCopy(derivationPath, () => {
                  setPathCopied(true);
                  addSuccessToast('Derivation path copied!');
                  setTimeout(() => {
                    setPathCopied(false);
                  }, 2000);
                });
              }}
            >
              {pathCopied ? (
                <IonIcon className="copied-icon" color="success" icon={checkmarkOutline} />
              ) : (
                <IconCopy width="24" height="24" viewBox="0 0 24 24" fill="#fff" />
              )}
            </div>
          </IonItem>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};
