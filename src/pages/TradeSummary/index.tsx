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
  IonText,
} from '@ionic/react';
import { CurrencyIcon } from '../../components/icons';
import { transactionSelector } from '../../redux/reducers/transactionsReducer';
import { fromSatoshiFixed, tickerFromAssetHash } from '../../utils/helpers';
import { ellipsisHorizontal } from 'ionicons/icons';
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

  type ReceiveCurrencyIconProps = {
    width: string;
    height: string;
  } & React.HTMLAttributes<any>;
  const ReceiveCurrencyIcon: React.FC<ReceiveCurrencyIconProps> = ({
    width,
    height,
    ...props
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
        {...props}
      />
    );
  };

  return (
    <IonPage id="trade-summary">
      <IonContent>
        <Refresher />
        <IonGrid>
          <Header title="TRADE SUMMARY" hasBackButton={true} />
          {(transaction || preview) && (
            <>
              <IonRow className="ion-margin-bottom ion-text-center">
                <IonCol>
                  <div className="transaction-icons">
                    <SentCurrencyIcon width="45" height="45" />
                    <div className="receive-icon-container">
                      <ReceiveCurrencyIcon width="45" height="45" />
                      <ReceiveCurrencyIcon
                        className="duplicate"
                        width="55"
                        height="55"
                      />
                    </div>
                  </div>
                </IonCol>
              </IonRow>

              <IonRow className="ion-margin-bottom">
                <IonCol>
                  <IonItem>
                    <div className="trade-summary-item">
                      <div className="trade-items">
                        <div className="trade-item">
                          <div className="name">
                            <SentCurrencyIcon width="24" height="24" />
                            <span>
                              {transaction
                                ? tickerFromAssetHash(
                                    transaction.transfers[0].asset
                                  )
                                : preview?.sent.ticker}
                            </span>
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
                          <IonIcon color="medium" icon={ellipsisHorizontal} />
                        </div>

                        <div className="trade-item">
                          <div className="name">
                            <ReceiveCurrencyIcon width="24" height="24" />
                            <span>
                              {transaction
                                ? tickerFromAssetHash(
                                    transaction.transfers[1].asset
                                  )
                                : preview?.received.ticker}
                            </span>
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
                          {transaction && (
                            <span>
                              {transaction.blockTime &&
                                transaction.blockTime.format(
                                  'DD MMM YYYY hh:mm:ss'
                                )}
                            </span>
                          )}
                          {transaction ? (
                            <span>
                              {fromSatoshiFixed(transaction.fee, 8, 8)} Fee
                            </span>
                          ) : (
                            <IonSkeletonText
                              animated
                              style={{ width: '100%' }}
                            />
                          )}
                        </div>
                        <div className="transaction-info-values">
                          <span className="transaction-col-name">TxID</span>
                          <span className="transaction-col-value">{txid}</span>
                        </div>
                        <div className="transaction-info-values">
                          <span className="transaction-col-name">{''}</span>
                          {transaction?.blockTime || (
                            <span className="transaction-col-value pending">
                              <IonText color="warning">PENDING</IonText>
                              <IonIcon
                                color="warning"
                                icon={ellipsisHorizontal}
                              />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </IonItem>
                </IonCol>
              </IonRow>

              <IonRow className="ion-margin-vertical-x2">
                <IonCol size="9" offset="1.5">
                  <IonButton
                    className="main-button"
                    onClick={() => history.push('/history')}
                  >
                    GO TO TRADE HISTORY
                  </IonButton>
                </IonCol>
              </IonRow>
            </>
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(TradeSummary);
