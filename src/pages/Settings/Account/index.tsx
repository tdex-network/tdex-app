import './style.scss';

import {
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonItem,
  IonList,
  IonListHeader,
  IonPage,
  IonRow,
  IonText,
} from '@ionic/react';
import { chevronForwardOutline, eye, lockOpen, trashOutline } from 'ionicons/icons';
import React, { useState } from 'react';
import type { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router';

import ChangePinModals from '../../../components/ChangePinModals';
import Header from '../../../components/Header';
import PinModal from '../../../components/PinModal';
import { routerLinks } from '../../../routes';
import { useToastStore } from '../../../store/toastStore';
import { useWalletStore } from '../../../store/walletStore';
import { PIN_TIMEOUT_FAILURE, PIN_TIMEOUT_SUCCESS } from '../../../utils/constants';
import { decrypt } from '../../../utils/crypto';
import { IncorrectPINError, NoMnemonicError } from '../../../utils/errors';

const Account: React.FC<RouteComponentProps> = ({ history }) => {
  const addErrorToast = useToastStore((state) => state.addErrorToast);
  const encryptedMnemonic = useWalletStore((state) => state.encryptedMnemonic);
  //
  const [routeToGo, setRouteToGo] = useState<string>();
  const [showChangePinModal, setShowChangePinModal] = useState(false);

  // Pin modal
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);
  const [needPinReset, setPinNeedReset] = useState<boolean>(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);

  const handlePinConfirm = async (pin: string) => {
    if (!encryptedMnemonic) {
      addErrorToast(NoMnemonicError);
      return;
    }
    try {
      const decryptedMnemonic = await decrypt(encryptedMnemonic, pin);
      setIsWrongPin(false);
      setPinNeedReset(true);
      setTimeout(() => {
        setPinModalOpen(false);
        setIsWrongPin(null);
        if (routeToGo === '/settings/show-mnemonic') {
          history.replace({
            pathname: routeToGo,
            state: { mnemonic: decryptedMnemonic },
          });
        }
        if (routeToGo === '/settings/delete-mnemonic') {
          history.replace({
            pathname: routeToGo,
            state: { pin },
          });
        }
      }, PIN_TIMEOUT_SUCCESS);
    } catch (err) {
      setIsWrongPin(true);
      setTimeout(() => {
        setIsWrongPin(null);
        setPinNeedReset(true);
      }, PIN_TIMEOUT_FAILURE);
      addErrorToast(IncorrectPINError);
      console.error(err);
    }
  };

  return (
    <IonPage>
      {/* PIN Modal */}
      <PinModal
        needReset={needPinReset}
        setNeedReset={setPinNeedReset}
        open={pinModalOpen}
        title="Unlock your seed"
        description="Enter your secret PIN to unlock your wallet"
        onConfirm={handlePinConfirm}
        onClose={() => setPinModalOpen(false)}
        isWrongPin={isWrongPin}
        setIsWrongPin={setIsWrongPin}
      />
      {/* IDENTITY */}
      <IonContent className="account">
        <IonGrid>
          <Header title="ACCOUNT" hasBackButton={true} />
          <IonRow>
            <IonCol>
              {/* Show Mnemonic */}
              <IonList>
                <IonListHeader>Identity</IonListHeader>
                <IonItem
                  className="list-item"
                  onClick={() => {
                    setPinModalOpen(true);
                    setRouteToGo('/settings/show-mnemonic');
                  }}
                >
                  <div className="item-main-info">
                    <IonIcon icon={eye} />
                    <div className="item-start">
                      <div className="main-row">Show mnemonic</div>
                      <IonText className="description">
                        Display the secret mnemonic stored in your device's secure storage.
                      </IonText>
                    </div>
                    <IonIcon icon={chevronForwardOutline} />
                  </div>
                </IonItem>
                <IonItem className="list-item" onClick={() => history.push(routerLinks.walletInfo)}>
                  <div className="item-main-info">
                    <IonIcon icon={eye} />
                    <div className="item-start">
                      <div className="main-row">Show information</div>
                      <IonText className="description">Display additional wallet information.</IonText>
                    </div>
                    <IonIcon icon={chevronForwardOutline} />
                  </div>
                </IonItem>
              </IonList>

              <IonList>
                <IonListHeader>Security</IonListHeader>
                {/* Change PIN */}
                <IonItem
                  className="list-item"
                  onClick={() => {
                    setShowChangePinModal(true);
                  }}
                >
                  <div className="item-main-info">
                    <IonIcon icon={lockOpen} />
                    <div className="item-start">
                      <div className="main-row">Set new pin</div>
                      <IonText className="description">
                        Change the secure PIN using to encrypt your wallet's seed.
                      </IonText>
                    </div>
                    <IonIcon icon={chevronForwardOutline} />
                  </div>
                </IonItem>
                <ChangePinModals
                  open={showChangePinModal}
                  onClose={() => setShowChangePinModal(false)}
                  onDeleted={() => {
                    setShowChangePinModal(false);
                    history.push('/homescreen');
                  }}
                />

                {/* Delete Mnemonic */}
                <IonItem
                  className="list-item"
                  onClick={() => {
                    setPinModalOpen(true);
                    setRouteToGo('/settings/delete-mnemonic');
                  }}
                >
                  <div className="item-main-info">
                    <IonIcon icon={trashOutline} />
                    <div className="item-start">
                      <div className="main-row">Delete Mnemonic</div>
                      <IonText className="description">
                        Definitively removes your seed from this device. Be extremely careful, after deletion it will be
                        impossible to retrieve your key from tdex-app.
                      </IonText>
                    </div>
                    <IonIcon icon={chevronForwardOutline} />
                  </div>
                </IonItem>
              </IonList>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Account);
