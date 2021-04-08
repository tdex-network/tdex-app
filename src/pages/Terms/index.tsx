import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import React from 'react';
import { RouteComponentProps } from 'react-router';
import { IconBack } from '../../components/icons';
import './style.scss';

const Terms: React.FC<RouteComponentProps> = ({ history }) => {
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
