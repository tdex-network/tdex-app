import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useAppState } from '@capacitor-community/react-hooks/app';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import React, { useEffect } from 'react';
import { Redirect, Route } from 'react-router';

import Loader from './components/Loader';
import { PinModalClaimPegin } from './components/PinModal/PinModalClaimPegin';
import { Toasts } from './components/Toasts';
import BackupOnboarding from './pages/Backup/backup-onboarding';
import Homescreen from './pages/Homescreen';
import PinSetting from './pages/PinSetting';
import { RestoreWallet } from './pages/RestoreWallet';
import { ShowMnemonicOnboarding } from './pages/ShowMnemonic/ShowMnemonicOnboarding';
import Tabs from './pages/Tabs';
import { chainSource } from './services/chainSource';
import { useAppStore } from './store/appStore';
import { useWalletStore } from './store/walletStore';

setupIonicReact();

export const App: React.FC = () => {
  const isAppInitialized = useAppStore((state) => state.isAppInitialized);
  const isSignedUp = useAppStore.getState().isSignedUp;
  const setIsSignedUp = useAppStore((state) => state.setIsSignedUp);
  const setIsAppInitialized = useAppStore((state) => state.setIsAppInitialized);
  const isAuthorized = useWalletStore((state) => state.isAuthorized);
  const unlockOutpoints = useWalletStore((state) => state.unlockOutpoints);
  //
  const appState = useAppState();

  useEffect(() => {
    if (!appState.state) {
      unlockOutpoints();
    }
  }, [appState.state, unlockOutpoints]);

  useEffect(() => {
    (async () => {
      try {
        document.body.classList.add('dark');
        if (Capacitor.isPluginAvailable('StatusBar')) {
          await StatusBar.setBackgroundColor({ color: '#333333' });
        }
      } catch (err) {
        console.error(err);
      }
      //
      try {
        if (Capacitor.isPluginAvailable('StatusBar')) {
          await StatusBar.setOverlaysWebView({ overlay: false });
        }
      } catch (err) {
        console.error(err);
      }
      //
      try {
        if (Capacitor.isPluginAvailable('StatusBar')) {
          await StatusBar.setStyle({
            style: Style.Dark,
          });
        }
      } catch (err) {
        console.error(err);
      }
      setIsSignedUp(true);
      if (!isAppInitialized) setIsAppInitialized(true);
    })();
  }, [isAppInitialized, setIsAppInitialized, setIsSignedUp]);

  useEffect(() => {
    if (isAppInitialized && isSignedUp) {
      // We instantiate ws here because we need to wait for websocketExplorerURL to be set
      chainSource.createWebsocketInstance();
    }
  }, [isAppInitialized, isSignedUp]);

  return (
    <IonApp>
      <IonReactRouter>
        <Loader showLoading={!isAppInitialized} />
        {/* RouterOutlet will render depending on path */}
        {isAuthorized ? (
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
        {/* Toasts component displays toasts from store */}
        <Toasts />
        <PinModalClaimPegin />
      </IonReactRouter>
    </IonApp>
  );
};
