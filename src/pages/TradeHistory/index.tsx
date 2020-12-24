import React from 'react';
import { useSelector } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import {
  IonPage,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonButton,
  IonToolbar,
  IonHeader,
  IonListHeader,
  IonIcon,
  IonLabel,
  IonText,
} from '@ionic/react';
import { IconBack, CurrencyIcon } from '../../components/icons';
import { checkmarkOutline } from 'ionicons/icons';
import { formatAmount, formatDate } from '../../utils/helpers';
import classNames from 'classnames';
import './style.scss';

const TradeHistory: React.FC<RouteComponentProps> = ({ history }) => {
  const transactions = useSelector(
    (state: any) => state.exchange.trade.transactions
  );

  const renderStatus: any = (status: string) => {
    return status === 'pending' ? (
      <div className="status pending">
        PENDING{' '}
        <span className="three-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </span>
      </div>
    ) : (
      <div className="status confirmed">
        CONFIRMED <IonIcon color="success" icon={checkmarkOutline}></IonIcon>
      </div>
    );
  };

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
          <IonTitle>Trade history</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="trade-history">
        <IonList>
          <IonListHeader>Today</IonListHeader>
          {transactions.map((transaction: any) => {
            return (
              <IonItem
                className={classNames('list-item transaction-item', {
                  open: true,
                })}
                onClick={() => {
                  history.push('/operations');
                }}
                key={transaction.txid}
              >
                <div
                  // https://github.com/ionic-team/ionic-framework/issues/21939#issuecomment-694259307
                  tabIndex={0}
                ></div>
                <div className="info-wrapper">
                  <div className="item-main-info">
                    <div className="item-start">
                      <div className="swap-images">
                        <span className="icon-wrapper">
                          <CurrencyIcon
                            currency={transaction.sentAsset.ticker}
                          />
                        </span>
                        <span className="icon-wrapper with-border">
                          <CurrencyIcon
                            currency={transaction.receivedAsset.ticker}
                          />
                        </span>
                      </div>
                      <div className="item-name">
                        <div className="main-row">
                          {`${transaction.sentAsset.ticker} / ${transaction.receivedAsset.ticker}`}
                        </div>
                        <div className="sub-row">
                          {formatDate(transaction.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="item-end">
                      <div className="amount">
                        <div className="main-row">
                          +{formatAmount(transaction.receivedAmount)}
                        </div>
                        <div className="main-row accent">
                          {transaction.receiveAsset}
                        </div>
                      </div>
                      {renderStatus(transaction.status)}
                    </div>
                  </div>
                  <div className="sub-info">
                    <div className="fee-row">
                      <IonLabel>
                        Fee{' '}
                        <span className="amount">
                          {transaction.fee.amount}%
                        </span>
                      </IonLabel>
                      <IonText>
                        -{formatAmount(transaction.sentAmount)}{' '}
                        <span className="currency">
                          {transaction.sentAsset.ticker}
                        </span>
                      </IonText>
                    </div>
                    <div className="info-row">
                      <IonLabel>ADDR</IonLabel>
                      <IonText>{transaction.address}</IonText>
                    </div>
                    <div className="info-row">
                      <IonLabel>TxID</IonLabel>
                      <IonText>{transaction.txid}</IonText>
                    </div>
                  </div>
                </div>
              </IonItem>
            );
          })}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(TradeHistory);
