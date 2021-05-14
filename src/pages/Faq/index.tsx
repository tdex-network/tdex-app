import React from 'react';
import { RouteComponentProps } from 'react-router';
import { IonContent, IonPage } from '@ionic/react';
import Header from '../../components/Header';
import './style.scss';

const Faq: React.FC<RouteComponentProps> = () => {
  return (
    <IonPage>
      <IonContent className="main-content">
        <Header title="FAQ" hasBackButton={true} />
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
