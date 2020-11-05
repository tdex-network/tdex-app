import React from 'react';

//components
import { IonContent, IonList, IonHeader, IonItem, IonPage, IonTitle, IonToolbar, IonListHeader, IonButton, IonButtons } from '@ionic/react';

//styles
import './style.scss';

const Exchange: React.FC = () => {
  return (
    <IonPage>
      <IonHeader className="header">
        <IonToolbar><IonTitle>Exchange</IonTitle></IonToolbar>
        <IonButtons>
            <IonButton className="coin-action-button" routerLink="/qrscanner">Recieve</IonButton>
            <IonButton>Withdraw</IonButton>
            <IonButton>Swap</IonButton>
        </IonButtons>
      </IonHeader>
        <IonContent>
          <IonList>
            <IonListHeader>
              Blocks
            </IonListHeader>
            <IonItem lines="none">
              
            </IonItem>
          </IonList>
          <IonList>
            <IonListHeader>
              Trans
            </IonListHeader>
            <IonItem lines="none">
              <p>sadsa</p>
            </IonItem>
          </IonList>
        </IonContent>
    </IonPage>
  );
};

export default Exchange;
