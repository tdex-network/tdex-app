import { IonContent, IonPage, IonGrid, IonIcon, IonItem } from '@ionic/react';
import { checkmarkOutline } from 'ionicons/icons';
import type { FC } from 'react';
import { useState } from 'react';
import type { RouteComponentProps } from 'react-router';

import Header from '../../components/Header';
import PageDescription from '../../components/PageDescription';
import { IconCopy } from '../../components/icons';
import { useSettingsStore } from '../../store/settingsStore';
import { useToastStore } from '../../store/toastStore';
import { useWalletStore } from '../../store/walletStore';
import { clipboardCopy } from '../../utils/clipboard';

interface WalletInfoProps extends RouteComponentProps {
  masterPubKey: string;
  network: string;
}

export const WalletInfo: FC<WalletInfoProps> = () => {
  const network = useSettingsStore((state) => state.network);
  const addSuccessToast = useToastStore((state) => state.addSuccessToast);
  const masterPublicKeyMain = useWalletStore((state) => state.accounts?.main?.masterPublicKey);
  const derivationPathMain = useWalletStore((state) => state.accounts?.main?.derivationPath);
  const masterPublicKeyTest = useWalletStore((state) => state.accounts?.test?.masterPublicKey);
  const derivationPathTest = useWalletStore((state) => state.accounts?.test?.derivationPath);
  const derivationPathLegacy = useWalletStore((state) => state.accounts?.legacy?.derivationPath);
  const nextExternalIndexLegacy = useWalletStore((state) => state.accounts?.legacy?.nextExternalIndex);
  const nextInternalIndexLegacy = useWalletStore((state) => state.accounts?.legacy?.nextInternalIndex);
  const masterPublicKeyLegacy = useWalletStore((state) => state.accounts?.legacy?.masterPublicKey);
  const legacyAccountHasBeenUsed = (nextExternalIndexLegacy ?? 0) > 0 || (nextInternalIndexLegacy ?? 0) > 0;

  const [xpubCopied, setXpubCopied] = useState(false);
  const [pathCopied, setPathCopied] = useState(false);

  const PubKeyComponent: FC<{ masterPublicKey?: string }> = ({ masterPublicKey }) => (
    <IonItem>
      <div className="addr-txt addr-txt__multiline">{masterPublicKey ?? 'N/A'}</div>
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
  );

  const DerivationComponent: FC<{ derivationPath?: string }> = ({ derivationPath }) => (
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
  );

  return (
    <IonPage>
      <IonContent className="show-xpub-content">
        <IonGrid className="ion-text-center ion-justify-content-center">
          <Header hasBackButton={true} title="INFORMATION" />
          <PageDescription
            description="Additional wallet information useful for view-only wallet restoration."
            title="Wallet Information"
          />
          {network === 'liquid' ? (
            <>
              <h6 className="ion-text-left mt-8">Extended Public Key</h6>
              <PubKeyComponent masterPublicKey={masterPublicKeyMain} />
              <h6 className="ion-text-left mt-8">Base Derivation Path</h6>
              <DerivationComponent derivationPath={derivationPathMain} />
            </>
          ) : (
            <>
              <h6 className="ion-text-left mt-8">Extended Public Key</h6>
              <PubKeyComponent masterPublicKey={masterPublicKeyTest} />
              <h6 className="ion-text-left mt-8">Base Derivation Path</h6>
              <DerivationComponent derivationPath={derivationPathTest} />
            </>
          )}

          {legacyAccountHasBeenUsed ? (
            <>
              <h6 className="ion-text-left mt-8">Extended Public Key (Legacy Account)</h6>
              <PubKeyComponent masterPublicKey={masterPublicKeyLegacy} />
              <h6 className="ion-text-left mt-8">Base Derivation Path (Legacy Account)</h6>
              <DerivationComponent derivationPath={derivationPathLegacy} />
            </>
          ) : null}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};
