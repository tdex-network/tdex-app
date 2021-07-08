import { IonCol, IonRow } from '@ionic/react';
import type { ChangeEvent, HTMLAttributes, PropsWithChildren } from 'react';
import React from 'react';

import { IconCheck } from '../icons';
import './style.scss';

interface CheckboxProps extends PropsWithChildren<HTMLAttributes<any>> {
  handleChange: (checked: boolean) => void;
  inputName: string;
  isChecked: boolean;
  label: React.ReactElement;
}

const Checkbox: React.FC<CheckboxProps> = ({
  handleChange,
  inputName,
  isChecked,
  label,
  ...props
}) => {
  return (
    <IonRow className={`checkbox ion-text-center ${props.className}`}>
      <IonCol size="10" offset="1">
        <label>
          <input
            type="checkbox"
            data-cy="checkbox"
            name={inputName}
            checked={isChecked}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange(e.target.checked)
            }
          />
          <div className="custom-check">
            <div className="check-icon">
              <IconCheck />
            </div>
          </div>
          {label}
        </label>
      </IonCol>
    </IonRow>
  );
};

export default Checkbox;
