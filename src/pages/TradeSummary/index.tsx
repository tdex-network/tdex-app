import './style.scss';
import { IonPage, IonContent, IonItem, IonIcon, IonSkeletonText, IonRow, IonCol, IonGrid, IonText } from '@ionic/react';
import { ellipsisHorizontal } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import type { RouteComponentProps } from 'react-router';
import { useParams } from 'react-router';

import CurrencyIcon from '../../components/CurrencyIcon';
import Header from '../../components/Header';
import Refresher from '../../components/Refresher';
import type { AssetState } from '../../store/assetStore';
import { useAssetStore } from '../../store/assetStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useToastStore } from '../../store/toastStore';
import type { TxHeuristic } from '../../store/walletStore';
import { useWalletStore } from '../../store/walletStore';
import { clipboardCopy } from '../../utils/clipboard';
import { fromSatoshiFixed } from '../../utils/helpers';

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

type SentCurrencyIconProps = {
  size: number;
  txHeuristic?: TxHeuristic;
  preview?: PreviewData;
  assets: AssetState['assets'];
};

const SentCurrencyIcon = ({ size, assets, txHeuristic, preview }: SentCurrencyIconProps) => {
  return (
    <CurrencyIcon
      assetHash={txHeuristic ? assets[txHeuristic.asset]?.assetHash : preview?.sent.asset ?? ''}
      size={size}
    />
  );
};

type ReceiveCurrencyIconProps = {
  size: number;
  txHeuristic?: TxHeuristic;
  preview?: PreviewData;
  assets: AssetState['assets'];
};

const ReceiveCurrencyIcon: React.FC<ReceiveCurrencyIconProps> = ({ size, txHeuristic, preview, assets }) => {
  return (
    <CurrencyIcon
      assetHash={txHeuristic ? assets[txHeuristic.asset]?.assetHash : preview?.received.asset ?? ''}
      size={size}
    />
  );
};

export const TradeSummary: React.FC<RouteComponentProps<any, any, TradeSummaryLocationState>> = ({ location }) => {
  const assets = useAssetStore((state) => state.assets);
  const explorerLiquidUI = useSettingsStore((state) => state.explorerLiquidUI);
  const addSuccessToast = useToastStore((state) => state.addSuccessToast);
  const txs = useWalletStore((state) => state.txs);
  const computeHeuristicFromTx = useWalletStore((state) => state.computeHeuristicFromTx);
  //
  const preview = location.state?.preview;
  const { txid } = useParams<{ txid: string }>();
  const [sentTxHeuristic, setSentTxHeuristic] = useState<TxHeuristic>();
  const [receivedTxHeuristic, setReceivedTxHeuristic] = useState<TxHeuristic>();
  const [transaction, setTransaction] = useState<TxHeuristic | undefined>();

  useEffect(() => {
    (async () => {
      const transaction = txs?.[txid];
      const sent = transaction ? await computeHeuristicFromTx(transaction, preview?.sent.asset ?? '') : undefined;
      const received = transaction
        ? await computeHeuristicFromTx(transaction, preview?.received.asset ?? '')
        : undefined;
      const tx = transaction ? await computeHeuristicFromTx(transaction) : undefined;
      setTransaction(tx);
      setSentTxHeuristic(sent);
      setReceivedTxHeuristic(received);
    })();
  }, [txid, txs, preview, computeHeuristicFromTx]);

  return (
    <IonPage id="trade-summary">
      <IonContent>
        <Refresher />
        <IonGrid>
          <Header title="TRADE SUMMARY" hasBackButton={true} />
          {(transaction || preview) && (
            <>
              <IonRow className="ion-margin-bottom ion-text-center">
                <IonCol>
                  <div className="transaction-icons">
                    <SentCurrencyIcon size={45} assets={assets} txHeuristic={sentTxHeuristic} preview={preview} />
                    <div className="receive-icon-container">
                      <ReceiveCurrencyIcon
                        size={45}
                        assets={assets}
                        txHeuristic={receivedTxHeuristic}
                        preview={preview}
                      />
                      <ReceiveCurrencyIcon
                        size={55}
                        assets={assets}
                        txHeuristic={receivedTxHeuristic}
                        preview={preview}
                      />
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
                            <SentCurrencyIcon
                              size={24}
                              assets={assets}
                              txHeuristic={sentTxHeuristic}
                              preview={preview}
                            />
                            <span>
                              {sentTxHeuristic?.asset ? assets[sentTxHeuristic.asset]?.ticker : preview?.sent.ticker}
                            </span>
                          </div>
                          <p className="trade-price" data-testid="trade-summary-sent-amount">
                            {preview
                              ? preview?.sent.amount
                              : fromSatoshiFixed(sentTxHeuristic?.amount.toString() ?? '0', 8, 8)}
                          </p>
                        </div>

                        <div className="trade-divider">
                          <IonIcon color="medium" icon={ellipsisHorizontal} />
                        </div>

                        <div className="trade-item">
                          <div className="name">
                            <ReceiveCurrencyIcon
                              size={24}
                              assets={assets}
                              txHeuristic={receivedTxHeuristic}
                              preview={preview}
                            />
                            <span>
                              {receivedTxHeuristic?.asset
                                ? assets[receivedTxHeuristic.asset]?.ticker
                                : preview?.received.ticker}
                            </span>
                          </div>
                          <p className="trade-price">
                            +
                            {preview
                              ? preview?.received.amount
                              : fromSatoshiFixed(receivedTxHeuristic?.amount.toString() ?? '0', 8, 8)}
                          </p>
                        </div>
                      </div>
                      <div className="transaction-info">
                        <div className="transaction-info-date">
                          {transaction && <span>{transaction.blockTime?.format('DD MMM YYYY HH:mm:ss')}</span>}
                          {transaction ? (
                            <span>{fromSatoshiFixed(transaction.fee.toString(), 8, 8)} Fee</span>
                          ) : (
                            <IonSkeletonText animated style={{ width: '100%' }} />
                          )}
                        </div>
                        <div
                          className="transaction-info-values"
                          onClick={() => {
                            clipboardCopy(`${explorerLiquidUI}/tx/${txid}`, () => {
                              addSuccessToast('TxID copied!');
                            });
                          }}
                        >
                          <span className="transaction-col-name">TxID</span>
                          <span className="transaction-col-value">{txid}</span>
                        </div>
                        <div className="transaction-info-values">
                          <span className="transaction-col-name">{''}</span>
                          {transaction?.blockTime ? (
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
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};
