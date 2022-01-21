import './style.scss';
import { IonPage, IonContent, IonSkeletonText, IonGrid, IonRow, IonCol } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import type { RouteComponentProps } from 'react-router';
import { withRouter, useParams } from 'react-router';

import Header from '../../components/Header';
import Refresher from '../../components/Refresher';
import { CurrencyIcon } from '../../components/icons';
import { addSuccessToast } from '../../redux/actions/toastActions';
import { useTypedDispatch, useTypedSelector } from '../../redux/hooks';
import { transactionSelector } from '../../redux/reducers/transactionsReducer';
import { clipboardCopy } from '../../utils/clipboard';
import type { LbtcDenomination } from '../../utils/constants';
import { isLbtc } from '../../utils/helpers';
import { TxStatusEnum } from '../../utils/types';

const statusText = {
  confirmed: 'completed',
  pending: 'pending',
};

interface transactionDetailsLocationState {
  address: string;
  amount: number;
  asset: string;
  lbtcUnit: LbtcDenomination;
}

const TransactionDetails: React.FC<RouteComponentProps<any, any, transactionDetailsLocationState>> = ({ location }) => {
  const dispatch = useTypedDispatch();
  const { txid } = useParams<{ txid: string }>();
  const { explorerLiquidUI, network, lbtcUnit } = useTypedSelector(({ settings }) => ({
    explorerLiquidUI: settings.explorerLiquidUI,
    network: settings.network,
    lbtcUnit: settings.denominationLBTC,
  }));
  const transaction = useTypedSelector(transactionSelector(txid));
  const assets = useTypedSelector(({ assets }) => assets);
  const [locationState, setLocationState] = useState<transactionDetailsLocationState>();

  useEffect(() => {
    if (location.state) {
      setLocationState(location.state);
    }
  }, [location]);

  const renderStatusText: any = (status: string) => {
    switch (status) {
      case TxStatusEnum.Confirmed:
        return <span className="status-text confirmed">{statusText[status]}</span>;
      case TxStatusEnum.Pending:
        return <span className="status-text pending">{statusText[status]}</span>;
      default:
        return <span className="status-text pending" />;
    }
  };

  const Skeleton = () => <IonSkeletonText className="custom-skeleton" animated />;

  return (
    <IonPage id="transaction-details">
      <IonContent>
        <Refresher />
        <IonGrid>
          <Header
            hasBackButton={true}
            title={`${locationState?.amount && locationState.amount > 0 ? 'RECEIVE' : 'SEND'} DETAILS`}
          />
          <IonRow>
            <IonCol className="header-info ion-text-center">
              <CurrencyIcon currency={assets[locationState?.asset || '']?.ticker} />
              <p className="info-amount">
                {assets[locationState?.asset || '']?.name ?? assets[locationState?.asset || '']?.ticker}
              </p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <div className="card-details">
                <div className="item-main-info">
                  <div className="item-start main-row">Amount</div>
                  <div className="item-end main-row">
                    {`${locationState?.amount ? locationState.amount : '?'} ${
                      isLbtc(locationState?.asset || '', network)
                        ? lbtcUnit
                        : assets[locationState?.asset || '']?.ticker
                    }`}
                  </div>
                </div>
                <div className="item-main-info">
                  <div className="item-start main-row">Status</div>
                  <div className="item-end main-row completed">
                    {transaction ? renderStatusText(transaction?.status) : <Skeleton />}
                  </div>
                </div>

                <div className="item-main-info divider">
                  <div className="item-start main-row">Date</div>
                  <div className="item-end sub-row">
                    {transaction ? transaction.blockTime?.format('DD MMM YYYY HH:mm:ss') : <Skeleton />}
                  </div>
                </div>

                <div className="item-main-info">
                  <div className="item-start main-row">Fee</div>
                  <div className="item-end sub-row">{transaction ? transaction.fee : <Skeleton />}</div>
                </div>

                <div
                  className="item-main-info"
                  onClick={() => {
                    clipboardCopy(`${explorerLiquidUI}/address/${locationState?.address}`, () => {
                      dispatch(addSuccessToast('Address copied!'));
                    });
                  }}
                >
                  <div className="item-start main-row">Address</div>
                  <div className="item-end sub-row">{locationState?.address || ''}</div>
                </div>

                <div
                  className="item-main-info"
                  onClick={() => {
                    clipboardCopy(`${explorerLiquidUI}/tx/${txid}`, () => {
                      dispatch(addSuccessToast('TxID copied!'));
                    });
                  }}
                >
                  <div className="item-start main-row">TxID</div>
                  <div className="item-end sub-row">{txid}</div>
                </div>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(TransactionDetails);
