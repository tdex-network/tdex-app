import {
  IonContent,
  IonList,
  IonHeader,
  IonItem,
  IonPage,
  IonTitle,
  IonToolbar,
  IonListHeader,
  IonToggle,
  IonModal,
  IonButton,
  IonLabel,
  IonInput,
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { IconClose, IconRightArrow } from '../../components/icons';
import { RouteComponentProps, withRouter } from 'react-router';
import './style.scss';
import PageDescription from '../../components/PageDescription';
import {
  setElectrumServer,
  storeTheme,
} from '../../redux/actions/settingsActions';
import { useDispatch, useSelector } from 'react-redux';
import PinModal from '../../components/PinModal';
import { getMnemonicFromSecureStorage } from '../../utils/storage-helper';
import { addErrorToast } from '../../redux/actions/toastActions';
import { onPressEnterKeyCloseKeyboard } from '../../utils/keyboard';
import { Plugins } from '@capacitor/core';
import CurrencySearch from '../../components/CurrencySearch';
import DenominationSearch from '../../components/DenominationSearch';
const { Device } = Plugins;

const Settings: React.FC<RouteComponentProps> = ({ history }) => {
  const { explorerUrl, theme, currency, unitLBTC } = useSelector(
    (state: any) => ({
      explorerUrl: state.settings.explorerUrl,
      currency: state.settings.currency,
      theme: state.settings.theme,
      unitLBTC: state.settings.denominationLBTC,
    })
  );
  const [showExplorerModal, setShowExplorerModal] = useState(false);
  const [explorerValue, setExplorerValue] = useState(explorerUrl);
  const [modalOpen, setModalOpen] = useState(false);
  const [currencySearchOpen, setCurrencySearchOpen] = useState(false);
  const [LBTCUnitSearchOpen, setLBTCUnitSearchOpen] = useState(false);
  const [appVersion, setAppVersion] = useState<string>();

  useEffect(() => {
    Device.getInfo().then((info) => {
      if (info.platform === 'web') {
        setAppVersion('TDex App - web version');
        return;
      }
      setAppVersion(`${info.appName} ${info.appVersion} ${info.appBuild}`);
    });
  });

  const dispatch = useDispatch();
  const handleExplorerChange = (e: any) => {
    const { value } = e.detail;
    setExplorerValue(value);
  };

  const handleThemeChange = (e: any) => {
    const { checked } = e.detail;
    const newTheme = checked ? 'dark' : 'light';
    dispatch(storeTheme(newTheme));
  };

  const onPinConfirm = (pin: string) => {
    getMnemonicFromSecureStorage(pin)
      .then(() => {
        history.push(`/account/${pin}`);
        setModalOpen(false);
      })
      .catch((e) => {
        dispatch(addErrorToast(e));
        console.error(e);
      });
  };

  return (
    <IonPage>
      <PinModal
        open={modalOpen}
        title="Unlock your seed"
        description="Enter your secret PIN to unlock your wallet."
        onConfirm={onPinConfirm}
        onClose={() => {
          setModalOpen(false);
        }}
      />
      <div className="gradient-background"></div>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="settings">
        <IonList>
          <IonListHeader>General</IonListHeader>
          <IonItem
            className="list-item"
            onClick={() => {
              setModalOpen(true);
            }}
          >
            <div
              // https://github.com/ionic-team/ionic-framework/issues/21939#issuecomment-694259307
              tabIndex={0}
            ></div>
            <div className="item-main-info">
              <div className="item-start">
                <div className="main-row">Account </div>
              </div>
              <div className="item-end">
                <IconRightArrow
                  className="next-icon"
                  fill="#fff"
                  width="7"
                  height="12"
                  viewBox="0 0 7 12"
                />
              </div>
            </div>
          </IonItem>
          <IonItem
            className="list-item"
            onClick={() => {
              history.push('/liquidity-provider');
            }}
          >
            <div
              // https://github.com/ionic-team/ionic-framework/issues/21939#issuecomment-694259307
              tabIndex={0}
            ></div>
            <div className="item-main-info">
              <div className="item-start">
                <div className="main-row">Manage liquidity provider </div>
              </div>
              <div className="item-end">
                <IconRightArrow
                  className="next-icon"
                  fill="#fff"
                  width="7"
                  height="12"
                  viewBox="0 0 7 12"
                />
              </div>
            </div>
          </IonItem>
          <IonItem
            className="list-item"
            onClick={() => setLBTCUnitSearchOpen(true)}
          >
            <div
              // https://github.com/ionic-team/ionic-framework/issues/21939#issuecomment-694259307
              tabIndex={0}
            ></div>
            <div className="item-main-info">
              <div className="item-start">
                <div className="main-row">L-BTC unit</div>
              </div>
              <div className="item-end">
                <span className="chosen-currency green-label">{unitLBTC}</span>
                <IconRightArrow
                  className="next-icon"
                  fill="#fff"
                  width="7"
                  height="12"
                  viewBox="0 0 7 12"
                />
              </div>
            </div>
          </IonItem>

          <IonItem
            className="list-item"
            onClick={() => setCurrencySearchOpen(true)}
          >
            <div
              // https://github.com/ionic-team/ionic-framework/issues/21939#issuecomment-694259307
              tabIndex={0}
            ></div>
            <div className="item-main-info">
              <div className="item-start">
                <div className="main-row">Default currency </div>
              </div>
              <div className="item-end">
                <span className="chosen-currency green-label">
                  {(currency.value as string).toUpperCase()}
                </span>
                <IconRightArrow
                  className="next-icon"
                  fill="#fff"
                  width="7"
                  height="12"
                  viewBox="0 0 7 12"
                />
              </div>
            </div>
          </IonItem>

          <IonItem
            className="list-item"
            onClick={() => {
              setShowExplorerModal(true);
            }}
          >
            <div
              // https://github.com/ionic-team/ionic-framework/issues/21939#issuecomment-694259307
              tabIndex={0}
            ></div>
            <div className="item-main-info">
              <div className="item-start">
                <div className="main-row">Electrum server </div>
              </div>
              <div className="item-end">
                <IconRightArrow
                  className="next-icon"
                  fill="#fff"
                  width="7"
                  height="12"
                  viewBox="0 0 7 12"
                />
              </div>
            </div>
          </IonItem>
          <IonItem className="list-item">
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
          </IonItem>
        </IonList>
        <IonList>
          <IonListHeader>Support</IonListHeader>
          <IonItem
            className="list-item"
            onClick={() => {
              history.push('/faq');
            }}
          >
            <div
              // https://github.com/ionic-team/ionic-framework/issues/21939#issuecomment-694259307
              tabIndex={0}
            ></div>
            <div className="item-main-info">
              <div className="item-start">
                <div className="main-row">FAQ </div>
              </div>
              <div className="item-end">
                <IconRightArrow
                  className="next-icon"
                  fill="#fff"
                  width="7"
                  height="12"
                  viewBox="0 0 7 12"
                />
              </div>
            </div>
          </IonItem>
          <IonItem
            className="list-item"
            onClick={() => {
              history.push('/terms');
            }}
          >
            <div
              // https://github.com/ionic-team/ionic-framework/issues/21939#issuecomment-694259307
              tabIndex={0}
            ></div>
            <div className="item-main-info">
              <div className="item-start">
                <div className="main-row">Terms & Conditions </div>
              </div>
              <div className="item-end">
                <IconRightArrow
                  className="next-icon"
                  fill="#fff"
                  width="7"
                  height="12"
                  viewBox="0 0 7 12"
                />
              </div>
            </div>
          </IonItem>
        </IonList>
        <p className="app-version">{appVersion}</p>
        <IonModal
          isOpen={showExplorerModal}
          cssClass="modal-big withdrawal"
          keyboardClose={false}
          onDidDismiss={() => setShowExplorerModal(false)}
        >
          <div className="gradient-background" />
          <IonHeader>
            <IonToolbar className="with-back-button">
              <IonButton
                style={{ zIndex: 10 }}
                onClick={() => {
                  setShowExplorerModal(false);
                }}
              >
                <IconClose />
              </IonButton>
              <IonTitle>Electrum server</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <PageDescription title="Electrum">
              <p>Set explorer url for electrum server</p>
            </PageDescription>
            <IonInput
              className="explorer-input"
              enterkeyhint="done"
              onKeyDown={onPressEnterKeyCloseKeyboard}
              inputmode="text"
              value={explorerValue}
              onIonChange={handleExplorerChange}
            />
            <div className="buttons">
              <IonButton
                onClick={() => {
                  dispatch(setElectrumServer(explorerValue));
                  setShowExplorerModal(false);
                }}
                type="button"
                className="main-button"
                disabled={!explorerValue || !explorerValue.length}
              >
                Save
              </IonButton>
            </div>
            <div className="align-center">
              <IonButton
                onClick={() => {
                  setShowExplorerModal(false);
                }}
                className="cancel-button"
              >
                <IonLabel>Cancel</IonLabel>
              </IonButton>
            </div>
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
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Settings);
