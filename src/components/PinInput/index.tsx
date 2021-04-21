import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { IonInput, IonItem, IonLabel } from '@ionic/react';
import { onPressEnterKeyFactory } from '../../utils/keyboard';
import './style.scss';

interface PinInputProps {
  onPin: (newPin: string) => void;
  on6digits: () => void;
}

const length6Array = new Array(6).fill(0);

const PinInput: React.FC<PinInputProps> = ({ onPin, on6digits }) => {
  const inputRef = useRef<any>(null);

  useEffect(() => {
    setTimeout(() => {
      if (inputRef && inputRef.current) {
        inputRef.current.setFocus();
      }
    }, 500);
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
            {pin[index] ? '*' : undefined}
          </div>
        ))}
      </IonLabel>
      <IonInput
        autofocus={true}
        ref={inputRef}
        enterkeyhint="done"
        onKeyDown={onPressEnterKeyFactory(() => on6digits())}
        inputmode="numeric"
        type="password"
        clearOnEdit={true}
        value={pin}
        required={true}
        onIonChange={(e) => onNewPin(e.detail.value)}
      />
    </IonItem>
  );
};

export default PinInput;
