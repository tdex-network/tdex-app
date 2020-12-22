import React, { useEffect } from 'react';
import classNames from 'classnames';
import { IonInput, IonItem, IonLabel } from '@ionic/react';
import './style.scss';

interface PinInputInterface {
  inputValue: string;
  onChange: (e: any) => void;
  inputRef: any;
  error?: string;
}

const PinInput: React.FC<PinInputInterface> = ({
  inputValue,
  onChange,
  inputRef,
  error,
}) => {
  useEffect(() => {
    inputRef?.current.getInputElement().then((el: any) => {
      el.focus();
    });
  }, [inputRef]);
  return (
    <IonItem lines="none" className="pin-wrapper">
      <IonLabel>
        {[...new Array(6).fill('')].map((_, index) => {
          return (
            <div
              key={index}
              className={classNames('pin-input', {
                active: index <= inputValue.length,
                error,
              })}
            >
              {inputValue[index]}
            </div>
          );
        })}
        <IonInput
          ref={inputRef}
          maxlength={6}
          inputMode="numeric"
          value={inputValue}
          onIonChange={(e) => onChange(e)}
          type="number"
          autofocus
          onBlur={() => {
            inputRef?.current.getInputElement().then((el: any) => {
              el.focus();
            });
          }}
        />
      </IonLabel>
    </IonItem>
  );
};

export default PinInput;
