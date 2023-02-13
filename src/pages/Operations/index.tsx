import './style.scss';
import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonItem,
  IonList,
  IonListHeader,
  IonPage,
  IonRow,
  IonText,
} from '@ionic/react';
import classNames from 'classnames';
import { checkmarkSharp } from 'ionicons/icons';
import { networks, payments } from 'liquidjs-lib';
import React, { useEffect, useMemo, useState } from 'react';
import type { RouteComponentProps } from 'react-router';
import { useParams } from 'react-router';
import { SLIP77Factory } from 'slip77';
import * as ecc from 'tiny-secp256k1';

import depositIcon from '../../assets/img/deposit-green.svg';
import swapIcon from '../../assets/img/swap-circle.svg';
import CurrencyIcon from '../../components/CurrencyIcon';
import Header from '../../components/Header';
import Refresher from '../../components/Refresher';
import { TxStatus } from '../../components/TxStatus';
import { TxIcon } from '../../components/icons';
import { useAssetStore } from '../../store/assetStore';
import { useBitcoinStore } from '../../store/bitcoinStore';
import { useSettingsStore } from '../../store/settingsStore';
import type { TxHeuristic } from '../../store/walletStore';
import { TxType, useWalletStore } from '../../store/walletStore';
import { LBTC_ASSET, LBTC_TICKER } from '../../utils/constants';
import { compareTxDate, fromSatoshi, fromSatoshiFixed, isLbtc, isLbtcTicker } from '../../utils/helpers';

const slip77 = SLIP77Factory(ecc);

