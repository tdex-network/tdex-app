import { IonContent, IonPage, IonRouterOutlet } from '@ionic/react';
import React from 'react';
import { Redirect, Route } from 'react-router';

import HomeScreen from '../Homescreen';
import Login from '../Login';
import RestoreWallet from '../RestoreWallet';

const Main: React.FC = () => {
  return (
    <IonPage>
      <IonContent>
        <IonRouterOutlet>
          <Route path="/homescreen" component={HomeScreen} />
          <Route path="/login" component={() => <Login />} />
          <Route path="/restore" component={RestoreWallet} />
          <Redirect exact from="/" to="/homescreen" />
        </IonRouterOutlet>
      </IonContent>
    </IonPage>
  );
};

export default Main;
