import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

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
/* Customization */
import './theme/font.scss';
import './theme/components/ionic/index.scss';
import './theme/global.scss';
import './theme/variables.scss';
import './theme/components/search.scss';
import './theme/components/listItem.scss';
/* Store */
import AppContainer from './redux/containers/appContainer';
import rootSaga from './redux/saga';
import { sagaMiddleware, store } from './redux/store';

sagaMiddleware.run(rootSaga);

ReactDOM.render(
  <Provider store={store}>
    <AppContainer />
  </Provider>,
  document.getElementById('root')
);
