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

  const slowFee = recommendedFees?.hourFee || 0.1;
  const mediumFee = recommendedFees?.halfHourFee || 0.1;
  const fastFee = recommendedFees?.fastestFee || 0.1;

  const slowFeeSelected = selectedItem === 'slow' ? 'active' : '';
  const mediumFeeSelected = selectedItem === 'medium' ? 'active' : '';
  const fastFeeSelected = selectedItem === 'fast' ? 'active' : '';

  return (
    <IonModal cssClass="custom-fee-modal modal-medium" isOpen={isOpen} onDidDismiss={close}>
      <IonHeader className="ion-no-border">
        <div>
          <label className="fee-modal-navbar ion-justify-content-end">
            <IonIcon icon={closeSharp} color="light-contrast" onClick={close} />
          </label>
        </div>
      </IonHeader>
      <IonContent className="fee-modal-content">
        <IonList>
          <IonItem
            className={`ion-no-margin ${fastFeeSelected}`}
            onClick={() => {
              setSelectedFee(fastFee);
              setSelectedItem('fast');
              close();
            }}
          >
            <div className="fee-name">
              <p>FAST</p>
            </div>
            <div className="fee-amount">
              <span className="fee-time">1 minute</span>
              <span className="sats-vbyte">{fastFee} sat/vByte</span>
            </div>
          </IonItem>

          <IonItem
            className={`ion-no-margin ${mediumFeeSelected}`}
            onClick={() => {
              setSelectedFee(mediumFee);
              setSelectedItem('medium');
              close();
            }}
          >
            <div className="fee-name">
              <p>MEDIUM</p>
            </div>
            <div className="fee-amount">
              <span className="fee-time">30 minutes</span>
              <span className="sats-vbyte">{mediumFee} sat/vByte</span>
            </div>
          </IonItem>

          <IonItem
            className={`ion-no-margin ${slowFeeSelected}`}
            onClick={() => {
              setSelectedFee(slowFee);
              setSelectedItem('slow');
              close();
            }}
          >
            <div className="fee-name">
              <p>SLOW</p>
              <span></span>
            </div>
            <div className="fee-amount">
              <span className="fee-time">60 minutes</span>
              <span className="sats-vbyte">{slowFee} sat/vByte</span>
            </div>
          </IonItem>
        </IonList>
      </IonContent>
      <IonFooter className="ion-no-border ion-justify-content-center">
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
              // Invalid satsvbyte will be replaced by the slowFee
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
