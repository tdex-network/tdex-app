import './style.scss';
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonListHeader,
  IonIcon,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import classNames from 'classnames';
import { checkmarkSharp } from 'ionicons/icons';
import React from 'react';
import { connect } from 'react-redux';
import type { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router';
import type { NetworkString } from 'tdex-sdk';

import CurrencyIcon from '../../components/CurrencyIcon';
import Header from '../../components/Header';
import { addSuccessToast } from '../../redux/actions/toastActions';
import { useTypedDispatch } from '../../redux/hooks';
import type { AssetsState } from '../../redux/reducers/assetsReducer';
import { tradeTransactionsSelector } from '../../redux/reducers/transactionsReducer';
import type { RootState } from '../../redux/types';
import { clipboardCopy } from '../../utils/clipboard';
import { LBTC_TICKER } from '../../utils/constants';
import { compareTxDisplayInterfaceByDate, fromSatoshi, fromSatoshiFixed } from '../../utils/helpers';
import type { TxDisplayInterface } from '../../utils/types';
import { TxStatusEnum } from '../../utils/types';

interface TradeHistoryProps extends RouteComponentProps {
  assets: AssetsState;
  explorerLiquidUI: string;
  network: NetworkString;
  swaps: TxDisplayInterface[];
}

const TradeHistory: React.FC<TradeHistoryProps> = ({ swaps, explorerLiquidUI, network, assets }) => {
  const dispatch = useTypedDispatch();

  const renderStatusText: any = (status: TxStatusEnum) => {
    const capitalized = (status[0].toUpperCase() + status.slice(1)) as keyof typeof TxStatusEnum;
    switch (status) {
      case TxStatusEnum.Confirmed:
        return (
          <span className="status-text confirmed">
            <IonIcon icon={checkmarkSharp} />
            <span className="ml-05">{TxStatusEnum[capitalized]}</span>
          </span>
        );
      case TxStatusEnum.Pending:
        return <span className="status-text pending">{TxStatusEnum[capitalized]}</span>;
      default:
        return <span className="status-text pending" />;
    }
  };

  return (
    <IonPage id="trade-history">
      <IonContent>
        <IonGrid>
          <Header hasBackButton={true} title="TRADE HISTORY" />
          {swaps.length > 0 ? (
            <IonList>
              <IonListHeader>Swaps</IonListHeader>
              {swaps.map((tx: TxDisplayInterface, index: number) => {
                const transferSent = tx.transfers.find((t) => t.amount < 0);
                const transferReceived = tx.transfers.find((t) => t.amount > 0);
                if (!transferReceived || !transferSent) {
                  return <React.Fragment key={index} />;
                }
                const precisionAssetReceived = assets[transferReceived.asset].precision;
                const tickerSent = assets[transferSent.asset].ticker;
                const tickerReceived = assets[transferReceived.asset].ticker;
                return (
                  <IonItem
                    className={classNames('list-item transaction-item', {
                      open: true,
                    })}
                    key={tx.txId}
                  >
                    <IonRow>
                      <IonCol className="icon" size="1.2">
                        <CurrencyIcon assetHash={transferSent.asset} />
                        <CurrencyIcon assetHash={transferReceived.asset} />
                      </IonCol>
                      <IonCol className="pl-1" size="4.3">
                        <div className="asset">{`${tickerSent}/${tickerReceived}`}</div>
                      </IonCol>
                      <IonCol className="ion-text-right trade-amount" size="6.5">
                        {fromSatoshiFixed(
                          transferReceived.amount.toString(),
                          precisionAssetReceived ?? 8,
                          precisionAssetReceived ?? 8
                        )}
                        <span className="ticker">{tickerReceived}</span>
                      </IonCol>
                    </IonRow>
                    <div className="extra-infos">
                      <IonRow className="mt-1">
                        <IonCol className="pl-1" size="10.8" offset="1.2">
                          <div className="time mt-1">{tx.blockTime?.format('DD MMM YYYY HH:mm:ss')}</div>
                        </IonCol>
                      </IonRow>
                      <IonRow className="mt-1">
                        <IonCol className="pl-1" size="5.8" offset="1.2">
                          {`Fee: ${fromSatoshi(tx.fee.toString(), precisionAssetReceived ?? 8).toFixed(
                            precisionAssetReceived ?? 8
                          )} ${LBTC_TICKER[network]}`}
                        </IonCol>
                        <IonCol className="ion-text-right" size="5">
                          <IonText>{renderStatusText(tx.status)}</IonText>
                        </IonCol>
                      </IonRow>
                      <IonRow
                        className="mt-1"
                        onClick={() => {
                          clipboardCopy(`${explorerLiquidUI}/tx/${tx.txId}`, () => {
                            dispatch(addSuccessToast('Transaction Id copied'));
                          });
                        }}
                      >
                        <IonCol className="pl-1" size="10.8" offset="1.2">
                          TxID: {tx.txId}
                        </IonCol>
                      </IonRow>
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

const mapStateToProps = (state: RootState) => {
  return {
    assets: state.assets,
    explorerLiquidUI: state.settings.explorerLiquidUI,
    network: state.settings.network,
    swaps: tradeTransactionsSelector(state).sort(compareTxDisplayInterfaceByDate),
  };
};

export default withRouter(connect(mapStateToProps)(TradeHistory));
