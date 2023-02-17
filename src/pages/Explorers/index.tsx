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

import Header from '../../components/Header';
import PageDescription from '../../components/PageDescription';
import { blockstreamExplorerEndpoints, configRegtest, mempoolExplorerEndpoints } from '../../store/config';
import type { SettingsState } from '../../store/settingsStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useToastStore } from '../../store/toastStore';
import type { NetworkString } from '../../utils/constants';
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

export const Explorers: React.FC<ExplorersProps> = () => {
  const setExplorerLiquidAPI = useSettingsStore((state) => state.setExplorerLiquidAPI);
  const setExplorerLiquidUI = useSettingsStore((state) => state.setExplorerLiquidUI);
  const setExplorerBitcoinAPI = useSettingsStore((state) => state.setExplorerBitcoinAPI);
  const setExplorerBitcoinUI = useSettingsStore((state) => state.setExplorerBitcoinUI);
  const setWebsocketExplorerURL = useSettingsStore((state) => state.setWebsocketExplorerURL);
  const setElectrsBatchApi = useSettingsStore((state) => state.setElectrsBatchApi);
  const explorerLiquidUI = useSettingsStore((state) => state.explorerLiquidUI);
  const explorerLiquidAPI = useSettingsStore((state) => state.explorerLiquidAPI);
  const explorerBitcoinAPI = useSettingsStore((state) => state.explorerBitcoinAPI);
  const explorerBitcoinUI = useSettingsStore((state) => state.explorerBitcoinUI);
  const websocketExplorerURL = useSettingsStore((state) => state.websocketExplorerURL);
  const electrsBatchAPI = useSettingsStore((state) => state.electrsBatchAPI);
  const network = useSettingsStore((state) => state.network);
  //
  const addSuccessToast = useToastStore((state) => state.addSuccessToast);
  const [explorerGroup, setExplorerGroup] = useState<SettingsState['explorerLiquidAPI']>('');
  const [explorerBitcoinAPIInput, setExplorerBitcoinAPIInput] = useState<SettingsState['explorerBitcoinAPI']>('');
  const [explorerLiquidAPIInput, setExplorerLiquidAPIInput] = useState<SettingsState['explorerLiquidAPI']>('');
  const [explorerBitcoinUIInput, setExplorerBitcoinUIInput] = useState<SettingsState['explorerBitcoinUI']>('');
  const [explorerLiquidUIInput, setExplorerLiquidUIInput] = useState<SettingsState['explorerLiquidUI']>('');
  const [electrsBatchAPIInput, setElectrsBatchAPIInput] = useState<SettingsState['electrsBatchAPI']>('');
  const [websocketExplorerURLInput, setWebsocketExplorerURLInput] = useState<SettingsState['websocketExplorerURL']>('');

  useEffect(() => {
    setExplorerBitcoinAPIInput(explorerBitcoinAPI);
    setExplorerLiquidAPIInput(explorerLiquidAPI);
    setExplorerBitcoinUIInput(explorerBitcoinUI);
    setExplorerLiquidUIInput(explorerLiquidUI);
    setElectrsBatchAPIInput(electrsBatchAPI);
    setWebsocketExplorerURLInput(websocketExplorerURL);
  }, [
    explorerLiquidAPI,
    explorerBitcoinAPI,
    explorerLiquidUI,
    explorerBitcoinUI,
    electrsBatchAPI,
    websocketExplorerURL,
  ]);

  const handleExplorerChange = (e: any) => {
    const { value } = e.detail;
    setExplorerGroup(value);
    if (value === 'blockstream') {
      setExplorerLiquidAPI(blockstreamExplorerEndpoints.liquid.explorerLiquidAPI);
      setExplorerLiquidUI(blockstreamExplorerEndpoints.liquid.explorerLiquidUI);
      setExplorerBitcoinAPI(blockstreamExplorerEndpoints.liquid.explorerBitcoinAPI);
      setExplorerBitcoinUI(blockstreamExplorerEndpoints.liquid.explorerBitcoinUI);
      setElectrsBatchApi(blockstreamExplorerEndpoints.liquid.electrsBatchAPI);
      setWebsocketExplorerURL(mempoolExplorerEndpoints.liquid.websocketExplorerURL);
    } else if (value === 'blockstream-testnet') {
      setExplorerLiquidAPI(blockstreamExplorerEndpoints.testnet.explorerLiquidAPI);
      setExplorerLiquidUI(blockstreamExplorerEndpoints.testnet.explorerLiquidUI);
      setExplorerBitcoinAPI(blockstreamExplorerEndpoints.testnet.explorerBitcoinAPI);
      setExplorerBitcoinUI(blockstreamExplorerEndpoints.testnet.explorerBitcoinUI);
      setElectrsBatchApi(blockstreamExplorerEndpoints.testnet.electrsBatchAPI);
      setWebsocketExplorerURL(mempoolExplorerEndpoints.testnet.websocketExplorerURL);
    } else if (value === 'mempool') {
      setExplorerLiquidAPI(mempoolExplorerEndpoints.liquid.explorerLiquidAPI);
      setExplorerLiquidUI(mempoolExplorerEndpoints.liquid.explorerLiquidUI);
      setExplorerBitcoinAPI(mempoolExplorerEndpoints.liquid.explorerBitcoinAPI);
      setExplorerBitcoinUI(mempoolExplorerEndpoints.liquid.explorerBitcoinUI);
      setElectrsBatchApi(mempoolExplorerEndpoints.liquid.electrsBatchAPI);
      setWebsocketExplorerURL(mempoolExplorerEndpoints.liquid.websocketExplorerURL);
    } else if (value === 'mempool-testnet') {
      setExplorerLiquidAPI(mempoolExplorerEndpoints.testnet.explorerLiquidAPI);
      setExplorerLiquidUI(mempoolExplorerEndpoints.testnet.explorerLiquidUI);
      setExplorerBitcoinAPI(mempoolExplorerEndpoints.testnet.explorerBitcoinAPI);
      setExplorerBitcoinUI(mempoolExplorerEndpoints.testnet.explorerBitcoinUI);
      setElectrsBatchApi(mempoolExplorerEndpoints.testnet.electrsBatchAPI);
      setWebsocketExplorerURL(mempoolExplorerEndpoints.testnet.websocketExplorerURL);
    } else if (value === 'localhost') {
      setExplorerLiquidAPI(configRegtest.explorers.explorerLiquidAPI);
      setExplorerBitcoinAPI(configRegtest.explorers.explorerBitcoinAPI);
      setExplorerBitcoinUI(configRegtest.explorers.explorerBitcoinUI);
      setExplorerLiquidUI(configRegtest.explorers.explorerLiquidUI);
      setElectrsBatchApi(configRegtest.explorers.electrsBatchAPI);
      setWebsocketExplorerURL(configRegtest.explorers.websocketExplorerURL);
    }
    addSuccessToast(`Explorer endpoints successfully changed to ${capitalizeFirstLetter(value)}`);
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

  const handleWebsocketUrlChange = (e: any) => {
    setWebsocketExplorerURLInput(e.detail.value);
  };

  return (
    <IonPage id="explorers">
      <IonContent>
        <IonGrid>
          <Header title="EXPLORERS" hasBackButton={true} hasCloseButton={false} />
          <PageDescription
            description="Select a preset of backend APIs Electrs-compatible and frontend explorers Esplora-compatible or enter custom compatible endpoints."
            title="Set explorer endpoints"
          />
          <IonRow className="ion-margin-vertical">
            <IonCol size="11" offset="0.5">
              <IonItem className="input">
                <IonLabel>Select your explorer</IonLabel>
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
                  <IonSelectOption value="custom">Custom</IonSelectOption>
                </IonSelect>
              </IonItem>
            </IonCol>
          </IonRow>
          {/**/}
          <IonRow className="ion-margin-vertical">
            <IonCol size="11" offset="0.5">
              <IonItem className="input">
                <IonLabel position="stacked" color="tertiary">
                  Bitcoin UI endpoint
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
                  Liquid UI endpoint
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
                  Bitcoin API endpoint
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
                  Liquid API endpoint
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
                  Electrs batch API endpoint
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

          <IonRow className="ion-margin-vertical">
            <IonCol size="11" offset="0.5">
              <IonItem className="input">
                <IonLabel position="stacked" color="tertiary">
                  Websocket explorer endpoint
                </IonLabel>
                <IonInput
                  readonly={explorerGroup !== 'custom'}
                  enterkeyhint="done"
                  onKeyDown={onPressEnterKeyCloseKeyboard}
                  inputmode="text"
                  value={websocketExplorerURLInput}
                  onIonChange={(e) => handleWebsocketUrlChange(e)}
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
                    setExplorerBitcoinUI(explorerBitcoinUIInput);
                    setExplorerLiquidUI(explorerLiquidUIInput);
                    setExplorerBitcoinAPI(explorerBitcoinAPIInput);
                    setExplorerLiquidAPI(explorerLiquidAPIInput);
                    setElectrsBatchApi(electrsBatchAPIInput);
                    setWebsocketExplorerURL(websocketExplorerURLInput);
                    addSuccessToast(`Explorer endpoints successfully changed.`);
                  }}
                  disabled={
                    !explorerBitcoinUIInput ||
                    !explorerLiquidUIInput ||
                    !explorerBitcoinAPIInput ||
                    !explorerLiquidAPIInput ||
                    !electrsBatchAPIInput ||
                    !websocketExplorerURLInput
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
