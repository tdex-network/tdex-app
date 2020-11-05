import { IonContent, IonModal, IonGrid, IonRow, IonBackButton, IonIcon, IonCol, IonList, IonHeader, IonImg, IonItem, IonInput, IonLabel, IonPage, IonTitle, IonToolbar, useIonViewDidEnter, IonListHeader, IonButton, IonButtons } from '@ionic/react';
import React, { useEffect, useRef, useState} from 'react';
import CircleDiagram from '../../components/CircleDiagram';
import { IconRightArrow, IconWallet } from '../../components/icons';
import { withRouter } from 'react-router';
import './style.scss';

const Settings: React.FC<any> = ({ history }) => {
  return (
    <IonPage>
      <div className="gradient-background"></div>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
        <IonContent className="settings">
          <IonList>
            <IonListHeader>General</IonListHeader>
            <IonItem className="list-item" onClick={() => {history.push("/account")}}>
              <div className="item-main-info">
                <div className="item-start">
                  <div className="main-row">Account </div>
                </div>
                <div className="item-end">
                  <IconRightArrow
                    className="next-icon"
                    fill="#fff"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  />
                </div>
              </div>
            </IonItem>
          </IonList>
        </IonContent>
    </IonPage>
  );
};

export default withRouter(Settings);
