import './style.scss';
import { IonButton, IonCol, IonContent, IonGrid, IonModal, IonRow, IonText } from '@ionic/react';
import React, { useEffect } from 'react';

import Header from '../../components/Header';
import type { TDEXProvider } from '../../redux/actionTypes/tdexActionTypes';
import type { AppError } from '../../utils/errors';

interface Props {
  result?: TDEXProvider;
  error?: AppError;
  onClose: () => void;
  onClickRetry: () => void;
  onClickTryNext: (endpoint: string) => void;
}

const ExchangeErrorModal: React.FC<Props> = ({ result, error, onClose, onClickRetry, onClickTryNext }) => {
  useEffect(() => {
    if (!result) onClose();
  }, [onClose, result]);

  const tryNextHandler = () => {
    onClose();
    if (!result) return;
    onClickTryNext(result.endpoint);
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
              <IonText color="danger">The selected provider can't process your trade.</IonText>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonText color="danger">{error?.message}</IonText>
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
