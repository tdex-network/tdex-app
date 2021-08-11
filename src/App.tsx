import { useAppState } from '@capacitor-community/react-hooks/app';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Redirect, Route } from 'react-router';

import Loader from './components/Loader';
import BackupOnboarding from './pages/Backup/backup-onboarding';
import Homescreen from './pages/Homescreen';
import PinSetting from './pages/PinSetting';
import Tabs from './pages/Tabs';
import { initApp } from './redux/actions/appActions';
import { unlockUtxos } from './redux/actions/walletActions';
import PinModalClaimPegin from './redux/containers/pinModalClaimPeginContainer';
import RestoreWallet from './redux/containers/restoreWalletContainer';
import ShowMnemonicOnboarding from './redux/containers/showMnemonicOnboadingContainer';
import Toasts from './redux/containers/toastsContainer';

interface AppProps {
  appInit: boolean;
  isAuth: boolean;
  theme: string;
}

const App: React.FC<AppProps> = ({ appInit, isAuth, theme }) => {
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
        if (Capacitor.isPluginAvailable('StatusBar')) {
          await StatusBar.setBackgroundColor({ color: '#333333' });
        }
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
        <Loader showLoading={!appInit} />
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
            <Route path="/onboarding/show-mnemonic" component={ShowMnemonicOnboarding} />
          </IonRouterOutlet>
        )}

        {/* Toasts component displays toasts from redux state */}
        <Toasts />
        <PinModalClaimPegin />
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
