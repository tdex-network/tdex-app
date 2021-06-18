import { Clipboard } from '@ionic-native/clipboard';
import {
  IonPage,
  IonContent,
  IonButton,
  IonSkeletonText,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RouteComponentProps } from 'react-router';
import { withRouter, useParams } from 'react-router';

import Header from '../../components/Header';
import Refresher from '../../components/Refresher';
import { CurrencyIcon } from '../../components/icons';
import { addSuccessToast } from '../../redux/actions/toastActions';
import { transactionSelector } from '../../redux/reducers/transactionsReducer';
import { nameFromAssetHash, tickerFromAssetHash } from '../../utils/helpers';
import { TxStatusEnum } from '../../utils/types';
import './style.scss';

const statusText = {
  confirmed: 'completed',
  pending: 'pending',
};

interface WithdrawalDetailsLocationState {
  address: string;
  asset: string;
  ticker: string;
  amount: number;
}

const WithdrawalDetails: React.FC<
  RouteComponentProps<any, any, WithdrawalDetailsLocationState>
> = ({ location }) => {
  const lbtcUnit = useSelector((state: any) => state.settings.denominationLBTC);
  const dispatch = useDispatch();
  const { txid } = useParams<{ txid: string }>();
  const transaction = useSelector(transactionSelector(txid));

  const [locationState, setLocationState] =
    useState<WithdrawalDetailsLocationState>();

  useEffect(() => {
    if (location.state) {
      setLocationState(location.state);
    }
  }, [location]);

  const renderStatusText: any = (status: string) => {
    switch (status) {
      case TxStatusEnum.Confirmed:
        return (
          <span className="status-text confirmed">{statusText[status]}</span>
        );
      case TxStatusEnum.Pending:
        return (
          <span className="status-text pending">{statusText[status]}</span>
        );
      default:
        return <span className="status-text pending" />;
    }
  };

  const ticker = () => {
    const t = tickerFromAssetHash(locationState?.asset);
    return t === 'L-BTC' ? lbtcUnit : t;
  };

  const Skeleton = () => (
    <IonSkeletonText className="custom-skeleton" animated />
  );

  return (
    <IonPage id="withdrawal-details">
      <IonContent>
        <Refresher />
        <IonGrid>
          <Header hasBackButton={true} title="WITHDRAWAL DETAILS" />
          <IonRow>
            <IonCol className="header-info ion-text-center">
              <CurrencyIcon
                currency={tickerFromAssetHash(locationState?.asset)}
              />
              <p className="info-amount">
                {nameFromAssetHash(locationState?.asset) ?? ticker()}
              </p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <div className="card-details">
                <div className="item-main-info">
                  <div className="item-start main-row">Amount</div>
                  <div className="item-end main-row">
                    {`-${
                      locationState?.amount ? locationState.amount : '?'
                    } ${ticker()}`}
                  </div>
                </div>
                <div className="item-main-info">
                  <div className="item-start main-row">Status</div>
                  <div className="item-end main-row completed">
                    {transaction ? (
                      renderStatusText(transaction?.status)
                    ) : (
                      <Skeleton />
                    )}
                  </div>
                </div>

                <div className="item-main-info divider">
                  <div className="item-start main-row">Date</div>
                  <div className="item-end sub-row">
                    {transaction ? (
                      transaction.blockTime?.format('DD MMM YYYY hh:mm:ss')
                    ) : (
                      <Skeleton />
                    )}
                  </div>
                </div>

                <div className="item-main-info">
                  <div className="item-start main-row">Fee</div>
                  <div className="item-end sub-row">
                    {transaction ? transaction.fee : <Skeleton />}
                  </div>
                </div>

                <div
                  className="item-main-info"
                  onClick={() => {
                    if (!locationState) return;
                    Clipboard.copy(locationState.address);
                    dispatch(addSuccessToast('Address copied!'));
                  }}
                >
                  <div className="item-start main-row">Address</div>
                  <div className="item-end sub-row">
                    {locationState?.address || ''}
                  </div>
                </div>

                <div
                  className="item-main-info"
                  onClick={() => {
                    Clipboard.copy(txid);
                    dispatch(addSuccessToast('TxID copied!'));
                  }}
                >
                  <div className="item-start main-row">TxID</div>
                  <div className="item-end sub-row">{txid}</div>
                </div>
              </div>
            </IonCol>
          </IonRow>

          <IonRow className="ion-margin-vertical-x2">
            <IonCol size="9" offset="1.5">
              <IonButton
                routerLink={`/operations/${locationState?.asset}`}
                className="main-button"
              >
                TRANSACTION HISTORY
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(WithdrawalDetails);
