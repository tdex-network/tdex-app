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
import { withRouter } from 'react-router';
import { IconBack, IconExchange } from '../../components/icons';
import './style.scss';

const TradeSummary: React.FC = ({ history }: any) => {
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
          <IonTitle>Trade summary</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="trade-summary">
        <div className="transaction-icons">
          <img src="../assets/img/btc.png" />
          <img src="../assets/img/btc.png" />
        </div>
        <IonItem>
          <div className="trade-summary-item">
            <div className="trade-items">
              <div className="trade-item">
                <div className="name">
                  <img src="../assets/img/btc.png" />
                  <p>BTC</p>
                </div>
                <p className="trade-price">-1,2323</p>
              </div>
              <div className="trade-divider">
                <IconExchange />
              </div>
              <div className="trade-item">
                <div className="name">
                  <img src="../assets/img/btc.png" />
                  <p>BTC</p>
                </div>
                <p className="trade-price">+1.202,3</p>
              </div>
            </div>
            <div className="transaction-info">
              <div className="transaction-info-date">
                <p>12 Sep 2020 09:24:41</p>
                <p>0,0005 Fee</p>
              </div>
              <div className="transaction-info-values">
                <div className="transaction-col-name">ADDR</div>
                <div className="transaction-col-value">
                  8T71hMKw05f96b4dc1gBrLO4ds1f3LMKSX
                </div>
              </div>
              <div className="transaction-info-values">
                <div className="transaction-col-name">T x ID</div>
                <div className="transaction-col-value">
                  84g96f5hy6mu13971563f95f08gh818s3526h7dpv22d1r006hn8563247855690
                </div>
              </div>
            </div>
          </div>
        </IonItem>
        <div className="buttons">
          <IonButton routerLink="/history" className="main-button secondary">
            Go to trade history
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(TradeSummary);
