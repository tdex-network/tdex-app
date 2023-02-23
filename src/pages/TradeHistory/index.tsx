import './style.scss';
import { IonCol, IonContent, IonGrid, IonItem, IonList, IonListHeader, IonPage, IonRow, IonText } from '@ionic/react';
import classNames from 'classnames';
import React, { useEffect } from 'react';

import CurrencyIcon from '../../components/CurrencyIcon';
import Header from '../../components/Header';
import { TxStatus } from '../../components/TxStatus';
import { useSettingsStore } from '../../store/settingsStore';
import { useToastStore } from '../../store/toastStore';
import type { TxHeuristic } from '../../store/walletStore';
import { useWalletStore } from '../../store/walletStore';
import { clipboardCopy } from '../../utils/clipboard';
import { LBTC_TICKER } from '../../utils/constants';
import { fromSatoshi, fromSatoshiFixed } from '../../utils/unitConversion';

interface SwapProps {
  tx: TxHeuristic;
  index: number;
}

const Swap: React.FC<SwapProps> = ({ tx, index }) => {
  const explorerLiquidUI = useSettingsStore((state) => state.explorerLiquidUI);
  const network = useSettingsStore((state) => state.network);
  //const assets = useAssetStore((state) => state.assets);
  const addSuccessToast = useToastStore((state) => state.addSuccessToast);
  const computeHeuristicFromTx = useWalletStore((state) => state.computeHeuristicFromTx);
  const txs = useWalletStore((state) => state.txs);

  useEffect(() => {
    (async function () {
      const transfer = await computeHeuristicFromTx(txs[tx.txid], tx.asset);
      if (!transfer) return;
      //const transferSent = transfer.find((t) => t.amount < 0);
      //const transferReceived = tx.transfers.find((t) => t.amount > 0);
    })();
  }, [computeHeuristicFromTx, tx.asset, tx.txid, txs]);

  if (!txs?.[tx.txid]) return <React.Fragment key={index} />;

  /*
  if (!transferReceived || !transferSent) {
    return <React.Fragment key={index} />;
  }
  const precisionAssetReceived = assets[transferReceived.asset].precision;
  const tickerSent = assets[transferSent.asset].ticker;
  const tickerReceived = assets[transferReceived.asset].ticker;
  */

  return (
    <IonItem
      className={classNames('list-item transaction-item', {
        open: true,
      })}
      key={'tx.txid'}
    >
      <IonRow>
        <IonCol className="icon" size="1.2">
          <CurrencyIcon assetHash={'transferSent.asset'} />
          <CurrencyIcon assetHash={'transferReceived.asset'} />
        </IonCol>
        <IonCol className="pl-1" size="4.3">
          <div className="asset">{`${'tickerSent'}/${'tickerReceived'}`}</div>
        </IonCol>
        <IonCol className="ion-text-right trade-amount" size="6.5">
          {fromSatoshiFixed(
            0 /*transferReceived.amount*/,
            8 /*precisionAssetReceived*/ ?? 8,
            8 /*precisionAssetReceived*/ ?? 8
          )}
          <span className="ticker">{'tickerReceived'}</span>
        </IonCol>
      </IonRow>
      <div className="extra-infos">
        <IonRow className="mt-1">
          <IonCol className="pl-1" size="10.8" offset="1.2">
            <div className="time mt-1">{/*tx.blockTime?.format('DD MMM YYYY HH:mm:ss')*/ 0}</div>
          </IonCol>
        </IonRow>
        <IonRow className="mt-1">
          <IonCol className="pl-1" size="5.8" offset="1.2">
            {`Fee: ${fromSatoshi(0 /*tx.fee*/, 8 /*precisionAssetReceived*/ ?? 8).toFixed(
              8 /*precisionAssetReceived*/ ?? 8
            )} ${LBTC_TICKER[network]}`}
          </IonCol>
          <IonCol className="ion-text-right" size="5">
            <IonText>
              <TxStatus isConfirmed={/*tx.status.confirmed*/ false} />
            </IonText>
          </IonCol>
        </IonRow>
        <IonRow
          className="mt-1"
          onClick={() => {
            clipboardCopy(`${explorerLiquidUI}/tx/${'tx.txid'}`, () => {
              addSuccessToast('Transaction Id copied');
            });
          }}
        >
          <IonCol className="pl-1" size="10.8" offset="1.2">
            TxID: {'tx.txid'}
          </IonCol>
        </IonRow>
      </div>
    </IonItem>
  );
};

export const TradeHistory: React.FC = () => {
  //
  const [swaps] = React.useState<TxHeuristic[]>([]);

  return (
    <IonPage id="trade-history">
      <IonContent>
        <IonGrid>
          <Header hasBackButton={true} title="TRADE HISTORY" />
          {swaps.length > 0 ? (
            <IonList>
              <IonListHeader>Swaps</IonListHeader>
              {swaps.map((tx: TxHeuristic, index: number) => (
                <Swap tx={tx} index={index} />
              ))}
            </IonList>
          ) : (
            <IonRow className="ion-text-center ion-margin">
              <IonCol size="10" offset="1">
                <p>You don't have any trades transactions. They will appear here.</p>
              </IonCol>
            </IonRow>
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};
