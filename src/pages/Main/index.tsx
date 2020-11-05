import { IonContent, IonPage, IonRouterOutlet } from '@ionic/react';
import React from 'react';
import { Redirect, Route } from 'react-router';

import HomeScreen from '../Homescreen';
import Login from '../Login';
import RestoreWallet from '../RestoreWallet';

interface MainInterface {
  setIsAuth: (value: boolean) => void;
}

const Main: React.FC<MainInterface> = ({ setIsAuth }) => {
  return (
    <IonPage>
      <IonContent>
        <IonRouterOutlet>
          <Route path="/homescreen" component={HomeScreen} />
          <Route
            path="/login"
            component={() => <Login setIsAuth={setIsAuth} />}
          />
          <Route path="/restore" component={RestoreWallet} />
          <Redirect exact from="/" to="/homescreen" />
        </IonRouterOutlet>
      </IonContent>
    </IonPage>
  );
};

export default Main;
