import React, { ChangeEvent, useState } from 'react';
import classNames from 'classnames';
import { IonInput, IonItem, IonLabel } from '@ionic/react';
import { uuid4 } from '@capacitor/core/dist/esm/util';
import './style.scss';

interface PinInputProps {
  onPin: (newPin: string) => void;
  error?: string;
}

const PinInput: React.FC<PinInputProps> = ({ onPin, error }) => {
  const [pin, setPin] = useState('');
  const onNewPin = (newPin: string | null | undefined) => {
    if (!newPin) {
      setPin('');
      return;
    }

    setPin(newPin);
    if (newPin.length === 6) onPin(newPin);
  };

  return (
    <IonItem lines="none" className="pin-wrapper">
      <IonLabel>
        {[...new Array(6).fill('')].map((_, index) => {
          return (
            <div
              key={uuid4()}
              className={classNames('pin-input', {
                active: index <= pin.length,
                error,
              })}
            >
              {pin[index]}
            </div>
          );
        })}
      </IonLabel>
      <IonInput
        maxlength={6}
        inputMode="numeric"
        value={pin}
        autofocus={true}
        required={true}
        onIonChange={(e) => onNewPin(e.detail.value)}
        type="number"
      />
    </IonItem>
  );
};

export default PinInput;
