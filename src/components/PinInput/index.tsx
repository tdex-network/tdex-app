import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  IonInput,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import { onPressEnterKeyFactory } from '../../utils/keyboard';
import './style.scss';

interface PinInputProps {
  onPin: (newPin: string) => void;
  on6digits: () => void;
}

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
    console.log('newPin', newPin);
    if (!newPin) return;
    if (newPin.length === 6) onPin(newPin);
    setPin(newPin);
  };

  return (
    <IonGrid className="pin-wrapper">
      <IonRow>
        {[...new Array(6)].map((_, index) => (
          <IonCol key={index}>
            <div
              className={classNames('pin-input', {
                active: index <= pin.length,
                filled: index + 1 <= pin.length,
              })}
            />
          </IonCol>
        ))}
      </IonRow>
      <IonInput
        autofocus={true}
        ref={inputRef}
        enterkeyhint="done"
        onKeyDown={onPressEnterKeyFactory(() => on6digits())}
        inputmode="numeric"
        type="password"
        value={pin}
        required={true}
        onIonChange={(e) => onNewPin(e.detail.value)}
        maxlength={6}
      />
    </IonGrid>
  );
};

export default PinInput;
