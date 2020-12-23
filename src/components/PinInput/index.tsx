import React, { ChangeEvent } from 'react';
import classNames from 'classnames';
import { IonItem, IonLabel } from '@ionic/react';
import { uuid4 } from '@capacitor/core/dist/esm/util';
import './style.scss';

interface PinInputInterface {
  inputValue: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  inputRef: any;
  error?: string;
}

const PinInput: React.FC<PinInputInterface> = ({
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
      </IonLabel>
      <input
        ref={inputRef}
        maxLength={6}
        inputMode="numeric"
        value={inputValue}
        onChange={onChange}
        type="number"
      />
    </IonItem>
  );
};

export default PinInput;
