import {
  IonPage,
  IonButtons,
  IonContent,
  IonList,
  IonItem,
  IonButton,
  IonListHeader,
  IonLabel,
  IonText,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import classNames from 'classnames';
import { checkmarkSharp } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
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
import type { TxDisplayInterface } from '../../utils/types';
import { TxStatusEnum } from '../../utils/types';
import './style.scss';

const txTypes = ['deposit', 'withdrawal', 'swap', 'trade'];
const statusText = {
  confirmed: 'confirmed',
  pending: 'pending',
};

interface OperationsProps extends RouteComponentProps {
  balances: BalanceInterface[];
  prices: Record<string, number>;
  currency: string;
  lbtcUnit: LbtcDenomination;
}

const Operations: React.FC<OperationsProps> = ({
  balances,
  prices,
  currency,
  history,
  lbtcUnit,
}) => {
  const { asset_id } = useParams<{ asset_id: string }>();
  const [balance, setBalance] = useState<BalanceInterface>();
  const [opened, setOpened] = useState<string[]>([]);

  const transactionsToDisplay = useSelector(
    transactionsByAssetSelector(asset_id),
  );

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

  const open = (txID: string) => setOpened([...opened, txID]);
  const close = (txID: string) => setOpened(opened.filter(id => id !== txID));
  const isOpen = (txID: string) => opened.includes(txID);
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
            {' ' + statusText[status]}
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

  return (
    <IonPage>
      <IonContent className="operations">
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
            </IonCol>
          </IonRow>

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
                <IonButton
                  className="coin-action-button"
                  routerLink="/exchange"
                >
                  <div>
                    <img src={swapIcon} alt="swap" />
                    Swap
                  </div>
                </IonButton>
              </IonButtons>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <IonList>
                <IonListHeader>Transactions</IonListHeader>
                <WatchersLoader />
                {balance &&
                  transactionsToDisplay
                    .sort(compareTxDisplayInterfaceByDate)
                    .map((tx: TxDisplayInterface, index: number) => {
                      const transfer = tx.transfers.find(
                        t => t.asset === asset_id,
                      );
                      return (
                        <IonItem
                          onClick={() => onclickTx(tx.txId)}
                          key={index}
                          className={classNames('list-item transaction-item', {
                            open: isOpen(tx.txId),
                          })}
                        >
                          <div className="info-wrapper">
                            <div className="item-main-info">
                              <div className="item-start">
                                <TxIcon type={tx.type} />
                                <div className="item-name">
                                  <div className="main-row">
                                    {`${balance.ticker} ${
                                      txTypes[tx.type - 1]
                                    }`}
                                  </div>
                                  <div className="sub-row">
                                    {isOpen(tx.txId)
                                      ? tx.blockTime?.format(
                                          'DD MMM YYYY hh:mm:ss',
                                        )
                                      : tx.blockTime?.format('DD MMM YYYY')}
                                  </div>
                                </div>
                              </div>
                              <div className="item-end">
                                <div className="amount">
                                  <div className="main-row">
                                    {transfer
                                      ? fromSatoshiFixed(
                                          transfer.amount.toString(),
                                          balance.precision,
                                          balance.precision,
                                          balance.ticker === 'L-BTC'
                                            ? lbtcUnit
                                            : undefined,
                                        )
                                      : 'unknown'}
                                  </div>
                                  <div className="main-row accent">
                                    {balance.ticker === 'L-BTC'
                                      ? lbtcUnit
                                      : balance.ticker}
                                  </div>
                                </div>
                                {transfer && balance.coinGeckoID && (
                                  <div className="sub-row ta-end">
                                    {fromSatoshi(
                                      transfer.amount.toString(),
                                      balance.precision,
                                    )
                                      .mul(prices[balance.coinGeckoID])
                                      .toFixed(2)}{' '}
                                    {currency.toUpperCase()}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="sub-info">
                              <div className="fee-row">
                                <IonLabel>
                                  Fee{' '}
                                  <span className="amount">
                                    {fromSatoshi(tx.fee.toString(), 8).toFixed(
                                      8,
                                    )}{' '}
                                    {LBTC_TICKER}
                                  </span>
                                </IonLabel>
                                <IonText>{renderStatusText(tx.status)}</IonText>
                              </div>
                              <div className="info-row ion-text-wrap">
                                TxID {tx.txId}
                              </div>
                            </div>
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
