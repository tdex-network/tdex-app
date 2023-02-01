import { IonRefresher, IonRefresherContent } from '@ionic/react';
import { chevronDownCircleOutline } from 'ionicons/icons';

const Refresher: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => {
  return (
    <IonRefresher
      slot="fixed"
      onIonRefresh={(e) => {
        // updateState()
        if (onRefresh) onRefresh();
        // Another top-right spinner shows actual update state
        setTimeout(() => e.detail.complete(), 1000);
      }}
    >
      <IonRefresherContent pullingIcon={chevronDownCircleOutline} refreshingSpinner="lines-small" />
    </IonRefresher>
  );
};

export default Refresher;
