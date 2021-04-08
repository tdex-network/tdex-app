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

const Faq: React.FC<RouteComponentProps> = ({ history }) => {
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
          <IonTitle>FAQ</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="main-content">
        <div className="content">
          <h4>Lorem ipsum ?</h4>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
            posuere orci sit amet dignissim interdum.
          </p>
          <h4>Lorem ipsum ?</h4>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
            posuere orci sit amet dignissim interdum.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
            posuere orci sit amet dignissim interdum.
          </p>
          <h4>Lorem ipsum ?</h4>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
            posuere orci sit amet dignissim interdum.
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Faq;
