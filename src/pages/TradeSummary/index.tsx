import './style.scss';
import { IonPage, IonContent, IonItem, IonIcon, IonSkeletonText, IonRow, IonCol, IonGrid, IonText } from '@ionic/react';
import { ellipsisHorizontal } from 'ionicons/icons';
import React from 'react';
import { connect } from 'react-redux';
import type { RouteComponentProps } from 'react-router';
import { useParams, withRouter } from 'react-router';

import CurrencyIcon from '../../components/CurrencyIcon';
import Header from '../../components/Header';
import Refresher from '../../components/Refresher';
import { addSuccessToast } from '../../redux/actions/toastActions';
import { useTypedDispatch, useTypedSelector } from '../../redux/hooks';
import type { AssetsState } from '../../redux/reducers/assetsReducer';
import { transactionSelector } from '../../redux/reducers/transactionsReducer';
import type { RootState } from '../../redux/types';
import { clipboardCopy } from '../../utils/clipboard';
import { fromSatoshiFixed } from '../../utils/helpers';
import type { TxDisplayInterface } from '../../utils/types';

export interface PreviewData {
  sent: {
    asset: string;
    ticker: string;
    amount: string;
  };
  received: {
    asset: string;
    ticker: string;
    amount: string;
  };
}

interface TradeSummaryLocationState {
  preview?: PreviewData;
}

interface TradeSummaryProps extends RouteComponentProps<any, any, TradeSummaryLocationState> {
  assets: AssetsState;
}

type SentCurrencyIconProps = {
  size: number;
  transaction?: TxDisplayInterface;
  preview?: PreviewData;
  assets: AssetsState;
};
const SentCurrencyIcon = ({ size, assets, transaction, preview }: SentCurrencyIconProps) => {
  return (
    <CurrencyIcon
      assetHash={transaction ? assets[transaction.transfers?.[0]?.asset]?.assetHash : preview?.sent.asset ?? ''}
      size={size}
    />
  );
};

type ReceiveCurrencyIconProps = {
  size: number;
  transaction?: TxDisplayInterface;
  preview?: PreviewData;
  assets: AssetsState;
};
const ReceiveCurrencyIcon: React.FC<ReceiveCurrencyIconProps> = ({ size, transaction, preview, assets }) => {
  return (
    <CurrencyIcon
      assetHash={transaction ? assets[transaction.transfers?.[1]?.asset]?.assetHash : preview?.received.asset ?? ''}
      size={size}
    />
  );
};

const TradeSummary: React.FC<TradeSummaryProps> = ({ location, assets }) => {
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
                    <SentCurrencyIcon size={45} assets={assets} transaction={transaction} preview={preview} />
                    <div className="receive-icon-container">
                      <ReceiveCurrencyIcon size={45} assets={assets} transaction={transaction} preview={preview} />
                      <ReceiveCurrencyIcon size={55} assets={assets} transaction={transaction} preview={preview} />
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
                            <SentCurrencyIcon size={24} assets={assets} transaction={transaction} preview={preview} />
                            <span>
                              {transaction ? assets[transaction.transfers?.[0]?.asset]?.ticker : preview?.sent.ticker}
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
                              size={24}
                              assets={assets}
                              transaction={transaction}
                              preview={preview}
                            />
                            <span>
                              {transaction
                                ? assets[transaction.transfers?.[1]?.asset]?.ticker
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

const mapStateToProps = (state: RootState) => {
  return {
    assets: state.assets,
  };
};

export default withRouter(connect(mapStateToProps)(TradeSummary));
