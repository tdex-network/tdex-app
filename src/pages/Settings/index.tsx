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
import React, { useState } from 'react';
import { IconClose, IconRightArrow } from '../../components/icons';
import { withRouter } from 'react-router';
import './style.scss';
import PageDescription from '../../components/PageDescription';
import {
  setElectrumServer,
  storeTheme,
} from '../../redux/actions/settingsActions';
import { useDispatch, useSelector } from 'react-redux';
import PinModal from '../../components/PinModal';
import { getMnemonicFromSecureStorage } from '../../utils/storage-helper';

const Settings: React.FC<any> = ({ history }) => {
  const { explorerUrl, theme } = useSelector((state: any) => ({
    explorerUrl: state.settings.explorerUrl,
    theme: state.settings.theme,
  }));
  const [showExplorerModal, setShowExplorerModal] = useState(false);
  const [explorerValue, setExplorerValue] = useState(explorerUrl);
  const [modalOpen, setModalOpen] = useState(false);
  const [pinError, setPinError] = useState<string>();

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
        setPinError(e);
        console.error(e);
      });
  };

  return (
    <IonPage>
      <PinModal
        error={pinError}
        onReset={() => setPinError(undefined)}
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
            onClick={() => {
              history.push('/currency');
            }}
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
                <span className="chosen-currency green-label">EUR</span>
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
        {showExplorerModal && (
          <IonModal
            isOpen={showExplorerModal}
            cssClass="modal-big withdrawal"
            keyboardClose={false}
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
                <IonTitle>Show Mnemonic</IonTitle>
              </IonToolbar>
            </IonHeader>
            <IonContent>
              <PageDescription title="Secret phrase">
                <p>Set explorer url for electrum server</p>
              </PageDescription>
              <IonInput
                type="text"
                value={explorerValue}
                onIonChange={handleExplorerChange}
              />
              <div className="buttons">
                <IonButton
                  onClick={() => dispatch(setElectrumServer(explorerValue))}
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
        )}
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Settings);
