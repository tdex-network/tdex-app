import React, { useEffect } from 'react';
import classNames from 'classnames';
import { IonInput, IonGrid, IonRow, IonCol } from '@ionic/react';
import { onPressEnterKeyFactory } from '../../utils/keyboard';
import './style.scss';

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

  /**
   * Set new pin digit until 6
   * @param newPin
   */
  const handleNewPinDigit = (newPin: string | null | undefined) => {
    // Dont handle new pin if pin already validated
    if (isWrongPin === false) {
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
    onPin(newPin);
    if (newPin.length === 6) {
      onPin(newPin);
      // if (isWrongPin === true) {
      //   console.log('isWrongPin true', isWrongPin);
      //   setTimeout(() => onPin(''), PIN_TIMEOUT_FAILURE);
      // }
      // if (isWrongPin === null) {
      //   console.log('isWrongPin null', isWrongPin);
      //   // TODO: not reset on onboard PIN setting
      //   setTimeout(() => onPin(''), PIN_TIMEOUT_SUCCESS);
      // }
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
