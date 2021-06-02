import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonListHeader,
  IonIcon,
  IonLabel,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import classNames from 'classnames';
import { checkmarkOutline } from 'ionicons/icons';
import React from 'react';
import type { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router';

import Header from '../../components/Header';
import { CurrencyIcon } from '../../components/icons';
import { LBTC_TICKER } from '../../utils/constants';
import { fromSatoshiFixed, tickerFromAssetHash } from '../../utils/helpers';
import type { TxDisplayInterface } from '../../utils/types';
import './style.scss';

interface TradeHistoryProps extends RouteComponentProps {
  swaps: TxDisplayInterface[];
}

const TradeHistory: React.FC<TradeHistoryProps> = ({ swaps }) => {
  const renderStatus: any = (status: string) => {
    return status === 'pending' ? (
      <div className="status pending">
        PENDING{' '}
        <span className="three-dots">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </span>
      </div>
    ) : (
      <div className="status confirmed">
        CONFIRMED <IonIcon color="success" icon={checkmarkOutline} />
      </div>
    );
  };

  return (
    <IonPage id="trade-history">
      <IonContent>
        <IonGrid>
          <Header hasBackButton={true} title="TRADE HISTORY" />
          {swaps.length > 0 ? (
            <IonList>
              <IonListHeader>Swaps</IonListHeader>
              {swaps.map((transaction: TxDisplayInterface) => {
                const transferSent = transaction.transfers.find(
                  t => t.amount < 0,
                );
                const transferReceived = transaction.transfers.find(
                  t => t.amount > 0,
                );

                if (!transferReceived || !transferSent) {
                  return <></>;
                }

                const tickerSent = tickerFromAssetHash(transferSent.asset);
                const tickerReceived = tickerFromAssetHash(
                  transferReceived.asset,
                );
                return (
                  <IonItem
                    className={classNames('list-item transaction-item', {
                      open: true,
                    })}
                    key={transaction.txId}
                  >
                    <div className="info-wrapper">
                      <div className="item-main-info">
                        <div className="swap-images">
                          <CurrencyIcon currency={tickerSent} />
                          <CurrencyIcon currency={tickerReceived} />
                        </div>
                        <div className="item-start">
                          <div className="item-name">
                            <div className="main-row">{`${tickerSent} / ${tickerReceived}`}</div>
                            <div className="sub-row">
                              {transaction.blockTime?.format(
                                'DD MMM YYYY hh:mm:ss',
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
            <IonRow className="ion-text-center ion-margin">
              <IonCol size="10" offset="1">
                <p>
                  You don't have any trades transactions. They will appear here.
                </p>
              </IonCol>
            </IonRow>
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(TradeHistory);
