import type { AppInfo } from '@capacitor/app';
import { App } from '@capacitor/app';
import { Device } from '@capacitor/device';
import type { DeviceInfo } from '@capacitor/device/dist/esm/definitions';
import {
  IonContent,
  IonList,
  IonItem,
  IonPage,
  IonListHeader,
  IonModal,
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
} from '@ionic/react';
import { chevronForwardOutline } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router';

import ButtonsMainSub from '../../components/ButtonsMainSub';
import CurrencySearch from '../../components/CurrencySearch';
import DenominationSearch from '../../components/DenominationSearch';
import Header from '../../components/Header';
import PageDescription from '../../components/PageDescription';
import { setElectrumServer } from '../../redux/actions/settingsActions';
import { routerLinks } from '../../routes';
import { onPressEnterKeyCloseKeyboard } from '../../utils/keyboard';

import './style.scss';

const Settings: React.FC<RouteComponentProps> = ({ history }) => {
  const { explorerUrl, currency, unitLBTC } = useSelector((state: any) => ({
    explorerUrl: state.settings.explorerUrl,
    currency: state.settings.currency,
    theme: state.settings.theme,
    unitLBTC: state.settings.denominationLBTC,
  }));
  const [showExplorerModal, setShowExplorerModal] = useState(false);
  const [explorerValue, setExplorerValue] = useState(explorerUrl);
  const [currencySearchOpen, setCurrencySearchOpen] = useState(false);
  const [LBTCUnitSearchOpen, setLBTCUnitSearchOpen] = useState(false);
  const [appVersion, setAppVersion] = useState<string>();

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
  });

  const dispatch = useDispatch();
  const handleExplorerChange = (e: any) => {
    const { value } = e.detail;
    setExplorerValue(value);
  };

  // const handleThemeChange = (e: any) => {
  //   const { checked } = e.detail;
  //   const newTheme = checked ? 'dark' : 'light';
  //   dispatch(storeTheme(newTheme));
  // };

  return (
    <IonPage id="settings">
      <IonContent>
        <IonGrid>
          <Header title="Settings" hasBackButton={false} isTitleLarge={true} />
          <IonList>
            <IonListHeader>General</IonListHeader>
            <IonItem onClick={() => history.push('/account')}>
              <span>Account</span>
              <IonIcon
                icon={chevronForwardOutline}
                color="text-color"
                slot="end"
                className="ion-no-margin"
              />
            </IonItem>

            <IonItem
              onClick={() => {
                history.push('/liquidity-provider');
              }}
            >
              <span>Manage liquidity provider</span>
              <IonIcon
                icon={chevronForwardOutline}
                color="text-color"
                slot="end"
                className="ion-no-margin"
              />
            </IonItem>

            <IonItem onClick={() => setLBTCUnitSearchOpen(true)}>
              <span>L-BTC unit</span>
              <IonItem slot="end" className="ion-no-padding ion-no-margin">
                <span className="chosen-currency green-label">{unitLBTC}</span>
                <IonIcon
                  icon={chevronForwardOutline}
                  color="text-color"
                  className="ion-no-margin"
                />
              </IonItem>
            </IonItem>

            <IonItem onClick={() => setCurrencySearchOpen(true)}>
              <span>Default currency</span>
              <IonItem slot="end" className="ion-no-padding ion-no-margin">
                <span className="chosen-currency green-label">
                  {currency.value.toUpperCase()}
                </span>
                <IonIcon
                  icon={chevronForwardOutline}
                  color="text-color"
                  className="ion-no-margin"
                />
              </IonItem>
            </IonItem>

            <IonItem
              onClick={() => {
                setShowExplorerModal(true);
              }}
            >
              <span>Electrum server</span>
              <IonIcon
                icon={chevronForwardOutline}
                color="text-color"
                slot="end"
                className="ion-no-margin"
              />
            </IonItem>

            <IonItem onClick={() => history.push(routerLinks.deepRestoration)}>
              <span>Deep restoration</span>
              <IonIcon
                icon={chevronForwardOutline}
                color="text-color"
                slot="end"
                className="ion-no-margin"
              />
            </IonItem>

            <IonItem
              onClick={() => {
                history.push(routerLinks.claimPegin);
              }}
            >
              <span>Claim Liquid Bitcoin</span>
              <IonIcon
                icon={chevronForwardOutline}
                color="text-color"
                slot="end"
                className="ion-no-margin"
              />
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
          <IonList>
            <IonListHeader>Support</IonListHeader>
            <IonItem
              onClick={() => {
                history.push('/faq');
              }}
            >
              <span>FAQ</span>
              <IonIcon
                icon={chevronForwardOutline}
                color="text-color"
                slot="end"
                className="ion-no-margin"
              />
            </IonItem>
            <IonItem
              onClick={() => {
                history.push('/privacy');
              }}
            >
              <span>Privacy</span>
              <IonIcon
                icon={chevronForwardOutline}
                color="text-color"
                slot="end"
                className="ion-no-margin"
              />
            </IonItem>
            <IonItem
              onClick={() => {
                history.push('/terms');
              }}
            >
              <span>Terms & Conditions</span>
              <IonIcon
                icon={chevronForwardOutline}
                color="text-color"
                slot="end"
                className="ion-no-margin"
              />
            </IonItem>
          </IonList>
          <p className="app-version">{appVersion}</p>

          {/* Electrum Server */}
          <IonModal
            isOpen={showExplorerModal}
            cssClass="modal-big withdrawal"
            keyboardClose={false}
            onDidDismiss={() => setShowExplorerModal(false)}
          >
            <IonContent>
              <IonGrid>
                <Header
                  title="ELECTRUM SERVER"
                  hasBackButton={false}
                  hasCloseButton={true}
                  handleClose={() => {
                    setShowExplorerModal(false);
                  }}
                />
                <PageDescription
                  description="Set explorer url for electrum server"
                  title="Electrum"
                />
                <IonRow>
                  <IonCol size="10" offset="1">
                    <IonItem>
                      <IonInput
                        enterkeyhint="done"
                        onKeyDown={onPressEnterKeyCloseKeyboard}
                        inputmode="text"
                        value={explorerValue}
                        onIonChange={handleExplorerChange}
                      />
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonRow className="ion-margin-vertical-x2">
                  <IonCol>
                    <ButtonsMainSub
                      className="ion-margin"
                      mainTitle="Save"
                      subTitle="Cancel"
                      mainOnClick={() => {
                        dispatch(setElectrumServer(explorerValue));
                        setShowExplorerModal(false);
                      }}
                      subOnClick={() => {
                        setShowExplorerModal(false);
                      }}
                      mainDisabled={!explorerValue || !explorerValue.length}
                    />
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonContent>
          </IonModal>

          <CurrencySearch
            isOpen={currencySearchOpen}
            close={() => setCurrencySearchOpen(false)}
          />

          <DenominationSearch
            isOpen={LBTCUnitSearchOpen}
            close={() => setLBTCUnitSearchOpen(false)}
          />
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Settings);
