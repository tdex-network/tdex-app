import React from 'react';
import { useSelector } from 'react-redux';
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
} from '@ionic/react';
import { CurrencyIcon, IconExchange, IconBack } from '../../components/icons';
import './style.scss';
import { transactionSelector } from '../../redux/reducers/transactionsReducer';
import { tickerFromAssetHash } from '../../redux/reducers/walletReducer';
import { fromSatoshiFixed } from '../../utils/helpers';
import { swapHorizontal } from 'ionicons/icons';

const TradeSummary: React.FC<RouteComponentProps> = ({ history }) => {
  const { txid } = useParams<{ txid: string }>();
  const transaction = useSelector(transactionSelector(txid));

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
        {transaction && (
          <div>
            <div className="transaction-icons">
              <span className="icon-wrapper large">
                <CurrencyIcon
                  currency={tickerFromAssetHash(
                    transaction?.transfers[0].asset
                  )}
                  width="45px"
                  height="45px"
                />
              </span>
              <span className="icon-wrapper large second">
                <CurrencyIcon
                  currency={tickerFromAssetHash(
                    transaction?.transfers[1].asset
                  )}
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
                          currency={tickerFromAssetHash(
                            transaction?.transfers[0].asset
                          )}
                          width="24px"
                          height="24px"
                        />
                      </span>
                      <p>
                        {tickerFromAssetHash(transaction?.transfers[0].asset)}
                      </p>
                    </div>
                    <p className="trade-price">
                      {fromSatoshiFixed(transaction.transfers[0].amount, 8, 8)}
                    </p>
                  </div>
                  <div className="trade-divider">
                    <IonIcon icon={swapHorizontal} />
                  </div>
                  <div className="trade-item">
                    <div className="name">
                      <span className="icon-wrapper medium">
                        <CurrencyIcon
                          currency={tickerFromAssetHash(
                            transaction?.transfers[1].asset
                          )}
                          width="24px"
                          height="24px"
                        />
                      </span>
                      <p>
                        {tickerFromAssetHash(transaction?.transfers[1].asset)}
                      </p>
                    </div>
                    <p className="trade-price">
                      +{fromSatoshiFixed(transaction.transfers[1].amount, 8, 8)}
                    </p>
                  </div>
                </div>
                <div className="transaction-info">
                  <div className="transaction-info-date">
                    <p>{transaction.date}</p>
                    <p>{fromSatoshiFixed(transaction.fee, 8, 8)} Fee</p>
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
                Go to trade history
              </IonButton>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default withRouter(TradeSummary);
