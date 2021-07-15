import {
  IonPage,
  IonContent,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonRouterOutlet,
} from '@ionic/react';
import classNames from 'classnames';
import React from 'react';
import type { RouteComponentProps } from 'react-router';
import { Redirect, Route, withRouter } from 'react-router';

import { ROUTES, TABS } from '../../routes';
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
            {ROUTES.map(item => (
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
            <Redirect exact from="/onboarding/pin-setting" to="/wallet" />
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            {TABS.map((item, index) => (
              <IonTabButton
                data-cy={`tab-${item.name}`}
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
