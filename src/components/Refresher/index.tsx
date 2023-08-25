import { IonRefresher, IonRefresherContent } from '@ionic/react';
import { chevronDownCircleOutline } from 'ionicons/icons';

import { useTdexStore } from '../../store/tdexStore';
import { useWalletStore } from '../../store/walletStore';

const Refresher: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => {
  const sync = useWalletStore((state) => state.sync);
  const subscribeAllScripts = useWalletStore((state) => state.subscribeAllScripts);

  return (
    <IonRefresher
      slot="fixed"
      onIonRefresh={async (e) => {
        await sync();
        // Do not await so that it doesn't block
        subscribeAllScripts();
        useTdexStore.getState().fetchMarkets();
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
