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
import { useDispatch } from 'react-redux';
import type { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router';
import type { NetworkString } from 'tdex-sdk';

import Header from '../../components/Header';
import { CurrencyIcon } from '../../components/icons';
import { addSuccessToast } from '../../redux/actions/toastActions';
import { clipboardCopy } from '../../utils/clipboard';
import { LBTC_TICKER } from '../../utils/constants';
import { fromSatoshi, fromSatoshiFixed, precisionFromAssetHash, tickerFromAssetHash } from '../../utils/helpers';
import type { TxDisplayInterface } from '../../utils/types';
import { TxStatusEnum } from '../../utils/types';

import './style.scss';

interface TradeHistoryProps extends RouteComponentProps {
  swaps: TxDisplayInterface[];
  explorerLiquidUI: string;
  network: NetworkString;
}

const TradeHistory: React.FC<TradeHistoryProps> = ({ swaps, explorerLiquidUI, network }) => {
  const dispatch = useDispatch();

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
                //TODO: Get asset data from store
                const precisionAssetReceived = precisionFromAssetHash(network, transferReceived.asset);
                const tickerSent = tickerFromAssetHash(network, transferSent.asset);
                const tickerReceived = tickerFromAssetHash(network, transferReceived.asset);
                return (
                  <IonItem
                    className={classNames('list-item transaction-item', {
                      open: true,
                    })}
                    key={tx.txId}
                  >
                    <IonRow>
                      <IonCol className="icon" size="1.2">
                        <CurrencyIcon currency={tickerSent} />
                        <CurrencyIcon currency={tickerReceived} />
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

export default withRouter(TradeHistory);
