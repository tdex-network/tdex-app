import React, { ChangeEvent, RefObject } from 'react';
import classNames from 'classnames';
import { IonContent, IonButtons, IonHeader, IonButton, IonImg, IonItem, IonInput, IonLabel, IonPage, IonTitle, IonToolbar, useIonViewDidEnter, IonBackButton } from '@ionic/react';
import './style.scss';

interface PinInput {
  inputValue: string,
  onChange: (e: ChangeEvent<HTMLInputElement>) => void,
  inputRef: any,
}

const PinInput: React.FC<PinInput> = ({ inputValue, onChange, inputRef }) => {
  return (
    <IonItem lines="none" className="pin-wrapper">
      <IonLabel>
          {[...new Array(6).fill(1)].map((_, index) => {
            return (
              <div className={classNames(
                "pin-input",
                {active: index <= inputValue.length}
              )}>
                {inputValue[index]}
              </div>
            )
          })}
      </IonLabel>
      <input
        ref={inputRef} 
        maxLength={6} 
        inputMode="numeric" 
        value={inputValue} 
        onChange={onChange} 
      />
    </IonItem>
  )
}

export default PinInput;