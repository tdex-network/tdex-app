import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import React from 'react';
import { RouteComponentProps } from 'react-router';
import './style.scss';
import { chevronBackOutline } from 'ionicons/icons';

const Terms: React.FC<RouteComponentProps> = () => {
  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="with-back-button">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" text="" icon={chevronBackOutline} />
          </IonButtons>
          <IonTitle>Terms & Conditions</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="main-content">
        <div className="content">
          <h4>TDex App</h4>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
            posuere orci sit amet dignissim interdum. Cras diam nisi, ornare at
            est eu, tempus vulputate ipsum. Vestibulum molestie odio a metus
            suscipit, quis scelerisque magna pulvinar. Nulla tempus fringilla
            arcu eget porta. Aliquam viverra enim ac ante eleifend, eget
            tristique quam dictum. Sed non vehicula nulla. Fusce malesuada
            sagittis nisi, quis posuere nibh laoreet a.
          </p>
          <h4>Vulpem</h4>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
            posuere orci sit amet dignissim interdum. Cras diam nisi, ornare at
            est eu, tempus vulputate ipsum. Vestibulum molestie odio a metus
            suscipit, quis scelerisque magna pulvinar. Nulla tempus fringilla
            arcu eget porta. Aliquam viverra enim ac ante eleifend, eget
            tristique quam dictum. Sed non vehicula nulla. Fusce malesuada
            sagittis nisi, quis posuere nibh laoreet a.
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Terms;
