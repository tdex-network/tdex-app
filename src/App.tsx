import React, { useEffect } from 'react';
import { IonApp, IonLoading, IonRouterOutlet, isPlatform } from '@ionic/react';
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

import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { useDispatch, useSelector } from 'react-redux';
import { initApp } from './redux/actions/appActions';
import Toasts from './redux/containers/toastsContainer';
import { Redirect, Route } from 'react-router';
import Homescreen from './pages/Homescreen';
import Login from './pages/Login';
import RestoreWallet from './pages/RestoreWallet';
import { NavigationBar } from '@ionic-native/navigation-bar';
import classNames from 'classnames';
import { useAppState } from '@capacitor-community/react-hooks/app';
import { Plugins } from '@capacitor/core';
import { unlockUtxos } from './redux/actions/walletActions';
const { StatusBar } = Plugins;

const App: React.FC = () => {
  const { isAuth, appInit, theme } = useSelector((state: any) => ({
    isAuth: state.wallet.isAuth,
    appInit: state.app.appInit,
    theme: state.settings.theme,
  }));
  const dispatch = useDispatch();
  const appState = useAppState();

  useEffect(() => {
    if (!appState.state) {
      dispatch(unlockUtxos());
    }
  }, [appState.state]);

  useEffect(() => {
    const setupApp = async () => {
      try {
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setBackgroundColor({ color: '#333333' });
        if (isPlatform('android')) {
          await NavigationBar.setUp(true);
        }
      } catch (err) {
        console.log(err);
      }

      try {
        await ScreenOrientation.lock(ScreenOrientation.ORIENTATIONS.PORTRAIT);
      } catch (err) {
        console.log(err);
      }
    };

    setupApp();
    dispatch(initApp());
  }, []);

  return (
    <IonApp className={classNames(['app', theme])}>
      <IonReactRouter>
        <IonLoading
          cssClass="my-custom-class"
          isOpen={!appInit}
          message={'Please wait...'}
        />
        {/* RouterOutlet will render depending on path */}
        {isAuth ? (
          <Tabs />
        ) : (
          <IonRouterOutlet animated={false}>
            <Redirect exact from="/" to="/homescreen" />
            <Route path="/homescreen" component={Homescreen} />
            <Route path="/login" component={Login} />
            <Route path="/restore" component={RestoreWallet} />
          </IonRouterOutlet>
        )}

        {/* Toasts component displays toasts from redux state */}
        <Toasts />
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
