import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { IonInput, IonItem, IonLabel } from '@ionic/react';
import { uuid4 } from '@capacitor/core/dist/esm/util';
import './style.scss';

interface PinInputProps {
  onPin: (newPin: string) => void;
  error?: string;
}

const length6Array = new Array(6).fill(0);

const PinInput: React.FC<PinInputProps> = ({ onPin, error }) => {
  const inputRef = useRef<any>(null);

  useEffect(() => {
    setTimeout(() => {
      if (inputRef && inputRef.current) {
        inputRef.current.setFocus();
      }
    }, 100);
  });

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
        {length6Array.map((_, index) => (
          <div
            key={uuid4()}
            className={classNames('pin-input', {
              active: index <= pin.length,
              error,
            })}
          >
            {pin[index]}
          </div>
        ))}
      </IonLabel>
      <IonInput
        ref={inputRef}
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
