import './style.scss';
import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonList,
  IonListHeader,
  IonPage,
  IonRow,
  IonSkeletonText,
} from '@ionic/react';
import React, { useEffect, useMemo, useState } from 'react';
import type { RouteComponentProps } from 'react-router';
import { useParams } from 'react-router';

import depositIcon from '../../assets/img/deposit-green.svg';
import swapIcon from '../../assets/img/swap-circle-green.svg';
import CurrencyIcon from '../../components/CurrencyIcon';
import Header from '../../components/Header';
import OperationListItem from '../../components/OperationListItem';
import Refresher from '../../components/Refresher';
import { useAssetStore } from '../../store/assetStore';
import { useBitcoinStore } from '../../store/bitcoinStore';
import { useSettingsStore } from '../../store/settingsStore';
import type { TxHeuristic } from '../../store/walletStore';
import { TxType, useWalletStore } from '../../store/walletStore';
import { LBTC_TICKER } from '../../utils/constants';
import { isLbtcTicker } from '../../utils/helpers';
import { compareTxDate } from '../../utils/transaction';

export const Operations: React.FC<RouteComponentProps> = ({ history }) => {
  const assets = useAssetStore((state) => state.assets);
  const fetchCurrentBtcBlockHeight = useBitcoinStore((state) => state.fetchCurrentBtcBlockHeight);
  const currency = useSettingsStore((state) => state.currency.ticker);
  const lbtcUnit = useSettingsStore((state) => state.lbtcUnit);
  const network = useSettingsStore((state) => state.network);
  const balances = useWalletStore((state) => state.balances);
  const computeHeuristicFromTx = useWalletStore((state) => state.computeHeuristicFromTx);
  const computeHeuristicFromPegins = useWalletStore((state) => state.computeHeuristicFromPegins);
  const txs = useWalletStore((state) => state.txs);
  //
  const { asset_id } = useParams<{ asset_id: string }>();
  const [txsToDisplay, setTxsToDisplay] = useState<TxHeuristic[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await fetchCurrentBtcBlockHeight();
      // Compute heuristic for each tx
      const txsHeuristicArray: TxHeuristic[] = [];
      for (const tx of Object.values(txs ?? {})) {
        const txHeuristic = await computeHeuristicFromTx(tx);
        if (txHeuristic) txsHeuristicArray.push(txHeuristic);
      }
      // Compute heuristic for each pegin
      const btcTxs = computeHeuristicFromPegins();
      btcTxs?.forEach((tx) => txsHeuristicArray.push(tx));
      // Filter by asset and sort by date
      const filteredTxs = txsHeuristicArray.filter((tx) => {
        if (tx.type === TxType.Swap) {
          return tx.swapReceived?.asset === asset_id || tx.swapSent?.asset === asset_id;
        } else {
          return tx.asset === asset_id;
        }
      });
      const sortedTxs = filteredTxs.sort(compareTxDate);
      setTxsToDisplay(sortedTxs);
      setIsLoading(false);
    })();
  }, [asset_id, computeHeuristicFromPegins, computeHeuristicFromTx, fetchCurrentBtcBlockHeight, txs]);

  // TODO: check if rerendered
  const ActionButtons = useMemo(
    () => (
      <IonRow className="ion-margin-top">
        <IonCol>
          <IonButtons>
            <IonButton
              className="coin-action-button"
              onClick={() => {
                history.push({
                  pathname: '/receive',
                  state: {
                    depositAsset: {
                      assetHash: assets[asset_id]?.assetHash,
                      ticker: assets[asset_id]?.ticker ?? LBTC_TICKER[network],
                      coinGeckoID: assets[asset_id]?.coinGeckoID ?? 'L-BTC',
                    },
                  },
                });
              }}
            >
              <div>
                <img src={depositIcon} alt="deposit" />
                Receive
              </div>
            </IonButton>
            <IonButton
              className="coin-action-button"
              data-testid="button-send"
              onClick={() => {
                history.push(`/withdraw/${asset_id}`);
              }}
            >
              <div>
                <img src={depositIcon} alt="withdraw" className="icon-withdraw" />
                Send
              </div>
            </IonButton>
            <IonButton className="coin-action-button" routerLink="/exchange">
              <div>
                <img src={swapIcon} alt="swap" />
                Swap
              </div>
            </IonButton>
          </IonButtons>
        </IonCol>
      </IonRow>
    ),
    [asset_id, assets, history, network]
  );

  const AssetBalance = useMemo(
    () => (
      <div className="asset-balance">
        <p className="info-amount ion-no-margin">
          {balances?.[asset_id]?.value ?? 0}
          <span>{isLbtcTicker(assets[asset_id]?.ticker || '') ? lbtcUnit : assets[asset_id]?.ticker}</span>
        </p>
        <span className="info-amount-converted">
          {balances?.[asset_id].counterValue ?? 0} {currency.toUpperCase()}
        </span>
      </div>
    ),
    [asset_id, assets, balances, currency, lbtcUnit]
  );

  return (
    <IonPage>
      <IonContent id="operations" scrollEvents={true} onIonScrollStart={(e) => e.preventDefault()}>
        <Refresher />
        <IonGrid>
          <Header title={`${assets[asset_id]?.name || assets[asset_id]?.ticker}`} hasBackButton={true} />
          <IonRow className="ion-margin-bottom header-info ion-text-center ion-margin-vertical">
            <IonCol>
              <CurrencyIcon assetHash={assets[asset_id]?.assetHash} />
              {AssetBalance}
            </IonCol>
          </IonRow>
          {ActionButtons}

          <IonRow>
            <IonCol>
              <IonList>
                <IonListHeader>Transactions</IonListHeader>
                {isLoading ? (
                  <IonSkeletonText animated style={{ height: '100px', width: '100%' }} />
                ) : (
                  <>
                    {txsToDisplay.length > 0 ? (
                      txsToDisplay.map((tx: TxHeuristic) => (
                        <OperationListItem tx={tx} key={tx.txid} listType="transaction" />
                      ))
                    ) : (
                      <p>You don't have any transactions yet</p>
                    )}
                  </>
                )}
              </IonList>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};
