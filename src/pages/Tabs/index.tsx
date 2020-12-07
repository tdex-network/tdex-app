import {
  IonPage,
  IonContent,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonRouterOutlet,
} from '@ionic/react';
import React, { useState } from 'react';
import { Redirect, Route } from 'react-router';
import classNames from 'classnames';

//routes
import { ROUTES, TABS } from '../../routes';

//style
import './style.scss';

const Tabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleChangeTab = (index: number) => {
    setActiveTab(index);
  };

  return (
    <IonPage>
      <IonContent>
        <IonTabs>
          <IonRouterOutlet>
            {ROUTES.map((item) => (
              <Route
                key={item.path}
                path={item.path}
                component={item.component}
                exact
              />
            ))}
            <Redirect exact from="/" to="/wallet" />
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            {TABS.map((item, index) => (
              <IonTabButton tab={item.path} href={item.path}>
                <div
                  onClick={() => handleChangeTab(index)}
                  className="tab-content"
                >
                  <item.icon
                    className={classNames('tab-icon', {
                      active: activeTab === index,
                    })}
                  />
                  {activeTab === index && <span className="indicator"></span>}
                </div>
              </IonTabButton>
            ))}
          </IonTabBar>
        </IonTabs>
      </IonContent>
    </IonPage>
  );
};

export default Tabs;
