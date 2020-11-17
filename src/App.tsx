import React, { useEffect } from 'react';
import { IonApp } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/global.scss';

import Tabs from './pages/Tabs';
import Main from './pages/Main';

import { Plugins } from '@capacitor/core';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { useSelector } from 'react-redux';
import { Mnemonic, IdentityType } from 'tdex-sdk';

const App: React.FC = () => {
  const isAuth = useSelector((state: any) => state.wallet.isAuth);

  useEffect(() => {
    const setupApp = async () => {
      try {
        const { StatusBar } = Plugins;
        await StatusBar.setBackgroundColor({ color: '#333333' });
      } catch (err) {
        console.log(err);
      }

      try {
        await ScreenOrientation.lock(ScreenOrientation.ORIENTATIONS.PORTRAIT);
      } catch (err) {
        console.log(err);
      }

      const identity = new Mnemonic({
        chain: 'regtest',
        type: IdentityType.Mnemonic,
        value: {
          mnemonic:
            'sauce wire claw episode congress snake scheme test base debris resemble floor',
        },
      });
      console.log(
        'Receiving address: ',
        identity.getNextAddress().confidentialAddress
      );
    };

    setupApp();
  }, []);

  return (
    <IonApp>
      <IonReactRouter>{isAuth ? <Tabs /> : <Main />}</IonReactRouter>
    </IonApp>
  );
};

export default App;
