import React, { useEffect } from 'react';
import { IonApp, IonLoading, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { useDispatch, useSelector } from 'react-redux';
import { initApp } from './redux/actions/appActions';
import Toasts from './redux/containers/toastsContainer';
import { Redirect, Route } from 'react-router';
import Homescreen from './pages/Homescreen';
import RestoreWallet from './pages/RestoreWallet';
import { useAppState } from '@capacitor-community/react-hooks/app';
import { Capacitor, Plugins } from '@capacitor/core';
import { unlockUtxos } from './redux/actions/walletActions';
import BackupOnboarding from './pages/Backup/backup-onboarding';
import ShowMnemonicOnboarding from './redux/containers/showMnemonicOnboadingContainer';
import PinSetting from './pages/PinSetting';
import Tabs from './pages/Tabs';
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
        document.body.classList.add(theme);
        await StatusBar.setBackgroundColor({ color: '#333333' });
      } catch (err) {
        console.error(err);
      }
      try {
        if (Capacitor.isPluginAvailable('StatusBar')) {
          await StatusBar.setOverlaysWebView({ overlay: false });
        }
      } catch (err) {
        console.error(err);
      }
      try {
        await ScreenOrientation.lock(ScreenOrientation.ORIENTATIONS.PORTRAIT);
      } catch (err) {
        console.error(err);
      }
    };

    setupApp()
      .then(() => {
        dispatch(initApp());
      })
      .catch(console.error);
  }, []);

  return (
    <IonApp>
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
            <Route path="/restore" component={RestoreWallet} />
            <Route path="/onboarding/backup" component={BackupOnboarding} />
            <Route path="/onboarding/pin-setting" component={PinSetting} />
            <Route
              path="/onboarding/show-mnemonic"
              component={ShowMnemonicOnboarding}
            />
          </IonRouterOutlet>
        )}

        {/* Toasts component displays toasts from redux state */}
        <Toasts />
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
