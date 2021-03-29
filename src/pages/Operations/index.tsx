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
  IonIcon,
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { withRouter, RouteComponentProps, useParams } from 'react-router';
import classNames from 'classnames';
import { CurrencyIcon, IconBack, TxIcon } from '../../components/icons';
import { useSelector } from 'react-redux';
import { TxDisplayInterface, TxStatusEnum } from '../../utils/types';
import { fromSatoshi, fromSatoshiFixed } from '../../utils/helpers';
import { checkmarkSharp } from 'ionicons/icons';
import { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import { transactionsByAssetSelector } from '../../redux/reducers/transactionsReducer';
import { LBTC_TICKER } from '../../utils/constants';
import Refresher from '../../components/Refresher';

import './style.scss';

const txTypes = ['deposit', 'withdrawal', 'swap', 'trade'];
const statusText = {
  confirmed: 'confirmed',
  pending: 'pending',
};

interface OperationsProps extends RouteComponentProps {
  balances: BalanceInterface[];
  prices: Record<string, number>;
}

const Operations: React.FC<OperationsProps> = ({
  balances,
  prices,
  history,
}) => {
  const { asset_id } = useParams<{ asset_id: string }>();
  const [balance, setBalance] = useState<BalanceInterface>();
  const [opened, setOpened] = useState<string[]>([]);

  const currency = useSelector((state: any) => state.settings.currency);
  const transactionsToDisplay = useSelector(
    transactionsByAssetSelector(asset_id)
  );

  // effect to select the balance
  useEffect(() => {
    const balanceSelected = balances.find((bal) => bal.asset === asset_id);
    if (balanceSelected) {
      setBalance(balanceSelected);
    }
  }, [balances]);

  const open = (txID: string) => setOpened([...opened, txID]);
  const close = (txID: string) => setOpened(opened.filter((id) => id !== txID));
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
      <div className="gradient-background"></div>
      <IonContent className="operations">
        <Refresher />
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
              {balance &&
                fromSatoshiFixed(
                  balance?.amount,
                  balance.precision,
                  balance.precision
                )}
              <span>{balance?.ticker}</span>
            </p>
            {balance && balance.coinGeckoID && prices[balance.coinGeckoID] && (
              <p className="info-amount-converted">
                {(
                  fromSatoshi(balance.amount, balance.precision) *
                  prices[balance.coinGeckoID]
                ).toFixed(2)}{' '}
                {currency.toUpperCase()}
              </p>
            )}
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
          {balance &&
            transactionsToDisplay.map(
              (tx: TxDisplayInterface, index: number) => {
                const transfer = tx.transfers.find((t) => t.asset === asset_id);
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
                          <div className="icon-wrapper">
                            <TxIcon type={tx.type} />
                          </div>
                          <div className="item-name">
                            <div className="main-row">
                              {`${balance.ticker} ${txTypes[tx.type - 1]}`}
                            </div>
                            <div className="sub-row">
                              {isOpen(tx.txId)
                                ? tx.blockTime?.format('DD MMM YYYY hh:mm:ss')
                                : tx.blockTime?.format('DD MMM YYYY')}
                            </div>
                          </div>
                        </div>
                        <div className="item-end">
                          <div className="amount">
                            <div className="main-row">
                              {transfer
                                ? fromSatoshiFixed(
                                    transfer.amount,
                                    balance.precision,
                                    balance.precision
                                  )
                                : 'unknow'}
                            </div>
                            <div className="main-row accent">
                              {balance.ticker}
                            </div>
                          </div>
                          {transfer && balance.coinGeckoID && (
                            <div className="sub-row ta-end">
                              {(
                                fromSatoshi(
                                  transfer.amount,
                                  balance.precision
                                ) * prices[balance.coinGeckoID]
                              ).toFixed(2)}{' '}
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
                              {fromSatoshi(tx.fee, 8).toFixed(8)} {LBTC_TICKER}
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
              }
            )}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Operations);
