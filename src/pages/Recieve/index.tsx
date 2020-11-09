import {
  IonPage,
  IonModal,
  IonTitle,
  IonContent,
  IonItem,
  IonButton,
  IonToolbar,
  IonHeader,
} from '@ionic/react';
import React, { useState } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import {
  IconBack,
  IconClose,
  IconCopy,
  IconSetup,
} from '../../components/icons';
import PageDescription from '../../components/PageDescription';
import './style.scss';

const Recieve: React.FC<RouteComponentProps> = ({ history }) => {
  const [openModal, setOpenModal] = useState(false);

  return (
    <IonPage>
      <div className="gradient-background"></div>
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
          <IonTitle>Recieve</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="recieve">
        <div className="description-with-icon">
          <img src="../assets/img/btc.png" />
          <PageDescription align="left" title="Your BTC address">
            <p>
              To provide this address to the person sending you Bitcoin simply
              tap to copy it or scan your wallet QR code with their device.
            </p>
          </PageDescription>
        </div>

        <IonItem>
          <div className="item-main-info">
            <div className="item-start">asdsad</div>
            <IconCopy width="24" height="24" viewBox="0 0 24 24" fill="#fff" />
          </div>
        </IonItem>
        <div className="qr-code-container"></div>

        <IonModal cssClass="modal-big recieve" isOpen={openModal}>
          <div className="gradient-background"></div>
          <IonHeader>
            <IonToolbar className="with-back-button">
              <IonButton
                style={{ zIndex: 10 }}
                onClick={() => {
                  setOpenModal(false);
                }}
              >
                <IconClose />
              </IonButton>
              <IonTitle>Confirm withdrawal</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="description-with-icon">
              <IconSetup
                width="54"
                height="54"
                viewBox="0 0 54 54"
                fill="#fff"
              />

              <PageDescription align="left" title="Secret phrase">
                <p>
                  Your secret 12-word recovery phrase is the only way to recover
                  your funds if you lose access to your wallet. Write your
                  secret phrase on paper and store it in a safe deposit box.
                </p>
                <p>Insert the numeric password you’ve set at sign in</p>
              </PageDescription>
            </div>
            <div className="buttons">
              <IonButton className="main-button">Show backup phrase</IonButton>
              <IonButton
                onClick={() => {
                  setOpenModal(false);
                }}
                className="sub-button"
              >
                Skip
              </IonButton>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Recieve);
