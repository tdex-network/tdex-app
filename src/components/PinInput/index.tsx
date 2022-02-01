import { IonInput, IonGrid, IonRow, IonCol, isPlatform } from '@ionic/react';
import classNames from 'classnames';
import React, { useEffect } from 'react';

import { onPressEnterKeyFactory } from '../../utils/keyboard';
import './style.scss';

interface PinInputProps {
  onPin: (newPin: string) => void;
  on6digits: () => void;
  isWrongPin: boolean | null;
  inputRef: React.RefObject<HTMLIonInputElement>;
  pin: string;
  isLocked?: boolean;
}

const PinInput: React.FC<PinInputProps> = ({ onPin, on6digits, isWrongPin, inputRef, pin, isLocked }) => {
  useEffect(() => {
    setTimeout(() => {
      if (inputRef?.current) {
        inputRef.current.setFocus().catch(console.error);
      }
    }, 500);
  });

  /**
   * Set new pin digit until 6
   * @param newPin
   */
  const handleNewPinDigit = (newPin: string | null | undefined) => {
    // Don't handle new pin if pin already validated
    if (isWrongPin === false || isLocked) {
      return;
    }
    if (!newPin) {
      onPin('');
      return;
    }
    if (newPin.length > 6) {
      onPin(newPin.slice(6));
      return;
    }
    //
    onPin(newPin);
  };

  return (
    <IonGrid id="pin-input-container">
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
              data-cy="pin-input"
              enterkeyhint="done"
              onKeyDown={onPressEnterKeyFactory(on6digits)}
              inputmode={isPlatform('android') ? 'tel' : 'numeric'}
              type={isPlatform('android') ? 'tel' : 'number'}
              value={pin}
              required={true}
              onIonChange={(e) => handleNewPinDigit(e.detail.value)}
              maxlength={6}
            />
          </IonGrid>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default PinInput;
