import { IonCol, IonContent, IonGrid, IonList, IonListHeader, IonPage, IonRow, IonSkeletonText } from '@ionic/react';
import React, { useEffect } from 'react';

import Header from '../../components/Header';
import OperationListItem from '../../components/OperationListItem';
import type { TxHeuristic } from '../../store/walletStore';
import { TxType, useWalletStore } from '../../store/walletStore';

export const TradeHistory: React.FC = () => {
  const [swaps, setSwaps] = React.useState<TxHeuristic[]>([]);
  //
  const computeHeuristicFromTx = useWalletStore((state) => state.computeHeuristicFromTx);
  const txs = useWalletStore((state) => state.txs);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      let swapsArr = [];
      for (const txid of Object.keys(txs)) {
        const tx = await computeHeuristicFromTx(txs[txid]);
        if (!tx || tx.type !== TxType.Swap) continue;
        swapsArr.push(tx);
      }
      setSwaps(swapsArr);
      setIsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txs]);

  return (
    <IonPage id="trade-history">
      <IonContent>
        <IonGrid>
          <Header hasBackButton={true} title="TRADE HISTORY" />
          <>
            {isLoading ? (
              <>
                <p>Loading...</p>
                <IonSkeletonText animated style={{ width: '100%', height: '100px' }} />
              </>
            ) : (
              <>
                {swaps.length > 0 ? (
                  <IonList>
                    <IonListHeader>Swaps</IonListHeader>
                    {swaps.map((tx: TxHeuristic) => (
                      <OperationListItem tx={tx} key={tx.txid} listType="trade" />
                    ))}
                  </IonList>
                ) : (
                  <IonRow className="ion-text-center ion-margin">
                    <IonCol size="10" offset="1">
                      <p>You don't have any trades transactions. They will appear here.</p>
                    </IonCol>
                  </IonRow>
                )}
              </>
            )}
          </>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};
