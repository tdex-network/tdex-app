import React from 'react';
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
import { fromSatoshiFixed, tickerFromAssetHash } from '../../utils/helpers';
import classNames from 'classnames';
import { TxDisplayInterface } from '../../utils/types';
import './style.scss';
import { LBTC_TICKER } from '../../utils/constants';

interface TradeHistoryProps extends RouteComponentProps {
  swaps: TxDisplayInterface[];
}

const TradeHistory: React.FC<TradeHistoryProps> = ({ history, swaps }) => {
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
        {swaps.length > 0 ? (
          <IonList>
            <IonListHeader>Swaps</IonListHeader>
            {swaps.map((transaction: TxDisplayInterface) => {
              const transferSent = transaction.transfers.find(
                (t) => t.amount < 0
              );
              const transferReceived = transaction.transfers.find(
                (t) => t.amount > 0
              );

              if (!transferReceived || !transferSent) {
                return <></>;
              }

              const tickerSent = tickerFromAssetHash(transferSent.asset);
              const tickerReceived = tickerFromAssetHash(
                transferReceived.asset
              );
              return (
                <IonItem
                  className={classNames('list-item transaction-item', {
                    open: true,
                  })}
                  onClick={() => {
                    history.replace(`/tradesummary/${transaction.txId}`);
                  }}
                  key={transaction.txId}
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
                            <CurrencyIcon currency={tickerSent} />
                          </span>
                          <span className="icon-wrapper with-border">
                            <CurrencyIcon currency={tickerReceived} />
                          </span>
                        </div>
                        <div className="item-name">
                          <div className="main-row">
                            {`${tickerSent} / ${tickerReceived}`}
                          </div>
                          <div className="sub-row">
                            {transaction.blockTime?.format(
                              'DD MMM YYYY hh:mm:ss'
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="item-end">
                        <div className="amount">
                          <div className="main-row">
                            +{fromSatoshiFixed(transferReceived.amount, 8, 8)}
                          </div>
                          <div className="main-row accent">
                            {tickerReceived}
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
                            {transaction.fee} {LBTC_TICKER}
                          </span>
                        </IonLabel>
                        <IonText>
                          {fromSatoshiFixed(transferSent.amount, 8, 8)}{' '}
                          <span className="currency">{tickerSent}</span>
                        </IonText>
                      </div>
                      <div className="info-row">
                        <IonLabel>TxID</IonLabel>
                        <IonText>{transaction.txId}</IonText>
                      </div>
                    </div>
                  </div>
                </IonItem>
              );
            })}
          </IonList>
        ) : (
          <div className="no-swaps">
            <IonText color="light">
              You don't have any trades transactions. They will appear here.{' '}
            </IonText>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default withRouter(TradeHistory);
