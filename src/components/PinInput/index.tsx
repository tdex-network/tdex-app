import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { IonInput, IonItem, IonLabel } from '@ionic/react';
import './style.scss';

interface PinInputProps {
  onPin: (newPin: string) => void;
}

const length6Array = new Array(6).fill(0);

const PinInput: React.FC<PinInputProps> = ({ onPin }) => {
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
    if (newPin.length > 6) {
      setPin(newPin.slice(6));
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
            key={index}
            className={classNames('pin-input', {
              active: index <= pin.length,
            })}
          >
            {pin[index]}
          </div>
        ))}
      </IonLabel>
      <IonInput
        ref={inputRef}
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
