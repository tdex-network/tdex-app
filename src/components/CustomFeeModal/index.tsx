import {
  IonAlert,
  IonContent,
  IonButton,
  IonList,
  IonModal,
  IonHeader,
  IonItem,
  IonIcon,
  IonFooter,
} from '@ionic/react';
import { closeSharp } from 'ionicons/icons';
import React, { useState } from 'react';

import type { RecommendedFeesResult } from '../../redux/services/walletService';
import './style.scss';

interface CustomFeeModalProps {
  isOpen: boolean;
  close: () => void;
  recommendedFees: RecommendedFeesResult | null;
  setSelectedFee: (selectedFee: number) => void;
}

const CustomFeeModal: React.FC<CustomFeeModalProps> = ({ isOpen, close, recommendedFees, setSelectedFee }) => {
  const [showCustomFeeInput, setShowCustomFeeInput] = useState(false);
  const [selectedItem, setSelectedItem] = useState<'slow' | 'medium' | 'fast' | 'custom'>('slow');

  const slowFee = recommendedFees?.['25'] || 0.1;
  const mediumFee = recommendedFees?.['10'] || 0.1;
  const fastFee = recommendedFees?.['1'] || 0.1;

  const slowFeeSelected = selectedItem === 'slow' ? 'active' : '';
  const mediumFeeSelected = selectedItem === 'medium' ? 'active' : '';
  const fastFeeSelected = selectedItem === 'fast' ? 'active' : '';

  return (
    <IonModal cssClass="custom-fee-modal modal-medium" isOpen={isOpen} onDidDismiss={close}>
      <IonHeader className="ion-no-border py-2 px-4 d-flex ion-justify-content-end">
        <label>
          <IonIcon icon={closeSharp} color="light-contrast" onClick={close} />
        </label>
      </IonHeader>
      <IonContent className="mt-3">
        <IonList>
          <IonItem
            className={`ion-no-margin mt-2 mb-3 mx-7 d-flex ion-justify-content-between ${fastFeeSelected}`}
            onClick={() => {
              setSelectedFee(fastFee);
              setSelectedItem('fast');
              close();
            }}
          >
            <div className="fee-name d-flex flex-grow-1 ion-align-content-center">
              <p>FAST</p>
            </div>
            <div className="fee-amount d-flex flex-column ion-align-items-end">
              <span className="fee-time">~ 1 minute</span>
              <span className="sats-vbyte">{fastFee} sat/vByte</span>
            </div>
          </IonItem>

          <IonItem
            className={`ion-no-margin mt-2 mb-3 mx-7 d-flex ion-justify-content-between ${mediumFeeSelected}`}
            onClick={() => {
              setSelectedFee(mediumFee);
              setSelectedItem('medium');
              close();
            }}
          >
            <div className="fee-name flex-grow-1 d-flex ion-align-content-center">
              <p>MEDIUM</p>
            </div>
            <div className="fee-amount d-flex flex-column ion-align-items-end">
              <span className="fee-time">~ 10 minutes</span>
              <span className="sats-vbyte">{mediumFee} sat/vByte</span>
            </div>
          </IonItem>

          <IonItem
            className={`ion-no-margin mt-2 mb-3 mx-7 d-flex ion-align-content-between ${slowFeeSelected}`}
            onClick={() => {
              setSelectedFee(slowFee);
              setSelectedItem('slow');
              close();
            }}
          >
            <div className="fee-name flex-grow-1 d-flex ion-align-content-center">
              <p>SLOW</p>
              <span></span>
            </div>
            <div className="fee-amount d-flex flex-column ion-align-items-end">
              <span className="fee-time">~ 25 minutes</span>
              <span className="sats-vbyte">{slowFee} sat/vByte</span>
            </div>
          </IonItem>
        </IonList>
      </IonContent>
      <IonFooter className="ion-no-border ion-justify-content-center py-2 pb-4 px-6 ">
        <IonButton className="sub-button" data-cy="sub-button" onClick={() => setShowCustomFeeInput(true)}>
          CUSTOM FEE
        </IonButton>
      </IonFooter>
      <IonAlert
        isOpen={showCustomFeeInput}
        onDidDismiss={() => setShowCustomFeeInput(false)}
        header="CUSTOM FEE"
        message="Enter sat/vByte"
        inputs={[
          {
            name: 'satsvbyte',
            type: 'number', // iOS doesn't respect numeric keyboard
            value: '0.1',
          },
        ]}
        buttons={[
          { text: 'Cancel', role: 'cancel', handler: () => setShowCustomFeeInput(false) },
          {
            text: 'OK',
            handler: (data) => {
              // Invalid satsvbytes are be replaced by the slowFee
              const satsvbyte = isNaN(parseFloat(data.satsvbyte as any)) ? slowFee : parseFloat(data.satsvbyte);
              setSelectedFee(satsvbyte);
              setSelectedItem('custom');
              close();
            },
          },
        ]}
      />
    </IonModal>
  );
};

export default CustomFeeModal;