export const Operations: React.FC<RouteComponentProps> = ({ history }) => {
  const assets = useAssetStore((state) => state.assets);
  const setModalClaimPegin = useBitcoinStore((state) => state.setModalClaimPegin);
  const currentBtcBlockHeight = useBitcoinStore((state) => state.currentBtcBlockHeight);
  const getCurrentBtcBlockHeight = useBitcoinStore((state) => state.getCurrentBtcBlockHeight);
  const currency = useSettingsStore((state) => state.currency.ticker);
  const lbtcUnit = useSettingsStore((state) => state.lbtcDenomination);
  const network = useSettingsStore((state) => state.network);
  const balances = useWalletStore((state) => state.balances);
  const computeHeuristicFromTx = useWalletStore((state) => state.computeHeuristicFromTx);
  const computeHeuristicFromPegins = useWalletStore((state) => state.computeHeuristicFromPegins);
  const txs = useWalletStore((state) => state.txs);
  const masterBlindingKey = useWalletStore((state) => state.masterBlindingKey);
  //
  const { asset_id } = useParams<{ asset_id: string }>();
  const [txsToDisplay, setTxsToDisplay] = useState<TxHeuristic[]>([]);

  useEffect(() => {
    (async () => {
      await getCurrentBtcBlockHeight();
      // Compute heuristic for each tx
      const txsHeuristicArray: TxHeuristic[] = [];
      for (const tx of Object.values(txs ?? {})) {
        const txHeuristic = await computeHeuristicFromTx(tx, asset_id);
        if (txHeuristic) txsHeuristicArray.push(txHeuristic);
      }
      // Compute heuristic for each pegin
      const btcTxs = computeHeuristicFromPegins();
      btcTxs?.forEach((tx) => txsHeuristicArray.push(tx));
      // Filter by asset and sort by date
      const filteredTxs = txsHeuristicArray.filter((tx) => tx.asset === asset_id);
      const sortedTxs = filteredTxs.sort(compareTxDate);
      setTxsToDisplay(sortedTxs);
    })();
  }, [asset_id, computeHeuristicFromPegins, computeHeuristicFromTx, getCurrentBtcBlockHeight, txs]);

  const onclickTx = (tx: TxHeuristic) => {
    if (TxType[tx.type] === 'Swap') {
      history.push(`/tradesummary/${tx.txid}`);
    } else if (TxType[tx.type] === 'Withdraw' || TxType[tx.type] === 'Deposit') {
      const master = slip77.fromMasterBlindingKey(masterBlindingKey);
      // TODO: transfers
      const derived = master.derive('tx.transfers[0].script');
      const p2wpkh = payments.p2wpkh({
        output: Buffer.from('tx.transfers[0].script', 'hex'),
        blindkey: derived.publicKey,
        network: networks[network],
      });
      history.push(`/transaction/${tx.txid}`, {
        address: p2wpkh.confidentialAddress,
        amount: fromSatoshiFixed(
          'tx.transfers[0].amount.toString()',
          assets[asset_id]?.precision ?? 8,
          assets[asset_id]?.precision ?? 8,
          isLbtc(asset_id, network) ? lbtcUnit : undefined
        ),
        asset: asset_id,
        lbtcUnit,
      });
    }
  };

  const getConfirmationCount = (txBlockHeight?: number) => {
    if (!txBlockHeight) return 0;
    // Plus the block that contains the tx
    return currentBtcBlockHeight - txBlockHeight + 1;
  };

  const checkIfPeginIsClaimable = (btcTx: TxHeuristic): boolean => {
    // Check if pegin not already claimed and utxo is mature
    return !btcTx.claimTxId && getConfirmationCount(btcTx.blockHeight) >= 102;
  };

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

  const OperationAmount = ({ transfer }: { transfer: TxHeuristic | undefined }) => (
    <div className="operation-amount">
      <div className="operation-amount__lbtc">
        {transfer
          ? fromSatoshiFixed(
              transfer.amount.toString(),
              assets[asset_id].precision,
              assets[asset_id].precision,
              isLbtcTicker(assets[asset_id].ticker) ? lbtcUnit : undefined
            )
          : 'unknown'}
        <span className="ticker">
          {TxType[transfer?.type ?? TxType.Unknow] === 'DepositBtc' || isLbtcTicker(assets[asset_id].ticker)
            ? lbtcUnit
            : assets[asset_id].ticker}
        </span>
      </div>
      <div className="operation-amount__fiat">
        <div>
          {balances?.[asset_id].counterValue ?? 0} {currency.toUpperCase()}
        </div>
      </div>
    </div>
  );

  return (
    <IonPage>
      <IonContent id="operations" scrollEvents={true} onIonScrollStart={(e) => e.preventDefault()}>
        <Refresher />
        <IonGrid>
          <Header title={`${assets[asset_id]?.name || assets[asset_id]?.ticker}`} hasBackButton={true} />
          <IonRow className="ion-margin-bottom header-info ion-text-center ion-margin-vertical">
            <IonCol>
              {balances?.[asset_id] ? (
                <CurrencyIcon assetHash={assets[asset_id]?.assetHash} />
              ) : (
                <CurrencyIcon assetHash={LBTC_ASSET[network].assetHash} />
              )}
              {AssetBalance}
            </IonCol>
          </IonRow>
          {ActionButtons}

          <IonRow>
            <IonCol>
              <IonList>
                <IonListHeader>Transactions</IonListHeader>
                {txsToDisplay.length ? (
                  txsToDisplay.map((tx: TxHeuristic, index) => {
                    return (
                      <IonItem
                        key={`${index}-${tx.txid}`}
                        button
                        detail={false}
                        onClick={() => onclickTx(tx)}
                        className="operation-item"
                      >
                        <IonRow>
                          <IonCol className="icon" size="1">
                            <TxIcon type={tx.type} />
                          </IonCol>
                          <IonCol className="pl-1" size="5.3">
                            <div className="asset">
                              {TxType[tx.type] === 'DepositBtc'
                                ? 'Receive BTC'
                                : `${TxType[tx.type]} ${assets[asset_id].ticker}`}
                            </div>
                            <div className="time">{tx.blockTime?.format('DD MMM YYYY HH:mm:ss')}</div>
                          </IonCol>
                          <IonCol className="ion-text-right" size="5.7">
                            <OperationAmount transfer={undefined} />
                          </IonCol>
                        </IonRow>
                        <div className="extra-infos">
                          {TxType[tx.type] !== 'DepositBtc' && (
                            <IonRow className="mt-1">
                              <IonCol className="pl-1" size="6" offset="1">
                                {`Fee: ${fromSatoshi(tx.fee.toString(), 8).toFixed(8)} ${LBTC_TICKER[network]}`}
                              </IonCol>
                              <IonCol className="ion-text-right" size="5">
                                <IonText>
                                  <TxStatus isConfirmed={tx?.blockHeight !== undefined} />
                                </IonText>
                              </IonCol>
                            </IonRow>
                          )}
                          <IonRow className="mt-1">
                            <IonCol className="pl-1" size="11" offset="1">
                              TxID: {tx.txid}
                            </IonCol>
                          </IonRow>
                          {TxType[tx.type] === 'DepositBtc' && (
                            <>
                              <IonRow className="mt-1">
                                {getConfirmationCount(tx.blockHeight) < 102 && (
                                  <IonCol
                                    className={classNames(
                                      {
                                        'confirmations-pending': getConfirmationCount(tx.blockHeight) < 102,
                                      },
                                      'pl-1'
                                    )}
                                    offset="1"
                                  >
                                    {`Confirmations: ${getConfirmationCount(tx.blockHeight)} / 102`}
                                  </IonCol>
                                )}
                                {tx.claimTxId && (
                                  <IonCol size="11" offset="1" className="pl-1">
                                    <span className="status-text confirmed claimed">
                                      <IonIcon icon={checkmarkSharp} />
                                      <span className="ml-05">Claimed</span>
                                    </span>
                                  </IonCol>
                                )}
                              </IonRow>
                              masterBlindingKey
                              {checkIfPeginIsClaimable(tx) && (
                                <IonRow className="ion-margin-top">
                                  <IonCol size="11" offset="0.5">
                                    <IonButton
                                      className="main-button claim-button"
                                      onClick={() => {
                                        // Trigger global PinModalClaimPegin in App.tsx
                                        setModalClaimPegin({
                                          isOpen: true,
                                          claimScriptToClaim: tx.claimScript,
                                        });
                                      }}
                                    >
                                      ClAIM NOW
                                    </IonButton>
                                  </IonCol>
                                </IonRow>
                              )}
                            </>
                          )}
                        </div>
                      </IonItem>
                    );
                  })
                ) : (
                  <p>You don't have any transactions yet</p>
                )}
              </IonList>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};
