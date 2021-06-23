import { IonRefresher, IonRefresherContent } from '@ionic/react';
import { chevronDownCircleOutline } from 'ionicons/icons';
import React from 'react';
import { useDispatch } from 'react-redux';

import { updateState } from '../../redux/actions/appActions';

const Refresher: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => {
  const dispatch = useDispatch();

  return (
    <IonRefresher
      slot="fixed"
      onIonRefresh={e => {
        dispatch(updateState());
        if (onRefresh) onRefresh();
        // An other top-right spinner shows actual update state
        setTimeout(() => e.detail.complete(), 1000);
      }}
    >
      <IonRefresherContent
        pullingIcon={chevronDownCircleOutline}
        refreshingSpinner="lines-small"
      />
    </IonRefresher>
  );
};

export default Refresher;
