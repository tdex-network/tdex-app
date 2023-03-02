import './style.scss';
import { IonPage, IonContent, IonItem, IonIcon, IonSkeletonText, IonRow, IonCol, IonGrid, IonText } from '@ionic/react';
import { ellipsisHorizontal } from 'ionicons/icons';
import { Transaction } from 'liquidjs-lib';
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router';

import CurrencyIcon from '../../components/CurrencyIcon';
import Header from '../../components/Header';
import Refresher from '../../components/Refresher';
import type { AssetState } from '../../store/assetStore';
import { useAssetStore } from '../../store/assetStore';
import { useToastStore } from '../../store/toastStore';
import type { TxHeuristic } from '../../store/walletStore';
import { useWalletStore } from '../../store/walletStore';
import { clipboardCopy } from '../../utils/clipboard';
import { makeURLwithBlinders } from '../../utils/helpers';
import { fromSatoshiFixed } from '../../utils/unitConversion';

export interface PreviewData {
  sent: {
    asset: string;
    ticker: string;
    amount: string;
  };
  received: {
    asset: string;
    ticker: string;
    amount: string;
  };
}

interface TradeSummaryLocationState {
  preview?: PreviewData;
}

type CurrencyIconProps = {
  size: number;
  txHeuristic?: TxHeuristic;
  preview?: PreviewData;
  assets: AssetState['assets'];
};

const SentCurrencyIcon = ({ size, assets, txHeuristic, preview }: CurrencyIconProps) => {
  return (
    <CurrencyIcon
      assetHash={txHeuristic ? assets[txHeuristic.swapSent?.asset ?? '']?.assetHash : preview?.sent.asset ?? ''}
      size={size}
    />
  );
};

const ReceiveCurrencyIcon = ({ size, txHeuristic, preview, assets }: CurrencyIconProps) => {
  return (
    <CurrencyIcon
      assetHash={txHeuristic ? assets[txHeuristic.swapReceived?.asset ?? '']?.assetHash : preview?.received.asset ?? ''}
      size={size}
    />
  );
};

export const TradeSummary: React.FC = () => {
  const assets = useAssetStore((state) => state.assets);
  const addSuccessToast = useToastStore((state) => state.addSuccessToast);
  const txs = useWalletStore((state) => state.txs);
  const computeHeuristicFromTx = useWalletStore((state) => state.computeHeuristicFromTx);
  const { state } = useLocation<TradeSummaryLocationState>();
  //
  const preview = state?.preview;
  const { txid } = useParams<{ txid: string }>();
  const [tx, setTransaction] = useState<TxHeuristic | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      if (!preview) {
        setIsLoading(true);
        const transaction = txs?.[txid];
        const tx = transaction ? await computeHeuristicFromTx(transaction) : undefined;
        setTransaction(tx);
        setIsLoading(false);
      }
    })();
  }, [txs, txid, computeHeuristicFromTx]);

  return (
    <IonPage id="trade-summary">
      <IonContent>
        <Refresher />
        <IonGrid>
          <Header title="TRADE SUMMARY" hasBackButton={true} />
          <>
            {isLoading ? (
              <IonSkeletonText animated style={{ width: '100%', height: '200px' }} />
            ) : (
              <>
                {tx || preview ? (
                  <>
                    <IonRow className="ion-margin-bottom ion-text-center">
                      <IonCol>
                        <div className="transaction-icons">
                          <SentCurrencyIcon size={45} assets={assets} txHeuristic={tx} preview={preview} />
                          <div className="receive-icon-container">
                            <ReceiveCurrencyIcon size={45} assets={assets} txHeuristic={tx} preview={preview} />
                            <ReceiveCurrencyIcon size={55} assets={assets} txHeuristic={tx} preview={preview} />
                          </div>
                        </div>
                      </IonCol>
                    </IonRow>

                    <IonRow className="ion-margin-bottom">
                      <IonCol>
                        <IonItem>
                          <div className="trade-summary-item">
                            <div className="trade-items">
                              <div className="trade-item">
                                <div className="name">
                                  <SentCurrencyIcon size={24} assets={assets} txHeuristic={tx} preview={preview} />
                                  <span>
                                    {tx?.swapSent?.asset ? assets[tx?.swapSent?.asset]?.ticker : preview?.sent.ticker}
                                  </span>
                                </div>
                                <p className="trade-price" data-testid="trade-summary-sent-amount">
                                  {preview ? preview?.sent.amount : -fromSatoshiFixed(tx?.swapSent?.amount ?? 0, 8, 8)}
                                </p>
                              </div>

                              <div className="trade-divider">
                                <IonIcon color="medium" icon={ellipsisHorizontal} />
                              </div>

                              <div className="trade-item">
                                <div className="name">
                                  <ReceiveCurrencyIcon size={24} assets={assets} txHeuristic={tx} preview={preview} />
                                  <span>
                                    {tx?.swapReceived?.asset
                                      ? assets[tx.swapReceived?.asset]?.ticker
                                      : preview?.received.ticker}
                                  </span>
                                </div>
                                <p className="trade-price">
                                  +
                                  {preview
                                    ? preview?.received.amount
                                    : fromSatoshiFixed(tx?.swapReceived?.amount ?? 0, 8, 8)}
                                </p>
                              </div>
                            </div>
                            <div className="transaction-info">
                              <div className="transaction-info-date">
                                {tx && <span>{tx.blockTime?.format('DD MMM YYYY HH:mm:ss')}</span>}
                                {tx ? (
                                  <span>{fromSatoshiFixed(tx.fee, 8, 8)} Fee</span>
                                ) : (
                                  <IonSkeletonText animated style={{ width: '100%' }} />
                                )}
                              </div>
                              <div
                                className="transaction-info-values"
                                onClick={async () => {
                                  clipboardCopy(await makeURLwithBlinders(Transaction.fromHex(txs[txid].hex)), () => {
                                    addSuccessToast('Transaction ID copied!');
                                  });
                                }}
                              >
                                <span className="transaction-col-name">TxID</span>
                                <span className="transaction-col-value">{txid}</span>
                              </div>
                              <div className="transaction-info-values">
                                <span className="transaction-col-name">{''}</span>
                                {tx?.blockTime ? (
                                  <></>
                                ) : (
                                  <span className="transaction-col-value pending">
                                    <IonText color="warning">PENDING</IonText>
                                    <IonIcon color="warning" icon={ellipsisHorizontal} />
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </IonItem>
                      </IonCol>
                    </IonRow>
                  </>
                ) : (
                  <p>It seems you don't have any swap yet</p>
                )}
              </>
            )}
          </>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};
