import {  IonPage, IonModal, IonButtons, IonTitle,  IonContent, IonList, IonItem, IonButton, IonToolbar, IonHeader, IonTabs, IonTabBar, IonTabButton, IonLabel, IonRouterOutlet, IonIcon, IonListHeader } from '@ionic/react';
import React, { useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { IconBack, IconCheck, IconExchange, IconWallet } from '../../components/icons';
import './style.scss';

const TradeSummary: React.FC<RouteComponentProps> = ({ history }) => {
  return (
    <IonPage>
      <div className="gradient-background"></div>
      <IonHeader className="">
        <IonToolbar className="with-back-button">
          <IonButton style={{zIndex: 10}} onClick={() => {history.goBack()}}><IconBack /></IonButton>
          <IonTitle>Trade summary</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="trade-history">
        <IonList>
            <IonListHeader>
                Today
            </IonListHeader>
            <IonItem className="list-item" onClick={() => {history.push("/operations")}}>
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
}

export default withRouter(TradeSummary);