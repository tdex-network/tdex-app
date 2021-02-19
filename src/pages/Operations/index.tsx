import {
  IonPage,
  IonButtons,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonButton,
  IonToolbar,
  IonHeader,
  IonListHeader,
  IonLabel,
  IonText,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { withRouter, RouteComponentProps, useParams } from 'react-router';
import classNames from 'classnames';
import { CurrencyIcon, IconBack, TxIcon } from '../../components/icons';
import './style.scss';
import { useDispatch, useSelector } from 'react-redux';
import { TxDisplayInterface, TxStatusEnum } from '../../utils/types';
import { formatPriceString, fromSatoshi } from '../../utils/helpers';
import { chevronDownCircleOutline } from 'ionicons/icons';
import { RefresherEventDetail } from '@ionic/core';
import { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import { updateTransactions } from '../../redux/actions/transactionsActions';

const txTypes = ['deposit', 'withdrawal', 'swap', 'trade'];
const statusText = {
  confirmed: 'completed',
  pending: 'pending',
};

interface OperationsProps extends RouteComponentProps {
  balances: BalanceInterface[];
  prices: Record<string, number>;
  transactionsByAsset: Record<string, TxDisplayInterface[]>;
}

const Operations: React.FC<OperationsProps> = ({
  balances,
  prices,
  transactionsByAsset,
  history,
}) => {
  const { asset_id } = useParams<{ asset_id: string }>();
  const [balance, setBalance] = useState<BalanceInterface>();
  const [fiat, setFiat] = useState<number>();
  const currency = useSelector((state: any) => state.settings.currency);
  const [transactionsToDisplay, setTransactionsToDisplay] = useState<
    TxDisplayInterface[]
  >([]);

  const dispatch = useDispatch();

  // effect for fiat equivalent
  useEffect(() => {
    if (balance && balance.coinGeckoID) {
      const p = prices[balance.coinGeckoID];
      if (!p) {
        setFiat(undefined);
        return;
      }
      setFiat(p * fromSatoshi(balance.amount));
      return;
    }

    setFiat(undefined);
  }, [prices, balances]);

  // effect to select the balance
  useEffect(() => {
    const balanceSelected = balances.find((bal) => bal.asset === asset_id);
    if (balanceSelected) {
      setBalance(balanceSelected);
    }
  }, [balances]);

  useEffect(() => {
    if (balance && transactionsByAsset && transactionsByAsset[asset_id]) {
      const txs = transactionsByAsset[asset_id].map(
        (tx: TxDisplayInterface) => {
          let priceEquivalent = '??';
          if (prices && balance.coinGeckoID && prices[balance.coinGeckoID]) {
            priceEquivalent = formatPriceString(
              prices[balance.coinGeckoID] * fromSatoshi(tx.amount)
            );
          }

          return {
            ...tx,
            priceEquivalent,
            ticker: balance.ticker,
          };
        }
      );

      setTransactionsToDisplay(txs);
    }
  }, [transactionsByAsset, balance, prices]);

  const renderStatusText: any = (status: string) => {
    switch (status) {
      case TxStatusEnum.Confirmed:
        return (
          <span className="status-text confirmed">{statusText[status]}</span>
        );
      case TxStatusEnum.Pending:
        return (
          <span className="status-text pending">{statusText[status]}</span>
        );
      default:
        return <span className="status-text pending" />;
    }
  };

  const onRefresh = (event: CustomEvent<RefresherEventDetail>) => {
    dispatch(updateTransactions());
    setTimeout(() => {
      event.detail.complete();
    }, 2000);
  };

  return (
    <IonPage>
      <div className="gradient-background"></div>
      <IonContent className="operations">
        <IonRefresher slot="fixed" onIonRefresh={onRefresh}>
          <IonRefresherContent
            pullingIcon={chevronDownCircleOutline}
            refreshingSpinner="circles"
          />
        </IonRefresher>
        <IonHeader className="header operations">
          <IonToolbar className="with-back-button">
            <IonButton style={{ zIndex: 10 }} onClick={() => history.goBack()}>
              <IconBack />
            </IonButton>
            <IonTitle>{balance?.ticker} operations</IonTitle>
          </IonToolbar>
          <div className="header-info">
            <div className="img-wrapper">
              {balance && <CurrencyIcon currency={balance?.ticker} />}
            </div>
            <p className="info-amount">
              {balance && fromSatoshi(balance?.amount).toFixed(2)}
              <span>{balance?.ticker}</span>
            </p>
            <p className="info-amount-converted">
              {fiat || '??'} {currency.toUpperCase()}
            </p>
          </div>
          <IonButtons className="operations-buttons">
            <IonButton className="coin-action-button" routerLink="/receive">
              Deposit
            </IonButton>
            <IonButton
              className="coin-action-button"
              onClick={() => {
                history.push(`/withdraw/${asset_id}`);
              }}
            >
              Withdraw
            </IonButton>
            <IonButton className="coin-action-button" routerLink="/exchange">
              Swap
            </IonButton>
          </IonButtons>
        </IonHeader>
        <IonList>
          <IonListHeader>Transactions</IonListHeader>
          {transactionsToDisplay.map((tx: any, index: number) => (
            <IonItem
              key={index}
              // onClick={() => toggleTxOpen(index)}
              className={classNames('list-item transaction-item', {
                open: tx.open,
              })}
            >
              <div className="info-wrapper">
                <div className="item-main-info">
                  <div className="item-start">
                    <div className="icon-wrapper">
                      <TxIcon type={tx.type} />
                    </div>
                    <div className="item-name">
                      <div className="main-row">
                        {tx.ticker} {txTypes[tx.type - 1]}
                      </div>
                      <div className="sub-row">
                        {tx.open ? tx.time : tx.date}
                      </div>
                    </div>
                  </div>
                  <div className="item-end">
                    <div className="amount">
                      <div className="main-row">
                        {tx.sign}
                        {tx.amountDisplayFormatted}
                      </div>
                      <div className="main-row accent">{tx.ticker}</div>
                    </div>
                    {tx.priceEquivalent && (
                      <div className="sub-row ta-end">
                        {tx.sign}
                        {tx.priceEquivalent} {currency.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="sub-info">
                  <div className="fee-row">
                    <IonLabel>
                      Fee <span className="amount">{tx.fee}</span>
                    </IonLabel>
                    <IonText>{renderStatusText(tx.status)}</IonText>
                  </div>
                  <div className="info-row">
                    <IonLabel>ADDR</IonLabel>
                    <IonText>{tx.address}</IonText>
                  </div>
                  <div className="info-row">
                    <IonLabel>TxID</IonLabel>
                    <IonText>{tx.txId}</IonText>
                  </div>
                </div>
              </div>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Operations);
