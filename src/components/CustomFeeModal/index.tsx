import { IonAlert, IonContent, IonButton, IonList, IonModal, IonHeader, IonItem, IonIcon, IonFooter } from '@ionic/react';
import { closeSharp } from 'ionicons/icons';
import React from 'react';
import './style.scss';

interface CustomFeeModalProps {
  isOpen: boolean;
  close: (ev: any) => void;
  recommendedFees: any; // wip
  selectedFee: string;
  setSelectedFee: (selectedFee: string) => void;
}

const CustomFeeModal: React.FC<CustomFeeModalProps> = ({ isOpen, close, recommendedFees, setSelectedFee }) => {

  const [showCustomFeeInput, setShowCustomFeeInput] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState('slow');

  const slowFee = recommendedFees['hourFee'];
  const mediumFee = recommendedFees['halfHourFee'];
  const fastFee = recommendedFees['fastestFee'];

  const slowFeeSelected = selectedItem === 'slow' ? 'active' : '';
  const mediumFeeSelected = selectedItem === 'medium' ? 'active' : '';
  const fastFeeSelected = selectedItem === 'fast' ? 'active' : '';


  React.useEffect(()=> {
    console.log({recommendedFees});
  }, [recommendedFees]);


  return (
    <IonModal cssClass="custom-fee-modal modal-medium" isOpen={isOpen} onDidDismiss={close}>
      <IonHeader className="ion-no-border">
        <div>
          <label className="fee-modal-navbar ion-justify-content-end">
            <IonIcon icon={closeSharp} color="light-contrast" onClick={close} />
          </label>
        </div>
      </IonHeader>
      <IonContent className="fee-content">
        <IonList>
          <IonItem
            className={`ion-no-margin ${fastFeeSelected}`}
            onClick={(e) => {
              setSelectedFee(fastFee);
              setSelectedItem('fast');
              close(e);
            }}
          >
            <div className="custom-fee-name">
              <p>FAST</p>
            </div>
            <div className="custom-fee-amount">
              <span className="fee-time">1 minute</span>
              <span className="sats-vbyte">{fastFee} sat/vByte</span>
            </div>
          </IonItem>

          <IonItem
            className={`ion-no-margin ${mediumFeeSelected}`}
            onClick={(e) => {
              setSelectedFee(mediumFee);
              setSelectedItem('medium');
              close(e);
            }}
          >
            <div className="custom-fee-name">
              <p>MEDIUM</p>
            </div>
            <div className="custom-fee-amount">
              <span className="fee-time">30 minutes</span>
              <span className="sats-vbyte">{mediumFee} sat/vByte</span>
            </div>
          </IonItem>

          <IonItem
            className={`ion-no-margin ${slowFeeSelected}`}
            onClick={(e) => {
              setSelectedFee(slowFee);
              setSelectedItem('slow');
              close(e);
            }}
          >
            <div className="custom-fee-name">
              <p>SLOW</p>
              <span></span>
            </div>
            <div className="custom-fee-amount">
              <span className="fee-time">60 minutes</span>
              <span className="sats-vbyte">{slowFee} sat/vByte</span>
            </div>
          </IonItem>
        </IonList>
      </IonContent>
      <IonFooter className="ion-no-border ion-justify-content-center">
          <IonButton
            className="sub-button"
            data-cy="sub-button"
            onClick={()=> setShowCustomFeeInput(true)}
          >
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
            type: 'number',
            value: '0.1',
          },
        ]}
        buttons={[
          { text: 'Cancel', role: 'cancel', handler: () => setShowCustomFeeInput(false) },
          { text: 'OK', handler: (data) => {
            setSelectedFee(data.satsvbyte);
            setSelectedItem('custom'); 
            close(null);
          }},
        ]}
      />
    </IonModal>
  );
};

export default CustomFeeModal;
