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
import { useSelector } from 'react-redux';
import type { RouteComponentProps } from 'react-router';
import { withRouter, useParams } from 'react-router';

import depositIcon from '../../assets/img/deposit-green.svg';
import swapIcon from '../../assets/img/swap-circle.svg';
import Header from '../../components/Header';
import Refresher from '../../components/Refresher';
import { CurrencyIcon, TxIcon } from '../../components/icons';
import type { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import WatchersLoader from '../../redux/containers/watchersLoaderContainer';
import { transactionsByAssetSelector } from '../../redux/reducers/transactionsReducer';
import type { LbtcDenomination } from '../../utils/constants';
import {
  defaultPrecision,
  LBTC_TICKER,
  MAIN_ASSETS,
} from '../../utils/constants';
import {
  compareTxDisplayInterfaceByDate,
  fromSatoshi,
  fromSatoshiFixed,
} from '../../utils/helpers';
import type { Transfer, TxDisplayInterface } from '../../utils/types';
import { TxStatusEnum, TxTypeEnum } from '../../utils/types';
import './style.scss';

const statusText = {
  confirmed: 'confirmed',
  pending: 'pending',
};

interface OperationsProps extends RouteComponentProps {
  balances: BalanceInterface[];
  prices: Record<string, number>;
  currency: string;
  lbtcUnit: LbtcDenomination;
  btcTxs: TxDisplayInterface[];
  currentBtcBlockHeight: number;
}

const Operations: React.FC<OperationsProps> = ({
  balances,
  prices,
  currency,
  history,
  lbtcUnit,
  btcTxs,
  currentBtcBlockHeight,
}) => {
  const { asset_id } = useParams<{ asset_id: string }>();
  const [balance, setBalance] = useState<BalanceInterface>();
  const [txRowOpened, setTxRowOpened] = useState<string[]>([]);

  const transactionsToDisplay = useSelector(
    transactionsByAssetSelector(asset_id),
  );

  useIonViewWillEnter(() => {
    setTxRowOpened([]);
  }, []);

  // effect to select the balance
  useEffect(() => {
    const balanceSelected = balances.find(bal => bal.asset === asset_id);
    if (balanceSelected) {
      setBalance(balanceSelected);
    } else {
      const asset = MAIN_ASSETS.find(a => a.assetHash === asset_id);
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

  const open = (txID: string) => setTxRowOpened([...txRowOpened, txID]);
  const close = (txID: string) =>
    setTxRowOpened(txRowOpened.filter(id => id !== txID));
  const isOpen = (txID: string) => txRowOpened.includes(txID);
  const onclickTx = (txID: string) => {
    if (isOpen(txID)) {
      close(txID);
      return;
    }
    open(txID);
  };

  const renderStatusText: any = (status: string) => {
    switch (status) {
      case TxStatusEnum.Confirmed:
        return (
          <span className="status-text confirmed">
            <IonIcon icon={checkmarkSharp} />
            <span className="ml-2">{statusText[status]}</span>
          </span>
        );
      case TxStatusEnum.Pending:
        return (
          <span className="status-text pending">{statusText[status]}</span>
        );
      default:
        return <span className="status-text pending" />;
    }
  };

  const getConfirmationCount = (txBlockHeight: number) => {
    // Plus the block that contains the tx
    return currentBtcBlockHeight - txBlockHeight + 1;
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
                Deposit
              </div>
            </IonButton>
            <IonButton
              className="coin-action-button"
              onClick={() => {
                history.push(`/withdraw/${asset_id}`);
              }}
            >
              <div>
                <img src={depositIcon} alt="deposit" />
                Withdraw
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
    [balance?.amount],
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
              balance.ticker === 'L-BTC' ? lbtcUnit : undefined,
            )}
          <span>
            {balance?.ticker === 'L-BTC' ? lbtcUnit : balance?.ticker}
          </span>
        </p>
        {balance?.coinGeckoID && prices[balance.coinGeckoID] && (
          <span className="info-amount-converted">
            {fromSatoshi(balance.amount.toString(), balance.precision)
              .mul(prices[balance.coinGeckoID])
              .toFixed(2)}{' '}
            {currency.toUpperCase()}
          </span>
        )}
      </div>
    ),
    [balance?.amount, lbtcUnit, prices],
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
              balance.ticker === 'L-BTC' ? lbtcUnit : undefined,
            )
          : 'unknown'}
        <span className="ticker">
          {TxTypeEnum[tx.type] === 'DepositBtc'
            ? 'BTC'
            : balance.ticker === 'L-BTC'
            ? lbtcUnit
            : balance.ticker}
        </span>
      </div>
      <div className="operation-amount__fiat">
        {transfer && balance.coinGeckoID && (
          <div>
            {fromSatoshi(transfer.amount.toString(), balance.precision)
              .mul(prices[balance.coinGeckoID])
              .toFixed(2)}{' '}
            {currency.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <IonPage>
      <IonContent
        id="operations"
        scrollEvents={true}
        onIonScrollStart={e => e.preventDefault()}
      >
        <Refresher />
        <IonGrid>
          <Header
            title={`${balance?.name || balance?.ticker}`}
            hasBackButton={true}
          />
          <IonRow className="ion-margin-bottom header-info ion-text-center ion-margin">
            <IonCol>
              {balance ? (
                <CurrencyIcon currency={balance?.ticker} />
              ) : (
                <CurrencyIcon currency={LBTC_TICKER} />
              )}
              {AssetBalance}
            </IonCol>
          </IonRow>
          {ActionButtons}

          <IonRow>
            <IonCol>
              <IonList>
                <IonListHeader>Transactions</IonListHeader>
                <WatchersLoader />
                {balance &&
                  transactionsToDisplay
                    .concat(btcTxs)
                    .sort(compareTxDisplayInterfaceByDate)
                    .map((tx: TxDisplayInterface) => {
                      const transfer = tx.transfers.find(
                        t => t.asset === asset_id,
                      );
                      return (
                        <IonItem
                          key={tx.txId}
                          button
                          onClick={() => onclickTx(tx.txId)}
                          className={classNames('operation-item', {
                            open: isOpen(tx.txId),
                          })}
                        >
                          <IonRow>
                            <IonCol className="icon" size="1">
                              <TxIcon type={tx.type} />
                            </IonCol>
                            <IonCol className="pl-5" size="5.5">
                              <div className="asset">
                                {TxTypeEnum[tx.type] === 'DepositBtc'
                                  ? 'BTC Deposit'
                                  : `${balance.ticker} ${TxTypeEnum[tx.type]}`}
                              </div>
                              <div className="time">
                                {isOpen(tx.txId)
                                  ? tx.blockTime?.format('DD MMM YYYY hh:mm:ss')
                                  : tx.blockTime?.format('DD MMM YYYY')}
                              </div>
                            </IonCol>
                            <IonCol className="ion-text-right" size="5.5">
                              <OperationAmount
                                balance={balance}
                                transfer={transfer}
                                tx={tx}
                              />
                            </IonCol>
                          </IonRow>
                          <div className="extra-infos">
                            {TxTypeEnum[tx.type] !== 'DepositBtc' && (
                              <IonRow className="mt-5">
                                <IonCol className="pl-5" size="6" offset="1">
                                  {`Fee: ${fromSatoshi(
                                    tx.fee.toString(),
                                    8,
                                  ).toFixed(8)} ${LBTC_TICKER}`}
                                </IonCol>
                                <IonCol className="ion-text-right" size="5">
                                  <IonText>
                                    {renderStatusText(tx.status)}
                                  </IonText>
                                </IonCol>
                              </IonRow>
                            )}
                            <IonRow className="mt-5">
                              <IonCol className="pl-5" size="11" offset="1">
                                TxID: {tx.txId}
                              </IonCol>
                            </IonRow>
                            {TxTypeEnum[tx.type] === 'DepositBtc' && (
                              <IonRow>
                                <IonCol
                                  className={classNames(
                                    {
                                      'confirmations-pending': tx.blockHeight
                                        ? getConfirmationCount(tx.blockHeight) <
                                          101
                                        : true,
                                    },
                                    'pl-5 mt-5',
                                  )}
                                  size="11"
                                  offset="1"
                                >
                                  Confirmations:{' '}
                                  {tx.blockHeight
                                    ? getConfirmationCount(tx.blockHeight)
                                    : 0}
                                </IonCol>
                              </IonRow>
                            )}
                          </div>
                        </IonItem>
                      );
                    })}
              </IonList>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Operations);
