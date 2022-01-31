import './style.scss';
import { IonPage, IonContent, IonItem, IonIcon, IonSkeletonText, IonRow, IonCol, IonGrid, IonText } from '@ionic/react';
import { ellipsisHorizontal } from 'ionicons/icons';
import React from 'react';
import type { RouteComponentProps } from 'react-router';
import { useParams, withRouter } from 'react-router';
import type { NetworkString } from 'tdex-sdk';

import Header from '../../components/Header';
import Refresher from '../../components/Refresher';
import { CurrencyIcon } from '../../components/icons';
import { addSuccessToast } from '../../redux/actions/toastActions';
import { useTypedDispatch, useTypedSelector } from '../../redux/hooks';
import type { AssetsState } from '../../redux/reducers/assetsReducer';
import { transactionSelector } from '../../redux/reducers/transactionsReducer';
import { clipboardCopy } from '../../utils/clipboard';
import { fromSatoshiFixed } from '../../utils/helpers';
import type { TxDisplayInterface } from '../../utils/types';

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

interface TradeSummaryProps extends RouteComponentProps<any, any, TradeSummaryLocationState> {
  assets: AssetsState;
  network: NetworkString;
}

type SentCurrencyIconProps = {
  width: string;
  height: string;
  transaction?: TxDisplayInterface;
  preview?: PreviewData;
  assets: AssetsState;
} & React.HTMLAttributes<any>;
const SentCurrencyIcon = ({ width, height, assets, transaction, preview }: SentCurrencyIconProps) => {
  return (
    <CurrencyIcon
      currency={transaction ? assets[transaction.transfers?.[0]?.asset].ticker : preview?.sent.ticker}
      width={width}
      height={height}
    />
  );
};

type ReceiveCurrencyIconProps = {
  width: string;
  height: string;
  transaction?: TxDisplayInterface;
  preview?: PreviewData;
  assets: AssetsState;
} & React.HTMLAttributes<any>;
const ReceiveCurrencyIcon: React.FC<ReceiveCurrencyIconProps> = ({
  width,
  height,
  transaction,
  preview,
  assets,
  ...props
}) => {
  return (
    <CurrencyIcon
      currency={transaction ? assets[transaction.transfers?.[1]?.asset].ticker : preview?.received.ticker}
      width={width}
      height={height}
      {...props}
    />
  );
};

const TradeSummary: React.FC<TradeSummaryProps> = ({ location, network, assets }) => {
  const dispatch = useTypedDispatch();
  const preview = location.state?.preview;
  const { txid } = useParams<{ txid: string }>();
  const transaction = useTypedSelector(transactionSelector(txid));
  const { explorerLiquidUI } = useTypedSelector(({ settings }) => ({ explorerLiquidUI: settings.explorerLiquidUI }));
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
                    <SentCurrencyIcon
                      width="45"
                      height="45"
                      assets={assets}
                      transaction={transaction}
                      preview={preview}
                    />
                    <div className="receive-icon-container">
                      <ReceiveCurrencyIcon
                        width="45"
                        height="45"
                        assets={assets}
                        transaction={transaction}
                        preview={preview}
                      />
                      <ReceiveCurrencyIcon
                        className="duplicate"
                        width="55"
                        height="55"
                        assets={assets}
                        transaction={transaction}
                        preview={preview}
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
                            <SentCurrencyIcon
                              width="24"
                              height="24"
                              assets={assets}
                              transaction={transaction}
                              preview={preview}
                            />
                            <span>
                              {transaction ? assets[transaction.transfers?.[0]?.asset].ticker : preview?.sent.ticker}
                            </span>
                          </div>
                          <p className="trade-price" data-cy="trade-summary-sent-amount">
                            {transaction
                              ? fromSatoshiFixed(transaction.transfers?.[0]?.amount.toString() ?? '0', 8, 8)
                              : preview?.sent.amount}
                          </p>
                        </div>

                        <div className="trade-divider">
                          <IonIcon color="medium" icon={ellipsisHorizontal} />
                        </div>

                        <div className="trade-item">
                          <div className="name">
                            <ReceiveCurrencyIcon
                              width="24"
                              height="24"
                              assets={assets}
                              transaction={transaction}
                              preview={preview}
                            />
                            <span>
                              {transaction
                                ? assets[transaction.transfers?.[1]?.asset].ticker
                                : preview?.received.ticker}
                            </span>
                          </div>
                          <p className="trade-price">
                            +
                            {transaction
                              ? fromSatoshiFixed(transaction.transfers?.[1]?.amount.toString() ?? '0', 8, 8)
                              : preview?.received.amount}
                          </p>
                        </div>
                      </div>
                      <div className="transaction-info">
                        <div className="transaction-info-date">
                          {transaction && <span>{transaction.blockTime?.format('DD MMM YYYY HH:mm:ss')}</span>}
                          {transaction ? (
                            <span>{fromSatoshiFixed(transaction.fee.toString(), 8, 8)} Fee</span>
                          ) : (
                            <IonSkeletonText animated style={{ width: '100%' }} />
                          )}
                        </div>
                        <div
                          className="transaction-info-values"
                          onClick={() => {
                            clipboardCopy(`${explorerLiquidUI}/tx/${txid}`, () => {
                              dispatch(addSuccessToast('TxID copied!'));
                            });
                          }}
                        >
                          <span className="transaction-col-name">TxID</span>
                          <span className="transaction-col-value">{txid}</span>
                        </div>
                        <div className="transaction-info-values">
                          <span className="transaction-col-name">{''}</span>
                          {transaction?.blockTime ? (
                            <></>
                          ) : (
                            <span className="transaction-col-value pending">
                              <IonText color="warning">PENDING</IonText>
                              <IonIcon color="warning" icon={ellipsisHorizontal} />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </IonItem>
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
