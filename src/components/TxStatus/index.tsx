import { IonIcon } from '@ionic/react';
import { checkmarkSharp } from 'ionicons/icons';
import React from 'react';

export const TxStatus: React.FC<{ isConfirmed: boolean }> = ({ isConfirmed }) => {
  if (isConfirmed) {
    return (
      <span className="status-text confirmed">
        <IonIcon icon={checkmarkSharp} />
        <span className="ml-05">Completed</span>
      </span>
    );
  } else {
    return <span className="status-text pending">Pending</span>;
  }
};
