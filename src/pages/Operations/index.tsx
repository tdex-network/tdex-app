import {
  IonPage,
  IonButtons,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonButton,
  IonToolbar,
  IonHeader,
  IonListHeader,
} from '@ionic/react';
import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { IconBack } from '../../components/icons';
import './style.scss';

const Operations: React.FC<RouteComponentProps> = ({ history }) => {
  return (
    <IonPage>
      <div className="gradient-background"></div>
      <IonHeader className="header operations">
        <IonToolbar className="with-back-button">
          <IonButton
            style={{ zIndex: 10 }}
            onClick={() => {
              history.goBack();
            }}
          >
            <IconBack />
          </IonButton>
          <IonTitle>BTC</IonTitle>
        </IonToolbar>
        <div className="header-info">
          <img src="../assets/img/btc.png" />
          <p className="info-amount">
            10,00 <span>BTC</span>
          </p>
          <p className="info-amount-converted">114,000,80 EUR</p>
        </div>
        <IonButtons className="operations-buttons">
          <IonButton className="coin-action-button" routerLink="/recieve">
            Recieve
          </IonButton>
          <IonButton className="coin-action-button" routerLink="/withdraw">
            Withdraw
          </IonButton>
          <IonButton className="coin-action-button" routerLink="/swap">
            Swap
          </IonButton>
        </IonButtons>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonListHeader>Transactions</IonListHeader>
          <IonItem className="list-item">
            <div className="item-main-info">
              <div className="item-start">asdsad</div>
              <div>asdsad</div>
            </div>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Operations);
