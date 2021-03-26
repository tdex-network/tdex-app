import React, { useEffect } from 'react';
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
  IonSkeletonText,
} from '@ionic/react';
import { CurrencyIcon, IconBack } from '../../components/icons';
import { transactionSelector } from '../../redux/reducers/transactionsReducer';
import { fromSatoshiFixed, tickerFromAssetHash } from '../../utils/helpers';
import { swapHorizontal } from 'ionicons/icons';
import { AssetConfig } from '../../utils/constants';
import { update } from '../../redux/actions/appActions';
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
  const dispatch = useDispatch();
  const { txid } = useParams<{ txid: string }>();
  const transaction = useSelector(transactionSelector(txid));

  useEffect(() => {
    if (!transaction) {
      dispatch(update());
      const interval = setInterval(() => {
        dispatch(update());
      }, 8_000);
      return clearInterval(interval);
    }
  }, [preview, txid]);

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
        {(transaction || preview) && (
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
                className="main-button secondary"
                onClick={() => history.replace('/history')}
              >
                Trade history
              </IonButton>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default withRouter(TradeSummary);
