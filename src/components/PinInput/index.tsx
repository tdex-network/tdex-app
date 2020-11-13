import React, { ChangeEvent } from 'react';
import classNames from 'classnames';
import { IonItem, IonLabel } from '@ionic/react';
import './style.scss';

interface PinInputInterface {
  inputValue: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  inputRef: any;
}

const PinInput: React.FC<PinInputInterface> = ({
  inputValue,
  onChange,
  inputRef,
}) => {
  return (
    <IonItem lines="none" className="pin-wrapper">
      <IonLabel>
        {[...new Array(6).fill(1)].map((_, index) => {
          return (
            <div
              className={classNames('pin-input', {
                active: index <= inputValue.length,
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
