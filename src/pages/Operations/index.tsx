import './style.scss';
import {
  IonPage,
  IonButtons,
  IonContent,
  IonList,
  IonItem,
  IonButton,
  IonListHeader,
  IonText,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  useIonViewWillEnter,
} from '@ionic/react';
import classNames from 'classnames';
import { checkmarkSharp } from 'ionicons/icons';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RouteComponentProps } from 'react-router';
import { withRouter, useParams } from 'react-router';
import type { NetworkString } from 'tdex-sdk';

import depositIcon from '../../assets/img/deposit-green.svg';
import swapIcon from '../../assets/img/swap-circle.svg';
import Header from '../../components/Header';
import Refresher from '../../components/Refresher';
import { CurrencyIcon, TxIcon } from '../../components/icons';
import type { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import { setModalClaimPegin } from '../../redux/actions/btcActions';
import WatchersLoader from '../../redux/containers/watchersLoaderContainer';
import { transactionsByAssetSelector } from '../../redux/reducers/transactionsReducer';
import type { LbtcDenomination } from '../../utils/constants';
import { defaultPrecision, LBTC_TICKER, MAIN_ASSETS } from '../../utils/constants';
import {
  compareTxDisplayInterfaceByDate,
  fromSatoshi,
  fromSatoshiFixed,
  isLbtc,
  isLbtcTicker,
} from '../../utils/helpers';
import type { Transfer, TxDisplayInterface } from '../../utils/types';
import { TxStatusEnum, TxTypeEnum } from '../../utils/types';

interface OperationsProps extends RouteComponentProps {
  balances: BalanceInterface[];
  prices: Record<string, number>;
  currency: string;
  lbtcUnit: LbtcDenomination;
  btcTxs: TxDisplayInterface[];
  currentBtcBlockHeight: number;
  network: NetworkString;
}

const Operations: React.FC<OperationsProps> = ({
  balances,
  prices,
  currency,
  history,
  lbtcUnit,
  btcTxs,
  currentBtcBlockHeight,
  network,
}) => {
  const dispatch = useDispatch();
  const { asset_id } = useParams<{ asset_id: string }>();
  const [balance, setBalance] = useState<BalanceInterface>();
  const [txRowOpened, setTxRowOpened] = useState<string[]>([]);

  const transactionsByAsset = useSelector(transactionsByAssetSelector(asset_id));
  const transactionsToDisplay = isLbtc(asset_id, network) ? transactionsByAsset.concat(btcTxs) : transactionsByAsset;

  useIonViewWillEnter(() => {
    setTxRowOpened([]);
  }, []);

  // effect to select the balance
  useEffect(() => {
    const balanceSelected = balances.find((bal) => bal.asset === asset_id);
    if (balanceSelected) {
      setBalance(balanceSelected);
    } else {
      const asset = MAIN_ASSETS[network].find((a) => a.assetHash === asset_id);
      setBalance({
        asset: asset?.assetHash ?? '',
        amount: 0,
        coinGeckoID: asset?.coinGeckoID ?? '',
        ticker: asset?.ticker ?? '',
        precision: asset?.precision ?? defaultPrecision,
        name: asset?.name ?? '',
      });
    }
  }, [balances, asset_id]);

  const openTxRow = (txID: string) => setTxRowOpened([...txRowOpened, txID]);

  const closeTxRow = (txID: string) => setTxRowOpened(txRowOpened.filter((id) => id !== txID));

  const isTxRowOpen = (tx: TxDisplayInterface): boolean => {
    if (TxTypeEnum[tx.type] === 'DepositBtc') {
      const isClaimed = !!tx.claimTxId;
      const isClaimable = checkIfPeginIsClaimable(tx);
      if (!isClaimed && !isClaimable) {
        // Not claimed, not claimable => closed by default, normal onClick behavior
        return txRowOpened.includes(tx.txId);
      } else if (!isClaimed && isClaimable) {
        // Not claimed, claimable => open and button to claim
        return true;
      } else if (isClaimed) {
        // Claimed => closed by default, normal onClick behavior
        return txRowOpened.includes(tx.txId);
      } else {
        return txRowOpened.includes(tx.txId);
      }
    } else {
      return txRowOpened.includes(tx.txId);
    }
  };

  const onclickTx = (tx: TxDisplayInterface) => {
    if (isTxRowOpen(tx)) {
      closeTxRow(tx.txId);
      return;
    }
    openTxRow(tx.txId);
  };

  const renderStatusText: any = (status: string) => {
    const capitalized = (status[0].toUpperCase() + status.slice(1)) as keyof typeof TxStatusEnum;
    switch (status) {
      case TxStatusEnum.Confirmed:
        return (
          <span className="status-text confirmed">
            <IonIcon icon={checkmarkSharp} />
            <span className="ml-2">{TxStatusEnum[capitalized]}</span>
          </span>
        );
      case TxStatusEnum.Pending:
        return <span className="status-text pending">{TxStatusEnum[capitalized]}</span>;
      default:
        return <span className="status-text pending" />;
    }
  };

  const getConfirmationCount = (txBlockHeight?: number) => {
    if (!txBlockHeight) return 0;
    // Plus the block that contains the tx
    return currentBtcBlockHeight - txBlockHeight + 1;
  };

  const checkIfPeginIsClaimable = (btcTx: TxDisplayInterface): boolean => {
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
                      asset: balance?.asset,
                      ticker: balance?.ticker ?? LBTC_TICKER,
                      coinGeckoID: balance?.coinGeckoID ?? 'L-BTC',
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
    [balance?.amount]
  );

  const AssetBalance = useMemo(
    () => (
      <div className="asset-balance">
        <p className="info-amount ion-no-margin">
          {balance &&
            fromSatoshiFixed(
              balance?.amount.toString(),
              balance.precision,
              balance.precision,
              isLbtcTicker(balance.ticker) ? lbtcUnit : undefined
            )}
          <span>{isLbtcTicker(balance?.ticker || '') ? lbtcUnit : balance?.ticker}</span>
        </p>
        {balance?.coinGeckoID && prices[balance.coinGeckoID] && (
          <span className="info-amount-converted">
            {fromSatoshi(balance.amount.toString(), balance.precision).mul(prices[balance.coinGeckoID]).toFixed(2)}{' '}
            {currency.toUpperCase()}
          </span>
        )}
      </div>
    ),
    [balance?.amount, lbtcUnit, prices]
  );

  const OperationAmount = ({
    balance,
    transfer,
    tx,
  }: {
    balance: BalanceInterface;
    transfer: Transfer | undefined;
    tx: TxDisplayInterface;
  }) => (
    <div className="operation-amount">
      <div className="operation-amount__lbtc">
        {transfer
          ? fromSatoshiFixed(
              transfer.amount.toString(),
              balance.precision,
              balance.precision,
              isLbtcTicker(balance.ticker) ? lbtcUnit : undefined
            )
          : 'unknown'}
        <span className="ticker">
          {TxTypeEnum[tx.type] === 'DepositBtc' || isLbtcTicker(balance.ticker) ? lbtcUnit : balance.ticker}
        </span>
      </div>
      <div className="operation-amount__fiat">
        {transfer?.amount && balance.precision && balance?.coinGeckoID && prices[balance.coinGeckoID] && (
          <div>
            {fromSatoshi(transfer.amount.toString(), balance.precision).mul(prices[balance.coinGeckoID]).toFixed(2)}{' '}
            {currency.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <IonPage>
      <IonContent id="operations" scrollEvents={true} onIonScrollStart={(e) => e.preventDefault()}>
        <Refresher />
        <IonGrid>
          <Header title={`${balance?.name || balance?.ticker}`} hasBackButton={true} />
          <IonRow className="ion-margin-bottom header-info ion-text-center ion-margin-vertical">
            <IonCol>
              {balance ? <CurrencyIcon currency={balance?.ticker} /> : <CurrencyIcon currency={LBTC_TICKER} />}
              {AssetBalance}
            </IonCol>
          </IonRow>
          {ActionButtons}

          <IonRow>
            <IonCol>
              <IonList>
                <IonListHeader>Transactions</IonListHeader>
                <WatchersLoader />
                {balance && transactionsToDisplay.length ? (
                  transactionsToDisplay.sort(compareTxDisplayInterfaceByDate).map((tx: TxDisplayInterface, index) => {
                    const transfer = tx.transfers.find((t) => t.asset === asset_id);
                    return (
                      <IonItem
                        key={`${index}-${tx.txId}`}
                        button
                        detail={false}
                        onClick={() => onclickTx(tx)}
                        className={classNames('operation-item', {
                          open: isTxRowOpen(tx),
                        })}
                      >
                        <IonRow>
                          <IonCol className="icon" size="1">
                            <TxIcon type={tx.type} />
                          </IonCol>
                          <IonCol className="pl-5" size="5.3">
                            <div className="asset">
                              {TxTypeEnum[tx.type] === 'DepositBtc'
                                ? 'BTC Deposit'
                                : `${balance.ticker} ${TxTypeEnum[tx.type]}`}
                            </div>
                            <div className="time">
                              {isTxRowOpen(tx)
                                ? tx.blockTime?.format('DD MMM YYYY HH:mm:ss')
                                : tx.blockTime?.format('DD MMM YYYY')}
                            </div>
                          </IonCol>
                          <IonCol className="ion-text-right" size="5.7">
                            <OperationAmount balance={balance} transfer={transfer} tx={tx} />
                          </IonCol>
                        </IonRow>
                        <div className="extra-infos">
                          {TxTypeEnum[tx.type] !== 'DepositBtc' && (
                            <IonRow className="mt-3">
                              <IonCol className="pl-5" size="6" offset="1">
                                {`Fee: ${fromSatoshi(tx.fee.toString(), 8).toFixed(8)} ${LBTC_TICKER}`}
                              </IonCol>
                              <IonCol className="ion-text-right" size="5">
                                <IonText>{renderStatusText(tx.status)}</IonText>
                              </IonCol>
                            </IonRow>
                          )}
                          <IonRow className="mt-3">
                            <IonCol className="pl-5" size="11" offset="1">
                              TxID: {tx.txId}
                            </IonCol>
                          </IonRow>
                          {TxTypeEnum[tx.type] === 'DepositBtc' && (
                            <>
                              <IonRow className="mt-3">
                                {getConfirmationCount(tx.blockHeight) < 102 && (
                                  <IonCol
                                    className={classNames(
                                      {
                                        'confirmations-pending': getConfirmationCount(tx.blockHeight) < 102,
                                      },
                                      'pl-5'
                                    )}
                                    offset="1"
                                  >
                                    {`Confirmations: ${getConfirmationCount(tx.blockHeight)} / 102`}
                                  </IonCol>
                                )}
                                {tx.claimTxId && (
                                  <IonCol size="11" offset="1" className="pl-5">
                                    <span className="status-text confirmed claimed">
                                      <IonIcon icon={checkmarkSharp} />
                                      <span className="ml-2">Claimed</span>
                                    </span>
                                  </IonCol>
                                )}
                              </IonRow>
                              {checkIfPeginIsClaimable(tx) && (
                                <IonRow className="ion-margin-top">
                                  <IonCol size="11" offset="0.5">
                                    <IonButton
                                      className="main-button claim-button"
                                      onClick={() => {
                                        // Trigger global PinModalClaimPegin in App.tsx
                                        dispatch(
                                          setModalClaimPegin({
                                            isOpen: true,
                                            claimScriptToClaim: tx.claimScript,
                                          })
                                        );
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

export default withRouter(Operations);
