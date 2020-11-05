import {
  IonPage,
  IonModal,
  IonButtons,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonButton,
  IonToolbar,
  IonHeader,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonRouterOutlet,
  IonIcon,
  IonListHeader,
} from '@ionic/react';
import React, { useState, useRef, useEffect } from 'react';
import { withRouter } from 'react-router';
import {
  IconBack,
  IconClose,
  IconExchange,
  IconQR,
} from '../../components/icons';
import PageDescription from '../../components/PageDescription';
import './style.scss';
import ExchangeRow from '../../components/ExchangeRow';
import PinInput from '../../components/PinInput';

const Withdrawal: React.FC = ({ history }: any) => {
  const [openSearch, setOpenSearch] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef: any = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  });

  const onChange = (e: any) => {
    const { value } = e.target;

    setInputValue(value);
  };

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
          <IonTitle>Withdrawal</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="withdrawal">
        <ExchangeRow />
        <IonItem className="list-item">
          <div className="item-main-info">
            <div className="item-start">sdasddsadasd</div>
            <div className="item-end">
              <IconQR fill="#fff" />
            </div>
          </div>
        </IonItem>
        <div className="buttons">
          <IonButton
            onClick={() => {
              setOpenModal(true);
            }}
            className="main-button"
          >
            <IonLabel>Confirm</IonLabel>
          </IonButton>
        </div>
        <IonModal isOpen={openModal} cssClass="modal-big withdrawal">
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
              <IonTitle>Withdrawal</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <PageDescription title="Insert PIN">
              <p>Insert the numeric password you’ve set at sign in</p>
            </PageDescription>
            <PinInput
              inputRef={inputRef}
              inputValue={inputValue}
              onChange={onChange}
            />
            <div className="buttons">
              <IonButton
                routerLink="/withdrawaldetails"
                onClick={() => {
                  setOpenModal(false);
                }}
                className="main-button"
              >
                Confirm
              </IonButton>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Withdrawal);
