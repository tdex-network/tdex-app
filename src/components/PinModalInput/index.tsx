import React from 'react';
import classNames from 'classnames';
import { IonInput, IonItem, IonLabel } from '@ionic/react';
import './style.scss';
import { uuid4 } from '@capacitor/core/dist/esm/util';

interface PinModalInputInterface {
  inputValue: string;
  onChange: (e: any) => void;
  inputRef: any;
  error?: string;
}

const PinModalInput: React.FC<PinModalInputInterface> = ({
  inputValue,
  onChange,
  inputRef,
  error,
}) => {
  return (
    <IonItem lines="none" className="pin-wrapper">
      <IonLabel>
        {[...new Array(6).fill('')].map((_, index) => {
          return (
            <div
              key={uuid4()}
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
          onIonChange={onChange}
          type="number"
          autofocus
          inputmode="numeric"
        />
      </IonLabel>
    </IonItem>
  );
};

export default PinModalInput;
