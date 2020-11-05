import { IonContent, IonList, IonHeader, IonItem, IonPage, IonTitle, IonToolbar, IonListHeader } from '@ionic/react';
import React from 'react';
import { withRouter } from 'react-router';
import CircleDiagram from '../../components/CircleDiagram';
import { IconCheck, IconWallet } from '../../components/icons';

//styles
import './style.scss';

const data = [
  {
    amount: 10,
    type: "BTC",
  }
]

const Wallet: React.FC<any> = ({ history }) => {
  return (
    <IonPage>
      <div className="gradient-background"></div>
      <IonHeader className="header wallet">
        <IonToolbar>
          <IonTitle>Wallet</IonTitle>
        </IonToolbar>
        <div className="total-info">
          <div className="header-info wallet">
            <p className="info-heading">Total balance</p>
            <p className="info-amount">10,00<span>BTC</span></p>
            <p className="info-amount-converted">114,000,80 EUR</p>
          </div>
          <CircleDiagram className="diagram" data={data}/>
        </div>
      </IonHeader>
        <IonContent>
          <IonList>
            <IonListHeader>
              Asset list
            </IonListHeader>
            <IonItem onClick={() => {history.push("/operations")}}>
              <div className="item-main-info">
                <div className="item-start">asdsad</div>
                <div>asdsad</div>
              </div>
            </IonItem>
            <IonItem onClick={() => {history.push("/operations")}}>
              <div className="item-main-info">
                <div className="item-start">
                  <img src="../assets/img/btc.png" />
                  <div className="item-name">
                    <div className="main-row">
                      Bitcoin
                    </div>
                    <div className="sub-row">
                      fsdsa
                    </div>
                  </div>
                </div>
                <div className="item-end">
                  <div className="first-col">
                    <div className="main-row">3,00</div>
                    <div className="sub-row">24,00</div>
                  </div>
                  <div className="second-col">
                    <div className="main-row accent">BTC</div>
                    <div className="sub-row">EUR</div>
                  </div>
                </div>
              </div>
              <div className="sub-info">
        
              </div>
            </IonItem>
          </IonList>
        </IonContent>
    </IonPage>
  );
};

export default withRouter(Wallet);
