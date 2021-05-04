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
  IonButtons,
  IonBackButton,
} from '@ionic/react';
import React, { useEffect, useRef, useState } from 'react';
import { IconRightArrow } from '../../components/icons';
import { RouteComponentProps, useParams, withRouter } from 'react-router';
import './style.scss';
import {
  chevronBackOutline,
  closeOutline,
  eye,
  lockOpen,
  shieldCheckmark,
  trashOutline,
} from 'ionicons/icons';

import PageDescription from '../../components/PageDescription';
import { Clipboard } from '@ionic-native/clipboard';
import DeleteMnemonicModal from '../../components/DeleteMnemonicModal';
import { getMnemonicFromSecureStorage } from '../../utils/storage-helper';
import ChangePinModals from '../../components/ChangePinModals';
import ShowMnemonic from '../../components/ShowMnemonic';
import { useDispatch } from 'react-redux';
import { setSignedUp } from '../../redux/actions/appActions';
import { setIsAuth } from '../../redux/actions/walletActions';
import ButtonsMainSub from '../../components/ButtonsMainSub';

const Account: React.FC<RouteComponentProps> = ({ history }) => {
  const dispatch = useDispatch();
  const { pin } = useParams<{ pin: string }>();
  const [mnemonic, setMnemonic] = useState<string>();

  useEffect(() => {
    getMnemonicFromSecureStorage(pin).then(setMnemonic).catch(console.error);
  }, [pin]);

  const [showMnemonicModal, setShowMnemonicModal] = useState(false);
  const [showDeleteMnemonicModal, setShowDeleteMnemonicModal] = useState(false);
  const [showChangePinModal, setShowChangePinModal] = useState(false);

  const [copied, setCopied] = useState<boolean>(false);
  const mnemonicRef: any = useRef(null);
  const copyMnemonic = () => {
    if (mnemonicRef && mnemonic) {
      Clipboard.copy(mnemonic)
        .then((res: any) => {
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
          }, 2000);
        })
        .catch((e: any) => {
          mnemonicRef.current.select();
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
          }, 2000);
        });
    }
  };

  return (
    <IonPage>
      <IonContent className="account">
        <IonHeader className="ion-no-border">
          <IonToolbar className="with-back-button">
            <IonButtons slot="start">
              <IonBackButton
                defaultHref="/"
                text=""
                icon={chevronBackOutline}
              />
            </IonButtons>
            <IonTitle>Account</IonTitle>
          </IonToolbar>
        </IonHeader>

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
              setShowChangePinModal(true);
            }}
          >
            <div className="item-main-info">
              <IonIcon icon={lockOpen}></IonIcon>
              <div className="item-start">
                <div className="main-row">Change PIN</div>
                <IonText className="description">
                  Change the secure PIN using to encrypt your wallet's seed.
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
              setShowDeleteMnemonicModal(true);
            }}
          >
            <div className="item-main-info">
              <IonIcon icon={trashOutline} />
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
        {showChangePinModal && (
          <ChangePinModals
            open={showChangePinModal}
            onClose={() => setShowChangePinModal(false)}
            onDeleted={() => {
              setShowChangePinModal(false);
              history.push('/homescreen');
            }}
          />
        )}

        {showMnemonicModal && (
          <IonModal
            isOpen={showMnemonicModal}
            cssClass="modal-big withdrawal"
            keyboardClose={false}
          >
            <IonContent>
              <IonHeader className="ion-no-border">
                <IonToolbar className="with-back-button">
                  <IonButtons slot="start">
                    <IonButton
                      onClick={() => {
                        setShowMnemonicModal(false);
                      }}
                    >
                      <IonIcon slot="icon-only" icon={closeOutline} />
                    </IonButton>
                  </IonButtons>
                  <IonTitle>Show Mnemonic</IonTitle>
                </IonToolbar>
              </IonHeader>

              <PageDescription title="Secret phrase">
                <ShowMnemonic mnemonic={mnemonic || ''} />
              </PageDescription>
              <input
                type="text"
                ref={mnemonicRef}
                value={mnemonic}
                className="hidden-input"
              />

              <ButtonsMainSub
                mainTitle={copied ? 'Copied' : 'Copy'}
                mainOnClick={copyMnemonic}
                subTitle="Cancel"
                subOnClick={() => setShowMnemonicModal(false)}
              />
            </IonContent>
          </IonModal>
        )}
        <DeleteMnemonicModal
          pin={pin}
          close={() => {
            setShowDeleteMnemonicModal(false);
          }}
          onConfirm={() => {
            dispatch(setSignedUp(false));
            dispatch(setIsAuth(false));
            history.replace('/homescreen');
          }}
          openModal={showDeleteMnemonicModal}
        />
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Account);
