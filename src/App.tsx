import React, { useEffect } from 'react';
import { IonApp } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import * as bip39 from 'bip39';

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

import { Plugins, Storage } from '@capacitor/core';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { useDispatch, useSelector } from 'react-redux';
import {
  setIsAuth,
  setMnemonic,
  setAddress,
} from './redux/actions/walletActions';

const App: React.FC = () => {
  const isAuth = useSelector((state: any) => state.wallet.isAuth);
  const dispatch = useDispatch();

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
    };

    const getWallet = async (): Promise<{ value: string }> => {
      return Storage.get({ key: 'wallet' });
    };

    const getAddress = async (): Promise<{ value: string }> => {
      return Storage.get({ key: 'address' });
    };

    setupApp();

    getWallet().then((wallet) => {
      const walletObj = JSON.parse(wallet.value);
      if (walletObj) {
        getAddress()
          .then((address) => {
            const addressObj = JSON.parse(address.value);
            if (addressObj) {
              dispatch(setAddress(addressObj));
            }
            return address;
          })
          .then(() => {
            dispatch(setMnemonic(walletObj.mnemonic));
            dispatch(setIsAuth(true));
          });
      }
    });
  }, []);

  return (
    <IonApp>
      <IonReactRouter>{isAuth ? <Tabs /> : <Main />}</IonReactRouter>
    </IonApp>
  );
};

export default App;
