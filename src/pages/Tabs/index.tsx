import {
  IonPage,
  IonContent,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonRouterOutlet,
} from '@ionic/react';
import React from 'react';
import { Redirect, Route, RouteComponentProps, withRouter } from 'react-router';
import classNames from 'classnames';

//routes
import { ROUTES, TABS } from '../../routes';

//style
import './style.scss';

const ROUTES_SORTED_BY_TAB: Record<string, string[]> = {
  wallet: ['wallet', 'operations', 'qrscanner', 'receive', 'withdraw'],
  exchange: ['exchange', 'tradesummary', 'history'],
  settings: ['settings', 'account', 'liquidity-provider', 'faq', 'terms'],
};

const Tabs: React.FC<RouteComponentProps> = ({ history, location }) => {
  const isActive = (name: string) => {
    const routes = ROUTES_SORTED_BY_TAB[name];
    for (const routeName of routes) {
      if (location.pathname.includes(routeName)) return true;
    }

    return false;
  };

  return (
    <IonPage>
      <IonContent>
        <IonTabs>
          <IonRouterOutlet animated={false}>
            {ROUTES.map((item) => (
              <Route
                key={item.path}
                path={item.path}
                component={item.component}
                exact
              />
            ))}
            <Redirect exact from="/" to="/wallet" />
            <Redirect exact from="/login" to="/wallet" />
            <Redirect exact from="/homescreen" to="/wallet" />
            <Redirect exact from="/restore" to="/wallet" />
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            {TABS.map((item, index) => (
              <IonTabButton
                selected={isActive(item.name)}
                tab={item.path}
                key={index}
              >
                <div
                  className="tab-content"
                  onClick={() => history.push(item.path)}
                >
                  <item.icon
                    className={classNames('tab-icon', {
                      active: isActive(item.name),
                    })}
                  />
                  {isActive(item.name) && <span className="indicator"></span>}
                </div>
              </IonTabButton>
            ))}
          </IonTabBar>
        </IonTabs>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Tabs);
