import './style.scss';
import { IonButton, IonCol, IonContent, IonGrid, IonModal, IonRow, IonText } from '@ionic/react';
import React, { useEffect } from 'react';

import Header from '../../components/Header';
import type { TdexOrderInputResultV1, TdexOrderInputResultV2 } from '../../components/TdexOrderInput';
import type { TDEXProvider } from '../../store/tdexStore';
import type { AppError } from '../../utils/errors';

interface Props {
  result?: TdexOrderInputResultV1 | TdexOrderInputResultV2;
  error?: AppError;
  onClose: () => void;
  onClickRetry: () => void;
  onClickTryNext: (provider: TDEXProvider) => void;
}

const ExchangeErrorModal: React.FC<Props> = ({ result, error, onClose, onClickRetry, onClickTryNext }) => {
  useEffect(() => {
    if (!result) onClose();
  }, [onClose, result]);

  const tryNextHandler = () => {
    onClose();
    if (!result) return;
    onClickTryNext(result.order.market.provider);
  };

  const retryHandler = () => {
    onClose();
    onClickRetry();
  };

  return (
    <IonModal
      id="exchange-error-modal"
      onDidDismiss={onClose}
      className="modal-big"
      isOpen={error !== undefined}
      keyboardClose={false}
    >
      <IonContent scrollY={false}>
        <Header title="TRADE ERROR" hasBackButton={false} hasCloseButton={!!onClose} handleClose={onClose} />
        <IonGrid className="ion-text-center error-modal-grid">
          <h2>{`The selected provider ${result?.order?.market?.provider?.name} can't process your trade`}</h2>
          <IonRow>
            <IonCol>
              <IonText color="danger" className="error-message">
                {error?.message}
              </IonText>
            </IonCol>
          </IonRow>

          <IonRow className="ion-margin-top">
            <IonCol size="12">
              <IonButton className="main-button" data-testid="main-button" onClick={retryHandler}>
                RETRY
              </IonButton>
            </IonCol>
            <IonCol size="12">
              <IonButton className="main-button" data-testid="main-button" onClick={tryNextHandler}>
                TRY NEXT PROVIDER
              </IonButton>
            </IonCol>
            <IonCol size="12">
              <IonButton className="main-button" data-testid="main-button" onClick={onClose}>
                CANCEL
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonModal>
  );
};

export default ExchangeErrorModal;
