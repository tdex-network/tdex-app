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
import { eye, lockClosed, shieldCheckmark, trashOutline } from 'ionicons/icons';
import { useSelector } from 'react-redux';

import PageDescription from '../../components/PageDescription';
import { Clipboard } from '@ionic-native/clipboard';
import DeleteMnemonicModal from '../../components/DeleteMnemonicModal';

const Account: React.FC<any> = ({ history }) => {
  const { mnemonic } = useSelector((state: any) => ({
    mnemonic: state.wallet.mnemonic,
  }));
  const [showMnemonicModal, setShowMnemonicModal] = useState(false);
  const [showDeleteMnemonicModal, setShowDeleteMnemonicModal] = useState(false);
  const [copied, setCopied] = useState<boolean>(false);
  const mnemonicRef: any = useRef(null);
  const copyMnemonic = () => {
    if (mnemonicRef) {
      Clipboard.copy(mnemonic)
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
            onClick={() => setShowMnemonicModal(true)}
          >
            <div className="item-main-info">
              <IonIcon icon={eye} />
              <div className="item-start">
                <div className="main-row">Show mnemonic</div>
                <IonText className="description">
                  Display the secret mnemonic stored in your device's secure
                  storage.
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
              setShowDeleteMnemonicModal(true);
            }}
          >
            <div className="item-main-info">
              <IonIcon icon={trashOutline}></IonIcon>
              <div className="item-start">
                <div className="main-row">Delete Mnemonic</div>
                <IonText className="description">
                  Definitively removes your seed from this device. Be extremely
                  careful, after deletion it will be impossible to retrieve your
                  key from tdex-app.
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
                <p>{mnemonic}</p>
              </PageDescription>
              <input
                type="text"
                ref={mnemonicRef}
                value={mnemonic}
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
        <DeleteMnemonicModal
          setOpenModal={setShowDeleteMnemonicModal}
          openModal={showDeleteMnemonicModal}
        />
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Account);
