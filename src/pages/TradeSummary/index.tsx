import React from 'react';
import { useSelector } from 'react-redux';
import { withRouter } from 'react-router';
import {
  IonPage,
  IonTitle,
  IonContent,
  IonItem,
  IonButton,
  IonToolbar,
  IonHeader,
} from '@ionic/react';
import { CurrencyIcon, IconExchange, IconBack } from '../../components/icons';
import { formatAmount, formatDate } from '../../utils/helpers';
import './style.scss';

const TradeSummary: React.FC = ({ history }: any) => {
  const transactions = useSelector(
    (state: any) => state.exchange.trade.transactions
  );

  const transaction = transactions[transactions.length - 1];

  return (
    <IonPage>
      <div className="gradient-background"></div>
      <IonHeader className="">
        <IonToolbar className="with-back-button">
          <IonButton
            style={{ zIndex: 10 }}
            onClick={() => {
              history.goBack();
            }}
          >
            <IconBack />
          </IonButton>
          <IonTitle>Trade summary</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="trade-summary">
        <div className="transaction-icons">
          <span className="icon-wrapper large">
            <CurrencyIcon
              currency={transaction.sentAsset.ticker}
              width="45px"
              height="45px"
            />
          </span>
          <span
            className={`icon-wrapper large with-border ${
              transaction?.sentAsset?.ticker || 'lbtc'
            }-icon`}
          >
            <CurrencyIcon
              currency={transaction.receivedAsset.ticker}
              width="45px"
              height="45px"
            />
          </span>
        </div>
        <IonItem>
          <div className="trade-summary-item">
            <div className="trade-items">
              <div className="trade-item">
                <div className="name">
                  <span className="icon-wrapper medium">
                    <CurrencyIcon
                      currency={transaction.sentAsset.ticker}
                      width="24px"
                      height="24px"
                    />
                  </span>
                  <p>{transaction.sentAsset.ticker}</p>
                </div>
                <p className="trade-price">
                  -{formatAmount(transaction.sentAmount)}
                </p>
              </div>
              <div className="trade-divider">
                <IconExchange />
              </div>
              <div className="trade-item">
                <div className="name">
                  <span className="icon-wrapper medium">
                    <CurrencyIcon
                      currency={transaction.receivedAsset.ticker}
                      width="24px"
                      height="24px"
                    />
                  </span>
                  <p>{transaction.receiveAsset}</p>
                </div>
                <p className="trade-price">
                  +{formatAmount(transaction.receivedAmount)}
                </p>
              </div>
            </div>
            <div className="transaction-info">
              <div className="transaction-info-date">
                <p>{formatDate(transaction.createdAt)}</p>
                <p>{transaction.fee.amount}% Fee</p>
              </div>
              <div className="transaction-info-values">
                <div className="transaction-col-name">ADDR</div>
                <div className="transaction-col-value">
                  {transaction.address}
                </div>
              </div>
              <div className="transaction-info-values">
                <div className="transaction-col-name">T x ID</div>
                <div className="transaction-col-value">{transaction.txid}</div>
              </div>
            </div>
          </div>
        </IonItem>
        <div className="buttons">
          <IonButton routerLink="/history" className="main-button secondary">
            Go to trade history
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(TradeSummary);
