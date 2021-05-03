import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { IonInput, IonGrid, IonRow, IonCol } from '@ionic/react';
import { onPressEnterKeyFactory } from '../../utils/keyboard';
import './style.scss';
import {
  PIN_TIMEOUT_FAILURE,
  PIN_TIMEOUT_SUCCESS,
} from '../../utils/constants';

interface PinInputProps {
  onPin: (newPin: string) => void;
  on6digits: () => void;
  isWrongPin: boolean | null;
  inputRef: React.RefObject<HTMLIonInputElement>;
  pin: string;
}

const PinInput: React.FC<PinInputProps> = ({
  onPin,
  on6digits,
  isWrongPin,
  inputRef,
  pin,
}) => {
  useEffect(() => {
    setTimeout(() => {
      if (inputRef && inputRef.current) {
        inputRef.current.setFocus();
      }
    }, 500);
  });

  const onNewPin = (newPin: string | null | undefined) => {
    if (!newPin) {
      onPin('');
      return;
    }
    if (newPin.length > 6) {
      onPin(newPin.slice(6));
      return;
    }
    onPin(newPin);
    if (newPin.length === 6) {
      onPin(newPin);
      if (isWrongPin === true) {
        setTimeout(() => onPin(''), PIN_TIMEOUT_FAILURE);
      }
      if (isWrongPin === null) {
        setTimeout(() => onPin(''), PIN_TIMEOUT_SUCCESS);
      }
    }
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
