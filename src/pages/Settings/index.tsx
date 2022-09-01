import './style.scss';
import type { AppInfo } from '@capacitor/app';
import { App } from '@capacitor/app';
import { Device } from '@capacitor/device';
import type { DeviceInfo } from '@capacitor/device/dist/esm/definitions';
import { IonContent, IonGrid, IonIcon, IonItem, IonList, IonListHeader, IonPage } from '@ionic/react';
import { chevronForwardOutline } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import type { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router';

import CurrencySearch from '../../components/CurrencySearch';
import DenominationSearch from '../../components/DenominationSearch';
import Header from '../../components/Header';
import { routerLinks } from '../../routes';

const Settings: React.FC<RouteComponentProps> = ({ history }) => {
  const { currency, unitLBTC } = useSelector((state: any) => ({
    currency: state.settings.currency,
    unitLBTC: state.settings.denominationLBTC,
  }));
  const [currencySearchOpen, setCurrencySearchOpen] = useState(false);
  const [LBTCUnitSearchOpen, setLBTCUnitSearchOpen] = useState(false);
  const [appVersion, setAppVersion] = useState<string>();
  const { t } = useTranslation();

  useEffect(() => {
    Device.getInfo().then(({ platform }: DeviceInfo) => {
      if (platform === 'web') {
        setAppVersion('TDex App - web version');
        return;
      }
      App.getInfo().then(({ name, version, build }: AppInfo) => {
        setAppVersion(`${name} ${version} ${build}`);
      });
    });
  }, []);

  // const handleThemeChange = (e: any) => {
  //   const { checked } = e.detail;
  //   const newTheme = checked ? 'dark' : 'light';
  //   dispatch(setTheme(newTheme));
  // };

  return (
    <IonPage id="settings">
      <IonContent>
        <IonGrid>
          <Header title="Settings" hasBackButton={false} isTitleLarge={true} />
          <IonList>
            <IonListHeader>{t('settings.general.title')}</IonListHeader>
            <IonItem onClick={() => history.push('/account')}>
              <span>{t('settings.general.account.menuTitle')}</span>
              <IonIcon icon={chevronForwardOutline} color="text-color" slot="end" className="ion-no-margin" />
            </IonItem>

            <IonItem
              onClick={() => {
                history.push('/liquidity-provider');
              }}
            >
              <span>{t('settings.general.manageLiquidityProvider.menuTitle')}</span>
              <IonIcon icon={chevronForwardOutline} color="text-color" slot="end" className="ion-no-margin" />
            </IonItem>

            <IonItem onClick={() => setLBTCUnitSearchOpen(true)}>
              <span>{t('settings.general.unit.menuTitle')}</span>
              <IonItem slot="end" className="ion-no-padding ion-no-margin">
                <span className="chosen-currency green-label">{unitLBTC}</span>
                <IonIcon icon={chevronForwardOutline} color="text-color" className="ion-no-margin" />
              </IonItem>
            </IonItem>

            <IonItem onClick={() => setCurrencySearchOpen(true)}>
              <span>{t('settings.general.defaultCurrency.menuTitle')}</span>
              <IonItem slot="end" className="ion-no-padding ion-no-margin">
                <span className="chosen-currency green-label">{currency.value.toUpperCase()}</span>
                <IonIcon icon={chevronForwardOutline} color="text-color" className="ion-no-margin" />
              </IonItem>
            </IonItem>

            <IonItem onClick={() => history.push(routerLinks.explorers)}>
              <span>{t('settings.general.explorers.menuTitle')}</span>
              <IonIcon icon={chevronForwardOutline} color="text-color" slot="end" className="ion-no-margin" />
            </IonItem>

            <IonItem onClick={() => history.push(routerLinks.network)}>
              <span>{t('settings.general.network.menuTitle')}</span>
              <IonIcon icon={chevronForwardOutline} color="text-color" slot="end" className="ion-no-margin" />
            </IonItem>

            <IonItem onClick={() => history.push(routerLinks.torProxy)}>
              <span>{t('settings.general.torProxy.menuTitle')}</span>
              <IonIcon icon={chevronForwardOutline} color="text-color" slot="end" className="ion-no-margin" />
            </IonItem>

            <IonItem onClick={() => history.push(routerLinks.deepRestoration)}>
              <span>{t('settings.general.deepRestoration.menuTitle')}</span>
              <IonIcon icon={chevronForwardOutline} color="text-color" slot="end" className="ion-no-margin" />
            </IonItem>

            <IonItem onClick={() => history.push(routerLinks.claimPegin)}>
              <span>{t('settings.general.claim.menuTitle')}</span>
              <IonIcon icon={chevronForwardOutline} color="text-color" slot="end" className="ion-no-margin" />
            </IonItem>

            <IonItem onClick={() => history.push(routerLinks.language)}>
              <span>{t('settings.general.language.menuTitle')}</span>
              <IonIcon icon={chevronForwardOutline} color="text-color" slot="end" className="ion-no-margin" />
            </IonItem>

            {/*<IonItem className="list-item">
              <div
                // https://github.com/ionic-team/ionic-framework/issues/21939#issuecomment-694259307
                tabIndex={0}
              ></div>
              <div className="item-main-info">
                <div className="item-start">
                  <div className="main-row">Layout mode </div>
                </div>
                <div className="item-end">
                  <span className="chosen-theme green-label">{theme}</span>
                  <IonToggle
                    className="settings-toggle"
                    checked={theme === 'dark'}
                    onIonChange={handleThemeChange}
                  />
                </div>
              </div>
            </IonItem>*/}
          </IonList>
          {/**/}
          <IonList>
            <IonListHeader>{t('settings.support.title')}</IonListHeader>
            <IonItem onClick={() => history.push('/faq')}>
              <span>{t('settings.support.faq.menuTitle')}</span>
              <IonIcon icon={chevronForwardOutline} color="text-color" slot="end" className="ion-no-margin" />
            </IonItem>
            <IonItem onClick={() => history.push('/privacy')}>
              <span>{t('settings.support.privacy.menuTitle')}</span>
              <IonIcon icon={chevronForwardOutline} color="text-color" slot="end" className="ion-no-margin" />
            </IonItem>
            <IonItem onClick={() => history.push('/terms')}>
              <span>{t('settings.support.termsConditions.menuTitle')}</span>
              <IonIcon icon={chevronForwardOutline} color="text-color" slot="end" className="ion-no-margin" />
            </IonItem>
          </IonList>
          <p className="app-version">{appVersion}</p>
          {/**/}
          <CurrencySearch
            isOpen={currencySearchOpen}
            close={(ev: any) => {
              ev?.preventDefault();
              setCurrencySearchOpen(false);
            }}
          />
          <DenominationSearch
            isOpen={LBTCUnitSearchOpen}
            close={(ev: any) => {
              ev?.preventDefault();
              setLBTCUnitSearchOpen(false);
            }}
          />
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Settings);
