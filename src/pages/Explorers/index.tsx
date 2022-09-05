import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonRow,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import type { NetworkString } from 'tdex-sdk';

import Header from '../../components/Header';
import PageDescription from '../../components/PageDescription';
import {
  setElectrsBatchApi,
  setExplorerBitcoinAPI,
  setExplorerBitcoinUI,
  setExplorerLiquidAPI,
  setExplorerLiquidUI,
} from '../../redux/actions/settingsActions';
import { addSuccessToast } from '../../redux/actions/toastActions';
import { blockstreamExplorerEndpoints, configRegtest, mempoolExplorerEndpoints } from '../../redux/config';
import { useTypedDispatch } from '../../redux/hooks';
import type { SettingsState } from '../../redux/reducers/settingsReducer';
import type { RootState } from '../../redux/types';
import { capitalizeFirstLetter } from '../../utils/helpers';
import { onPressEnterKeyCloseKeyboard } from '../../utils/keyboard';

interface ExplorersProps {
  explorerLiquidAPI: string;
  explorerBitcoinAPI: string;
  explorerLiquidUI: string;
  explorerBitcoinUI: string;
  electrsBatchAPI: string;
  network: NetworkString;
}

const Explorers: React.FC<ExplorersProps> = ({
  explorerLiquidAPI,
  explorerBitcoinAPI,
  explorerLiquidUI,
  explorerBitcoinUI,
  electrsBatchAPI,
  network,
}) => {
  const [explorerGroup, setExplorerGroup] = useState<SettingsState['explorerLiquidAPI']>('');
  const [explorerBitcoinAPIInput, setExplorerBitcoinAPIInput] = useState<SettingsState['explorerBitcoinAPI']>('');
  const [explorerLiquidAPIInput, setExplorerLiquidAPIInput] = useState<SettingsState['explorerLiquidAPI']>('');
  const [explorerBitcoinUIInput, setExplorerBitcoinUIInput] = useState<SettingsState['explorerBitcoinUI']>('');
  const [explorerLiquidUIInput, setExplorerLiquidUIInput] = useState<SettingsState['explorerLiquidUI']>('');
  const [electrsBatchAPIInput, setElectrsBatchAPIInput] = useState<SettingsState['electrsBatchAPI']>('');

  const dispatch = useTypedDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    setExplorerBitcoinAPIInput(explorerBitcoinAPI);
    setExplorerLiquidAPIInput(explorerLiquidAPI);
    setExplorerBitcoinUIInput(explorerBitcoinUI);
    setExplorerLiquidUIInput(explorerLiquidUI);
    setElectrsBatchAPIInput(electrsBatchAPI);
  }, [explorerLiquidAPI, explorerBitcoinAPI, explorerLiquidUI, explorerBitcoinUI, electrsBatchAPI]);

  const handleExplorerChange = (e: any) => {
    const { value } = e.detail;
    setExplorerGroup(value);
    if (value === 'blockstream') {
      dispatch(setExplorerLiquidAPI(blockstreamExplorerEndpoints.liquid.explorerLiquidAPI));
      dispatch(setExplorerLiquidUI(blockstreamExplorerEndpoints.liquid.explorerLiquidUI));
      dispatch(setExplorerBitcoinAPI(blockstreamExplorerEndpoints.liquid.explorerBitcoinAPI));
      dispatch(setExplorerBitcoinUI(blockstreamExplorerEndpoints.liquid.explorerBitcoinUI));
      dispatch(setElectrsBatchApi(blockstreamExplorerEndpoints.liquid.electrsBatchAPI));
    } else if (value === 'blockstream-testnet') {
      dispatch(setExplorerLiquidAPI(blockstreamExplorerEndpoints.testnet.explorerLiquidAPI));
      dispatch(setExplorerLiquidUI(blockstreamExplorerEndpoints.testnet.explorerLiquidUI));
      dispatch(setExplorerBitcoinAPI(blockstreamExplorerEndpoints.testnet.explorerBitcoinAPI));
      dispatch(setExplorerBitcoinUI(blockstreamExplorerEndpoints.testnet.explorerBitcoinUI));
      dispatch(setElectrsBatchApi(blockstreamExplorerEndpoints.testnet.electrsBatchAPI));
    } else if (value === 'mempool') {
      dispatch(setExplorerLiquidAPI(mempoolExplorerEndpoints.liquid.explorerLiquidAPI));
      dispatch(setExplorerLiquidUI(mempoolExplorerEndpoints.liquid.explorerLiquidUI));
      dispatch(setExplorerBitcoinAPI(mempoolExplorerEndpoints.liquid.explorerBitcoinAPI));
      dispatch(setExplorerBitcoinUI(mempoolExplorerEndpoints.liquid.explorerBitcoinUI));
      dispatch(setElectrsBatchApi(mempoolExplorerEndpoints.liquid.electrsBatchAPI));
    } else if (value === 'mempool-testnet') {
      dispatch(setExplorerLiquidAPI(mempoolExplorerEndpoints.testnet.explorerLiquidAPI));
      dispatch(setExplorerLiquidUI(mempoolExplorerEndpoints.testnet.explorerLiquidUI));
      dispatch(setExplorerBitcoinAPI(mempoolExplorerEndpoints.testnet.explorerBitcoinAPI));
      dispatch(setExplorerBitcoinUI(mempoolExplorerEndpoints.testnet.explorerBitcoinUI));
      dispatch(setElectrsBatchApi(mempoolExplorerEndpoints.testnet.electrsBatchAPI));
    } else if (value === 'localhost') {
      dispatch(setExplorerLiquidAPI(configRegtest.explorers.explorerLiquidAPI));
      dispatch(setExplorerBitcoinAPI(configRegtest.explorers.explorerBitcoinAPI));
      dispatch(setExplorerBitcoinUI(configRegtest.explorers.explorerBitcoinUI));
      dispatch(setExplorerLiquidUI(configRegtest.explorers.explorerLiquidUI));
      dispatch(setElectrsBatchApi(configRegtest.explorers.electrsBatchAPI));
    }
    dispatch(addSuccessToast(`Explorer endpoints successfully changed to ${capitalizeFirstLetter(value)}`));
  };

  const handleExplorerBitcoinUIChange = (e: any) => {
    setExplorerBitcoinUIInput(e.detail.value);
  };

  const handleExplorerLiquidUIChange = (e: any) => {
    setExplorerLiquidUIInput(e.detail.value);
  };

  const handleExplorerBitcoinAPIChange = (e: any) => {
    setExplorerBitcoinAPIInput(e.detail.value);
  };

  const handleExplorerLiquidAPIChange = (e: any) => {
    setExplorerLiquidAPIInput(e.detail.value);
  };

  const handleElectrsBatchAPIChange = (e: any) => {
    setElectrsBatchAPIInput(e.detail.value);
  };

  return (
    <IonPage id="explorers">
      <IonContent>
        <IonGrid>
          <Header title={t('settings.general.explorers.pageTitle')} hasBackButton={true} hasCloseButton={false} />
          <PageDescription
            description={t('settings.general.explorers.pageDescDesc')}
            title={t('settings.general.explorers.pageDescTitle')}
          />
          <IonRow className="ion-margin-vertical">
            <IonCol size="11" offset="0.5">
              <IonItem className="input">
                <IonLabel>{t('settings.general.explorers.selectLabel')}</IonLabel>
                <IonSelect selectedText=" " value={explorerGroup} onIonChange={handleExplorerChange}>
                  {network === 'liquid' && (
                    <>
                      <IonSelectOption value="blockstream">Blockstream</IonSelectOption>
                      <IonSelectOption value="mempool">Mempool</IonSelectOption>
                    </>
                  )}
                  {network === 'testnet' && (
                    <>
                      <IonSelectOption value="blockstream-testnet">Blockstream</IonSelectOption>
                      <IonSelectOption value="mempool-testnet">Mempool</IonSelectOption>
                    </>
                  )}
                  {network === 'regtest' && <IonSelectOption value="localhost">Localhost</IonSelectOption>}
                  <IonSelectOption value="custom">{t('settings.general.explorers.custom')}</IonSelectOption>
                </IonSelect>
              </IonItem>
            </IonCol>
          </IonRow>
          {/**/}
          <IonRow className="ion-margin-vertical">
            <IonCol size="11" offset="0.5">
              <IonItem className="input">
                <IonLabel position="stacked" color="tertiary">
                  {t('settings.general.explorers.bitcoinUI')}
                </IonLabel>
                <IonInput
                  readonly={explorerGroup !== 'custom'}
                  enterkeyhint="done"
                  onKeyDown={onPressEnterKeyCloseKeyboard}
                  inputmode="text"
                  value={explorerBitcoinUIInput}
                  onIonChange={handleExplorerBitcoinUIChange}
                />
              </IonItem>
            </IonCol>
          </IonRow>

          <IonRow className="ion-margin-vertical">
            <IonCol size="11" offset="0.5">
              <IonItem className="input">
                <IonLabel position="stacked" color="tertiary">
                  {t('settings.general.explorers.liquidUI')}
                </IonLabel>
                <IonInput
                  readonly={explorerGroup !== 'custom'}
                  enterkeyhint="done"
                  onKeyDown={onPressEnterKeyCloseKeyboard}
                  inputmode="text"
                  value={explorerLiquidUIInput}
                  onIonChange={handleExplorerLiquidUIChange}
                />
              </IonItem>
            </IonCol>
          </IonRow>

          <IonRow className="ion-margin-vertical">
            <IonCol size="11" offset="0.5">
              <IonItem className="input">
                <IonLabel position="stacked" color="tertiary">
                  {t('settings.general.explorers.bitcoinAPI')}
                </IonLabel>
                <IonInput
                  readonly={explorerGroup !== 'custom'}
                  enterkeyhint="done"
                  onKeyDown={onPressEnterKeyCloseKeyboard}
                  inputmode="text"
                  value={explorerBitcoinAPIInput}
                  onIonChange={handleExplorerBitcoinAPIChange}
                />
              </IonItem>
            </IonCol>
          </IonRow>

          <IonRow className="ion-margin-vertical">
            <IonCol size="11" offset="0.5">
              <IonItem className="input">
                <IonLabel position="stacked" color="tertiary">
                  {t('settings.general.explorers.liquidAPI')}
                </IonLabel>
                <IonInput
                  readonly={explorerGroup !== 'custom'}
                  enterkeyhint="done"
                  onKeyDown={onPressEnterKeyCloseKeyboard}
                  inputmode="text"
                  value={explorerLiquidAPIInput}
                  onIonChange={(e) => handleExplorerLiquidAPIChange(e)}
                />
              </IonItem>
            </IonCol>
          </IonRow>

          <IonRow className="ion-margin-vertical">
            <IonCol size="11" offset="0.5">
              <IonItem className="input">
                <IonLabel position="stacked" color="tertiary">
                  {t('settings.general.explorers.electrsBatchAPI')}
                </IonLabel>
                <IonInput
                  readonly={explorerGroup !== 'custom'}
                  enterkeyhint="done"
                  onKeyDown={onPressEnterKeyCloseKeyboard}
                  inputmode="text"
                  value={electrsBatchAPIInput}
                  onIonChange={(e) => handleElectrsBatchAPIChange(e)}
                />
              </IonItem>
            </IonCol>
          </IonRow>

          {explorerGroup === 'custom' && (
            <IonRow className="ion-margin-vertical">
              <IonCol size="9" offset="1.5" sizeMd="8" offsetMd="2">
                <IonButton
                  onClick={() => {
                    setExplorerGroup('custom');
                    dispatch(setExplorerBitcoinUI(explorerBitcoinUIInput));
                    dispatch(setExplorerLiquidUI(explorerLiquidUIInput));
                    dispatch(setExplorerBitcoinAPI(explorerBitcoinAPIInput));
                    dispatch(setExplorerLiquidAPI(explorerLiquidAPIInput));
                    dispatch(setElectrsBatchApi(electrsBatchAPIInput));
                    dispatch(addSuccessToast(`Explorer endpoints successfully changed.`));
                  }}
                  disabled={
                    !explorerBitcoinUIInput ||
                    !explorerLiquidUIInput ||
                    !explorerBitcoinAPIInput ||
                    !explorerLiquidAPIInput ||
                    !electrsBatchAPIInput
                  }
                  className="main-button"
                >
                  Save
                </IonButton>
              </IonCol>
            </IonRow>
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    explorerLiquidAPI: state.settings.explorerLiquidAPI,
    explorerBitcoinAPI: state.settings.explorerBitcoinAPI,
    explorerLiquidUI: state.settings.explorerLiquidUI,
    explorerBitcoinUI: state.settings.explorerBitcoinUI,
    electrsBatchAPI: state.settings.electrsBatchAPI,
    network: state.settings.network,
  };
};

export default connect(mapStateToProps)(Explorers);
