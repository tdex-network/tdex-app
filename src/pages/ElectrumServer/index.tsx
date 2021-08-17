import { IonButton, IonCol, IonContent, IonGrid, IonInput, IonItem, IonPage, IonRow } from '@ionic/react';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import Header from '../../components/Header';
import PageDescription from '../../components/PageDescription';
import { setElectrumServer } from '../../redux/actions/settingsActions';
import { addSuccessToast } from '../../redux/actions/toastActions';
import type { SettingsState } from '../../redux/reducers/settingsReducer';
import { onPressEnterKeyCloseKeyboard } from '../../utils/keyboard';

interface ElectrumServerProps {
  explorerUrl: string;
}

const ElectrumServer: React.FC<ElectrumServerProps> = ({ explorerUrl }) => {
  const [explorerValue, setExplorerValue] = useState<SettingsState['explorerUrl']>('');
  const dispatch = useDispatch();

  const handleExplorerChange = (e: any) => {
    const { value } = e.detail;
    setExplorerValue(value);
  };

  return (
    <IonPage id="electrum-server">
      <IonContent>
        <IonGrid>
          <Header title="ELECTRUM SERVER" hasBackButton={true} hasCloseButton={false} />
          <PageDescription description="Set the Liquid backend API endpoint" title="Endpoints" />
          <IonRow>
            <IonCol size="10" offset="1">
              <IonItem className="input">
                <IonInput
                  enterkeyhint="done"
                  onKeyDown={onPressEnterKeyCloseKeyboard}
                  inputmode="text"
                  value={explorerValue}
                  placeholder={explorerUrl}
                  onIonChange={handleExplorerChange}
                />
              </IonItem>
            </IonCol>
          </IonRow>

          <IonRow className="ion-margin-vertical">
            <IonCol size="9" offset="1.5" sizeMd="8" offsetMd="2">
              <IonButton
                onClick={() => {
                  dispatch(setElectrumServer(explorerValue));
                  setExplorerValue('');
                  dispatch(addSuccessToast(`Liquid backend API endpoint successfully changed to ${explorerValue}`));
                }}
                disabled={!explorerValue}
                className="main-button"
              >
                Save
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default ElectrumServer;
