import {
  IonContent,
  IonList,
  IonHeader,
  IonItem,
  IonPage,
  IonTitle,
  IonToolbar,
  IonListHeader,
  IonText,
  IonIcon,
  IonButton,
  IonModal,
  IonLabel,
} from '@ionic/react';
import React, { useRef, useState } from 'react';
import { IconBack, IconClose, IconRightArrow } from '../../components/icons';
import { withRouter } from 'react-router';
import './style.scss';
import { eye, lockClosed, shieldCheckmark } from 'ionicons/icons';
import PinModal from '../../components/PinModal';
import { useSelector } from 'react-redux';

import { decrypt } from '../../utils/crypto';
import PageDescription from '../../components/PageDescription';
import { Clipboard } from '@ionic-native/clipboard';
import NewPinModal from '../../components/NewPinModal';

const Account: React.FC<any> = ({ history }) => {
  const { mnemonic } = useSelector((state: any) => ({
    mnemonic: state.wallet.mnemonic,
  }));
  const [showNewPinModal, setShowNewPinModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showMnemonicModal, setShowMnemonicModal] = useState(false);
  const [mnemonicPhrase, setMnemonicPhrase] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const mnemonicRef: any = useRef(null);
  const onShowMnemonic = (pin: string) => {
    setMnemonicPhrase(decrypt(mnemonic, pin));
    setShowPinModal(false);
    setShowMnemonicModal(true);
  };
  const copyMnemonic = () => {
    if (mnemonicRef) {
      Clipboard.copy(mnemonicPhrase)
        .then((res: any) => {
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
          }, 5000);
        })
        .catch((e: any) => {
          mnemonicRef.current.select();
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
          }, 10000);
        });
    }
  };
  return (
    <IonPage>
      <div className="gradient-background" />
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
          <IonTitle>Account</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="account">
        <IonList>
          <IonListHeader>Identity</IonListHeader>
          <IonItem
            className="list-item"
            onClick={() => {
              setShowPinModal(true);
            }}
          >
            <div className="item-main-info">
              <IonIcon icon={eye} />
              <div className="item-start">
                <div className="main-row">Show mnemonic</div>
                <IonText className="description">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </IonText>
              </div>
              <div className="item-end">
                <IconRightArrow
                  className="next-icon"
                  fill="#fff"
                  width="7"
                  height="12"
                  viewBox="0 0 7 12"
                />
              </div>
            </div>
          </IonItem>
          <IonItem
            className="list-item"
            onClick={() => {
              history.push('/set-pin');
            }}
          >
            <div className="item-main-info">
              <IonIcon icon={shieldCheckmark}></IonIcon>
              <div className="item-start">
                <div className="main-row">Show advanced info </div>
                <IonText className="description">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </IonText>
              </div>
              <div className="item-end">
                <IconRightArrow
                  className="next-icon"
                  fill="#fff"
                  width="7"
                  height="12"
                  viewBox="0 0 7 12"
                />
              </div>
            </div>
          </IonItem>
        </IonList>
        <IonList>
          <IonListHeader>Security</IonListHeader>
          <IonItem
            className="list-item"
            onClick={() => {
              setShowNewPinModal(true);
            }}
          >
            <div className="item-main-info">
              <IonIcon icon={lockClosed}></IonIcon>
              <div className="item-start">
                <div className="main-row">Set new PIN </div>
                <IonText className="description">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </IonText>
              </div>
              <div className="item-end">
                <IconRightArrow
                  className="next-icon"
                  fill="#fff"
                  width="7"
                  height="12"
                  viewBox="0 0 7 12"
                />
              </div>
            </div>
          </IonItem>
        </IonList>
        {showPinModal && (
          <PinModal
            openModal={showPinModal}
            title={'ENTER PIN'}
            onConfirm={onShowMnemonic}
            withClose
            setOpenModal={setShowPinModal}
          />
        )}
        {showMnemonicModal && (
          <IonModal
            isOpen={showMnemonicModal}
            cssClass="modal-big withdrawal"
            keyboardClose={false}
          >
            <div className="gradient-background" />
            <IonHeader>
              <IonToolbar className="with-back-button">
                <IonButton
                  style={{ zIndex: 10 }}
                  onClick={() => {
                    setShowMnemonicModal(false);
                  }}
                >
                  <IconClose />
                </IonButton>
                <IonTitle>Show Mnemonic</IonTitle>
              </IonToolbar>
            </IonHeader>
            <IonContent>
              <PageDescription title="Secret phrase">
                <p>{mnemonicPhrase}</p>
              </PageDescription>
              <input
                type="text"
                ref={mnemonicRef}
                value={mnemonicPhrase}
                className="hidden-input"
              />
              <div className="buttons">
                <IonButton
                  onClick={() => copyMnemonic()}
                  type="button"
                  className="main-button"
                >
                  {copied ? 'Copied' : 'Copy'}
                </IonButton>
              </div>
              <div className="align-center">
                <IonButton
                  onClick={() => {
                    setShowMnemonicModal(false);
                  }}
                  className="cancel-button"
                >
                  <IonLabel>Cancel</IonLabel>
                </IonButton>
              </div>
            </IonContent>
          </IonModal>
        )}
        {showNewPinModal && (
          <NewPinModal
            setOpenModal={setShowNewPinModal}
            openModal={showNewPinModal}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Account);
