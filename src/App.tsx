import React, { useEffect, useState, useRef } from 'react';
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

// import Tabs from './pages/Tabs';
import Main from './pages/Main';

import { Plugins } from '@capacitor/core';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

const App: React.FC = () => {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const { StatusBar } = Plugins;
    StatusBar.setBackgroundColor({color: "#333333"});

    try {
      ScreenOrientation.lock(ScreenOrientation.ORIENTATIONS.PORTRAIT);
    } catch (err) {
      console.log(err);
    }
    
  }, []);

  return (
    <IonApp>
        <IonReactRouter>
          {isAuth ? (
            <></>
          ) : (
            <Main setIsAuth={setIsAuth}/>
          )}
        </IonReactRouter>
    </IonApp>
  )
};

export default App;
