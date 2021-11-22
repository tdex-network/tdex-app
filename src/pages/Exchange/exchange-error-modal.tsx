import { IonButton, IonCol, IonContent, IonGrid, IonIcon, IonModal, IonRow, IonText } from '@ionic/react';
import { arrowForwardCircleOutline, arrowRedoCircleOutline, closeCircleOutline } from 'ionicons/icons';
import React, { useEffect } from 'react';

import Header from '../../components/Header';
import type { TdexOrderInputResult } from '../../components/TdexOrderInput';
import type { AppError } from '../../utils/errors';

import './style.scss';

interface Props {
  result?: TdexOrderInputResult;
  error?: AppError;
  onClose: () => void;
  onClickRetry: () => void;
  onClickTryNext: (endpoint: string) => void;
}

const ExchangeErrorModal: React.FC<Props> = ({ result, error, onClose, onClickRetry, onClickTryNext }) => {
  useEffect(() => {
    if (!result) onClose();
  }, [result]);

  const tryNextHandler = () => {
    onClose();
    if (!result) return;
    onClickTryNext(result?.order.traderClient.providerUrl);
  };

  const retryHandler = () => {
    onClose();
    onClickRetry();
  };

  return (
    <IonModal
      id="exchange-error-modal"
      onDidDismiss={onClose}
      cssClass="modal-big"
      isOpen={error !== undefined}
      keyboardClose={false}
    >
      <IonContent scrollY={false}>
        <Header title="TRADE ERROR" hasBackButton={false} hasCloseButton={!!onClose} handleClose={onClose} />
        <IonGrid className="ion-text-center error-modal-grid">
          <IonRow>
            <IonCol>
              <IonText color="danger">
                An error occurs: {error?.message} failed to complete your trade.
              </IonText>
            </IonCol>
          </IonRow>

          <IonRow className="ion-margin-top">
            <IonCol size="12">
              <IonButton className="main-button" data-cy="main-button" onClick={retryHandler}>
                RETRY
              </IonButton>
            </IonCol>
            <IonCol size="12">
              <IonButton className="main-button" data-cy="main-button" onClick={tryNextHandler}>
                TRY NEXT PROVIDER
              </IonButton>
            </IonCol>
            <IonCol size="12">
              <IonButton className="main-button" data-cy="main-button" onClick={onClose}>
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
