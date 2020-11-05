import {
  IonPage,
  IonTitle,
  IonContent,
  IonItem,
  IonButton,
  IonToolbar,
  IonHeader,
} from '@ionic/react';
import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { IconBack } from '../../components/icons';
import './style.scss';

const WithdrawalDetails: React.FC<RouteComponentProps> = ({ history }) => {
  return (
    <IonPage>
      <div className="gradient-background"></div>
      <IonHeader className="">
        <IonToolbar className="with-back-button">
          <IonButton
            style={{ zIndex: 10 }}
            onClick={() => {
              history.goBack();
            }}
          >
            <IconBack />
          </IonButton>
          <IonTitle>Details</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="withdrawal-details">
        <div className="header-info">
          <img src="../assets/img/btc.png" />
          <p className="info-amount">
            10,00 <span>BTC</span>
          </p>
        </div>
        <IonItem>
          <div className="item-col">
            <div className="item-main-info">
              <div className="item-start main-row">Amount</div>
              <div className="item-end main-row">-1.093235 BTC</div>
            </div>
            <div className="item-main-info">
              <div className="item-start main-row">Status</div>
              <div className="item-end main-row completed">Completed</div>
            </div>
            <div className="item-main-info divider">
              <div className="item-start main-row">Date</div>
              <div className="item-end sub-row">Completed</div>
            </div>
            <div className="item-main-info">
              <div className="item-start main-row">Fee</div>
              <div className="item-end sub-row">0,0005</div>
            </div>
            <div className="item-main-info">
              <div className="item-start main-row">Address</div>
              <div className="item-end sub-row">sadsadsadsa</div>
            </div>
          </div>
        </IonItem>
        <div className="buttons">
          <IonButton routerLink="/history" className="main-button secondary">
            Go to transactions
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(WithdrawalDetails);
