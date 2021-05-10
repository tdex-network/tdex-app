import React from 'react';
import { useSelector } from 'react-redux';
import { RouteComponentProps, useParams, withRouter } from 'react-router';
import {
  IonPage,
  IonContent,
  IonItem,
  IonButton,
  IonIcon,
  IonSkeletonText,
  IonRow,
  IonCol,
  IonGrid,
} from '@ionic/react';
import { CurrencyIcon } from '../../components/icons';
import { transactionSelector } from '../../redux/reducers/transactionsReducer';
import { fromSatoshiFixed, tickerFromAssetHash } from '../../utils/helpers';
import { swapHorizontal } from 'ionicons/icons';
import { AssetConfig } from '../../utils/constants';
import Refresher from '../../components/Refresher';
import Header from '../../components/Header';
import './style.scss';

export interface PreviewData {
  sent: {
    ticker: string;
    amount: string;
  };
  received: {
    ticker: string;
    amount: string;
  };
}

interface TradeSummaryLocationState {
  preview?: PreviewData;
}

interface TradeSummaryProps
  extends RouteComponentProps<any, any, TradeSummaryLocationState> {
  assets: Record<string, AssetConfig>;
}

const TradeSummary: React.FC<TradeSummaryProps> = ({ history, location }) => {
  const preview = location.state?.preview;
  const { txid } = useParams<{ txid: string }>();

  const transaction = useSelector(transactionSelector(txid));

  const SentCurrencyIcon: React.FC<{ width: string; height: string }> = ({
    width,
    height,
  }) => {
    return (
      <CurrencyIcon
        currency={
          transaction
            ? tickerFromAssetHash(transaction.transfers[0].asset)
            : preview?.sent.ticker
        }
        width={width}
        height={height}
      />
    );
  };

  const ReceiveCurrencyIcon: React.FC<{ width: string; height: string }> = ({
    width,
    height,
  }) => {
    return (
      <CurrencyIcon
        currency={
          transaction
            ? tickerFromAssetHash(transaction.transfers[1].asset)
            : preview?.received.ticker
        }
        width={width}
        height={height}
      />
    );
  };

  return (
    <IonPage>
      <IonContent className="trade-summary">
        <Refresher />
        <IonGrid>
          <Header title="TRADE SUMMARY" hasBackButton={true} />
          {(transaction || preview) && (
            <div>
              <div className="transaction-icons">
                <span>
                  <SentCurrencyIcon width="45px" height="45px" />
                </span>
                <span>
                  <ReceiveCurrencyIcon width="45px" height="45px" />
                </span>
              </div>

              <IonRow className="ion-margin-bottom">
                <IonCol>
                  <IonItem>
                    <div className="trade-summary-item">
                      <div className="trade-items">
                        <div className="trade-item">
                          <div className="name">
                            <span>
                              <SentCurrencyIcon width="24px" height="24px" />
                            </span>
                            <p>
                              {transaction
                                ? tickerFromAssetHash(
                                    transaction.transfers[0].asset
                                  )
                                : preview?.sent.ticker}
                            </p>
                          </div>
                          <p className="trade-price">
                            {transaction
                              ? fromSatoshiFixed(
                                  transaction.transfers[0].amount,
                                  8,
                                  8
                                )
                              : preview?.sent.amount}
                          </p>
                        </div>
                        <div className="trade-divider">
                          <IonIcon icon={swapHorizontal} />
                        </div>
                        <div className="trade-item">
                          <div className="name">
                            <span>
                              <ReceiveCurrencyIcon width="24px" height="24px" />
                            </span>
                            <p>
                              {transaction
                                ? tickerFromAssetHash(
                                    transaction.transfers[1].asset
                                  )
                                : preview?.received.ticker}
                            </p>
                          </div>
                          <p className="trade-price">
                            +
                            {transaction
                              ? fromSatoshiFixed(
                                  transaction.transfers[1].amount,
                                  8,
                                  8
                                )
                              : preview?.received.amount}
                          </p>
                        </div>
                      </div>
                      <div className="transaction-info">
                        <div className="transaction-info-date">
                          {transaction ? (
                            <p>
                              {transaction.blockTime
                                ? transaction.blockTime.format(
                                    'DD MMM YYYY hh:mm:ss'
                                  )
                                : 'NOT CONFIRMED'}
                            </p>
                          ) : (
                            <IonSkeletonText
                              animated
                              style={{ width: '30%' }}
                            />
                          )}
                          {transaction ? (
                            <p>{fromSatoshiFixed(transaction.fee, 8, 8)} Fee</p>
                          ) : (
                            <IonSkeletonText
                              animated
                              style={{ width: '15%' }}
                            />
                          )}
                        </div>
                        <div className="transaction-info-values">
                          <div className="transaction-col-name">Tx ID</div>
                          <div className="transaction-col-value">{txid}</div>
                        </div>
                      </div>
                    </div>
                  </IonItem>
                </IonCol>
              </IonRow>

              <IonRow className="ion-margin-vertical-x2">
                <IonCol size="8" offset="2">
                  <IonButton
                    className="main-button"
                    onClick={() => history.push('/history')}
                  >
                    GO TO TRADE HISTORY
                  </IonButton>
                </IonCol>
              </IonRow>
            </div>
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(TradeSummary);
