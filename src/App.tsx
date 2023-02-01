import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useAppState } from '@capacitor-community/react-hooks/app';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Redirect, Route } from 'react-router';

import Loader from './components/Loader';
import PinModalClaimPegin from './components/PinModal/PinModalClaimPegin';
import Toasts from './components/Toasts';
import BackupOnboarding from './pages/Backup/backup-onboarding';
import Homescreen from './pages/Homescreen';
import PinSetting from './pages/PinSetting';
import RestoreWallet from './pages/RestoreWallet';
import ShowMnemonicOnboarding from './pages/ShowMnemonic/ShowMnemonicOnboarding';
import Tabs from './pages/Tabs';
import { initApp } from './redux/actions/appActions';
import { unlockUtxos } from './redux/actions/walletActions';
import { useTypedDispatch } from './redux/hooks';
import type { RootState } from './redux/types';

interface AppProps {
  appInit: boolean;
  isAuth: boolean;
  theme: string;
}

setupIonicReact();

const App: React.FC<AppProps> = ({ appInit, isAuth, theme }) => {
  const dispatch = useTypedDispatch();
  const appState = useAppState();

  useEffect(() => {
    if (!appState.state) {
      dispatch(unlockUtxos());
    }
  }, [appState.state, dispatch]);

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
      try {
        if (Capacitor.isPluginAvailable('StatusBar')) {
          await StatusBar.setStyle({
            style: Style.Dark,
          });
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
  }, [dispatch, theme]);

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

const mapStateToProps = (state: RootState) => {
  return {
    appInit: state.app.appInit,
    isAuth: state.wallet.isAuth,
    theme: state.settings.theme,
  };
};

export default connect(mapStateToProps)(App);
