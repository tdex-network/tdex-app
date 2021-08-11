import { Clipboard } from '@ionic-native/clipboard';
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
import { useDispatch } from 'react-redux';
import type { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router';

import Header from '../../components/Header';
import { CurrencyIcon } from '../../components/icons';
import { addSuccessToast } from '../../redux/actions/toastActions';
import { LBTC_TICKER } from '../../utils/constants';
import { fromSatoshiFixed, tickerFromAssetHash } from '../../utils/helpers';
import type { TxDisplayInterface } from '../../utils/types';

import './style.scss';

interface TradeHistoryProps extends RouteComponentProps {
  swaps: TxDisplayInterface[];
}

const TradeHistory: React.FC<TradeHistoryProps> = ({ swaps }) => {
  const dispatch = useDispatch();

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

  const copyTxId = (txid: string) => {
    Clipboard.copy(txid)
      .then(() => {
        dispatch(addSuccessToast('Transaction Id copied'));
      })
      .catch(() => {
        // For web platform
        navigator.clipboard.writeText(`https://blockstream.info/liquid/tx/${txid}`).catch(console.error);
        dispatch(addSuccessToast('Transaction Id copied'));
      });
  };

  return (
    <IonPage id="trade-history">
      <IonContent>
        <IonGrid>
          <Header hasBackButton={true} title="TRADE HISTORY" />
          {swaps.length > 0 ? (
            <IonList>
              <IonListHeader>Swaps</IonListHeader>
              {swaps.map((transaction: TxDisplayInterface, index: number) => {
                const transferSent = transaction.transfers.find((t) => t.amount < 0);
                const transferReceived = transaction.transfers.find((t) => t.amount > 0);

                if (!transferReceived || !transferSent) {
                  return <React.Fragment key={index} />;
                }

                const tickerSent = tickerFromAssetHash(transferSent.asset);
                const tickerReceived = tickerFromAssetHash(transferReceived.asset);
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
                            <div className="sub-row">{transaction.blockTime?.format('DD MMM YYYY HH:mm:ss')}</div>
                          </div>
                        </div>
                        <div className="item-end">
                          <div className="amount">
                            <div className="main-row">{fromSatoshiFixed(transferReceived.amount.toString(), 8, 8)}</div>
                            <div className="main-row accent">{tickerReceived}</div>
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
                            {fromSatoshiFixed(transferSent.amount.toString(), 8, 8)}{' '}
                            <span className="currency">{tickerSent}</span>
                          </IonText>
                        </div>
                        <div className="info-row">
                          <IonLabel>Id</IonLabel>
                          <IonItem className="tx-item ion-text-right" onClick={() => copyTxId(transaction.txId)}>
                            <IonText>{transaction.txId}</IonText>
                          </IonItem>
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
                <p>You don't have any trades transactions. They will appear here.</p>
              </IonCol>
            </IonRow>
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(TradeHistory);
