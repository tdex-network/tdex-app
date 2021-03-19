import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps, useParams, withRouter } from 'react-router';
import {
  IonPage,
  IonTitle,
  IonContent,
  IonItem,
  IonButton,
  IonToolbar,
  IonHeader,
  IonIcon,
  IonLoading,
  useIonViewDidLeave,
  IonSkeletonText,
} from '@ionic/react';
import { CurrencyIcon, IconBack } from '../../components/icons';
import { transactionSelector } from '../../redux/reducers/transactionsReducer';
import { tickerFromAssetHash } from '../../redux/reducers/walletReducer';
import { fromSatoshiFixed } from '../../utils/helpers';
import { swapHorizontal } from 'ionicons/icons';
import { update } from '../../redux/actions/appActions';
import './style.scss';
import { AssetConfig } from '../../utils/constants';

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

const TradeSummary: React.FC<TradeSummaryProps> = ({
  history,
  location,
  assets,
}) => {
  const preview = location.state?.preview;
  const dispatch = useDispatch();
  const { txid } = useParams<{ txid: string }>();
  const transaction = useSelector(transactionSelector(txid));
  const [intervalUpdater, setIntervalUpdater] = useState<NodeJS.Timeout>();

  useEffect(() => {
    if (!transaction) {
      setIntervalUpdater(
        setInterval(() => {
          dispatch(update());
        }, 10000)
      );
    }
  }, []);

  useEffect(() => {
    if (transaction && intervalUpdater) {
      clearInterval(intervalUpdater);
      setIntervalUpdater(undefined);
    }
  }, [transaction]);

  useIonViewDidLeave(() => {
    if (intervalUpdater) {
      clearInterval(intervalUpdater);
    }
  });

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
        {transaction || preview ? (
          <div>
            <div className="transaction-icons">
              <span className="icon-wrapper large">
                <SentCurrencyIcon width="45px" height="45px" />
              </span>
              <span className="icon-wrapper large second">
                <ReceiveCurrencyIcon width="45px" height="45px" />
              </span>
            </div>
            <IonItem>
              <div className="trade-summary-item">
                <div className="trade-items">
                  <div className="trade-item">
                    <div className="name">
                      <span className="icon-wrapper medium">
                        <SentCurrencyIcon width="24px" height="24px" />
                      </span>
                      <p>
                        {transaction
                          ? tickerFromAssetHash(transaction.transfers[0].asset)
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
                      <span className="icon-wrapper medium">
                        <ReceiveCurrencyIcon width="24px" height="24px" />
                      </span>
                      <p>
                        {transaction
                          ? tickerFromAssetHash(transaction.transfers[1].asset)
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
                      <p>{transaction.time}</p>
                    ) : (
                      <IonSkeletonText animated style={{ width: '30%' }} />
                    )}
                    {transaction ? (
                      <p>{fromSatoshiFixed(transaction.fee, 8, 8)} Fee</p>
                    ) : (
                      <IonSkeletonText animated style={{ width: '15%' }} />
                    )}
                  </div>
                  <div className="transaction-info-values">
                    <div className="transaction-col-name">Tx ID</div>
                    <div className="transaction-col-value">{txid}</div>
                  </div>
                </div>
              </div>
            </IonItem>
            <div className="buttons">
              <IonButton
                routerLink="/history"
                className="main-button secondary"
              >
                Trade history
              </IonButton>
            </div>
          </div>
        ) : (
          <IonLoading isOpen={true} message="loading..." />
        )}
      </IonContent>
    </IonPage>
  );
};

export default withRouter(TradeSummary);
