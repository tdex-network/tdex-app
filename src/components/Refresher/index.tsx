import { IonRefresher, IonRefresherContent } from '@ionic/react';
import { chevronDownCircleOutline } from 'ionicons/icons';
import React from 'react';
import { useDispatch } from 'react-redux';

import { update } from '../../redux/actions/appActions';

const Refresher: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => {
  const dispatch = useDispatch();

  return (
    <IonRefresher
      slot="fixed"
      onIonRefresh={e => {
        dispatch(update());
        if (onRefresh) onRefresh();
        setTimeout(() => e.detail.complete(), 2000);
      }}
    >
      <IonRefresherContent
        pullingIcon={chevronDownCircleOutline}
        refreshingSpinner="circles"
      />
    </IonRefresher>
  );
};

export default Refresher;
