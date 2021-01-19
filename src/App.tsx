import React, { useEffect } from 'react';
import { IonApp, IonLoading } from '@ionic/react';
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
import { useDispatch, useSelector } from 'react-redux';
import { initApp, signIn } from './redux/actions/appActions';
import PinModal from './components/PinModal';

const App: React.FC = () => {
  const { isAuth, appInit, isSignedUp, theme } = useSelector((state: any) => ({
    isAuth: state.wallet.isAuth,
    appInit: state.app.appInit,
    isSignedUp: state.app.isSignedUp,
    theme: state.settings.theme,
  }));
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

    setupApp();
    dispatch(initApp());
  }, []);

  return (
    <IonApp className={theme}>
      <IonReactRouter>
        <IonLoading
          cssClass="my-custom-class"
          isOpen={!appInit}
          message={'Please wait...'}
        />
        {isAuth ? <Tabs /> : <Main />}
        {isSignedUp && !isAuth && (
          <PinModal
            openModal={isSignedUp && !isAuth}
            title={'Set PIN'}
            onConfirm={(pin: string) => {
              dispatch(signIn(pin));
            }}
          />
        )}
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
