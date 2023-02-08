import { IonRefresher, IonRefresherContent } from '@ionic/react';
import { chevronDownCircleOutline } from 'ionicons/icons';

import { useWalletStore } from '../../store/walletStore';

const Refresher: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => {
  const computeBalances = useWalletStore((state) => state.computeBalances);
  const sync = useWalletStore((state) => state.sync);

  return (
    <IonRefresher
      slot="fixed"
      onIonRefresh={async (e) => {
        await sync();
        await computeBalances();
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
