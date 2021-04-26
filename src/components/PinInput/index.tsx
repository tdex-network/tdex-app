import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { IonInput, IonGrid, IonRow, IonCol } from '@ionic/react';
import { onPressEnterKeyFactory } from '../../utils/keyboard';
import './style.scss';

interface PinInputProps {
  onPin: (newPin: string) => void;
  on6digits: () => void;
  isWrongPin: boolean | null;
  inputRef: React.RefObject<HTMLIonInputElement>;
}

const PinInput: React.FC<PinInputProps> = ({
  onPin,
  on6digits,
  isWrongPin,
  inputRef,
}) => {
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
    if (newPin.length === 6) {
      onPin(newPin);
      setTimeout(() => setPin(''), 2000);
    }
  };

  return (
    <IonGrid>
      <IonRow>
        <IonCol offset="1" size="10">
          <IonGrid className="pin-wrapper">
            <IonRow>
              {[...new Array(6)].map((_, index) => (
                <IonCol key={index}>
                  <div
                    className={classNames('pin-input', {
                      error: isWrongPin !== null && isWrongPin,
                      success: isWrongPin !== null && !isWrongPin,
                      filled: isWrongPin === null && index < pin.length,
                    })}
                  />
                </IonCol>
              ))}
            </IonRow>
            <IonInput
              autofocus={true}
              ref={inputRef}
              enterkeyhint="done"
              onKeyDown={onPressEnterKeyFactory(() => {
                on6digits();
              })}
              inputmode="numeric"
              type="number"
              value={pin}
              required={true}
              onIonChange={(e) => onNewPin(e.detail.value)}
              maxlength={6}
            />
          </IonGrid>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default PinInput;
