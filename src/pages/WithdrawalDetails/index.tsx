import {
  IonPage,
  IonTitle,
  IonContent,
  IonItem,
  IonButton,
  IonToolbar,
  IonHeader,
  useIonViewDidLeave,
  IonSkeletonText,
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { withRouter, RouteComponentProps, useParams } from 'react-router';
import { CurrencyIcon, IconBack } from '../../components/icons';
import { useDispatch, useSelector } from 'react-redux';
import { TxStatusEnum } from '../../utils/types';
import { transactionSelector } from '../../redux/reducers/transactionsReducer';
import { update } from '../../redux/actions/appActions';
import { Clipboard } from '@ionic-native/clipboard';
import { addSuccessToast } from '../../redux/actions/toastActions';
import { tickerFromAssetHash } from '../../utils/helpers';

import './style.scss';

const statusText = {
  confirmed: 'completed',
  pending: 'pending',
};

interface WithdrawalDetailsLocationState {
  address: string;
  asset: string;
  amount: number;
}

const WithdrawalDetails: React.FC<
  RouteComponentProps<any, any, WithdrawalDetailsLocationState>
> = ({ history, location }) => {
  const dispatch = useDispatch();
  const { txid } = useParams<{ txid: string }>();
  const transaction = useSelector(transactionSelector(txid));
  const [intervalUpdater, setIntervalUpdater] = useState<NodeJS.Timeout>();

  const [
    locationState,
    setLocationState,
  ] = useState<WithdrawalDetailsLocationState>();

  useEffect(() => {
    if (location.state) {
      setLocationState(location.state);
    }
  }, [location]);

  useEffect(() => {
    if (!transaction) {
      setIntervalUpdater(
        setInterval(() => {
          dispatch(update());
        }, 10000)
      );
    }
  }, []);

  useIonViewDidLeave(() => {
    if (intervalUpdater) {
      clearInterval(intervalUpdater);
    }
  });

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

  const ticker = () => tickerFromAssetHash(locationState?.asset);

  const Skeleton = () => (
    <IonSkeletonText className="custom-skeleton" animated />
  );

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
          <IonTitle>WITHDRAWAL DETAILS</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="withdrawal-details">
        <div className="header-info">
          {<CurrencyIcon currency={ticker()} />}
          <p className="info-amount">{`${ticker()} WITHDRAW`}</p>
        </div>
        <IonItem>
          <div className="item-col">
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
            <div
              className="item-main-info divider"
              onClick={() => {
                Clipboard.copy(txid);
                dispatch(addSuccessToast('TxID copied!'));
              }}
            >
              <div className="item-start main-row">TxID</div>
              <div className="item-end sub-row">{txid}</div>
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
            <div className="item-main-info">
              <div className="item-start main-row">Time</div>
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
          </div>
        </IonItem>
        <div className="buttons">
          <IonButton
            routerLink={`/operations/${locationState?.asset}`}
            className="main-button secondary"
          >
            History
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(WithdrawalDetails);
