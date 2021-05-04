import {
  IonPage,
  IonTitle,
  IonContent,
  IonItem,
  IonButton,
  IonToolbar,
  IonHeader,
  IonSkeletonText,
  IonButtons,
  IonBackButton,
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { withRouter, RouteComponentProps, useParams } from 'react-router';
import { CurrencyIcon } from '../../components/icons';
import { useDispatch, useSelector } from 'react-redux';
import { TxStatusEnum } from '../../utils/types';
import { transactionSelector } from '../../redux/reducers/transactionsReducer';
import { Clipboard } from '@ionic-native/clipboard';
import { addSuccessToast } from '../../redux/actions/toastActions';
import { tickerFromAssetHash } from '../../utils/helpers';
import Refresher from '../../components/Refresher';
import './style.scss';
import { chevronBackOutline } from 'ionicons/icons';

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
> = ({ history, location }) => {
  const lbtcUnit = useSelector((state: any) => state.settings.denominationLBTC);
  const dispatch = useDispatch();
  const { txid } = useParams<{ txid: string }>();
  const transaction = useSelector(transactionSelector(txid));

  const [
    locationState,
    setLocationState,
  ] = useState<WithdrawalDetailsLocationState>();

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
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="with-back-button">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" text="" icon={chevronBackOutline} />
          </IonButtons>
          <IonTitle>WITHDRAWAL DETAILS</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="withdrawal-details">
        <Refresher />
        <div className="header-info">
          {
            <CurrencyIcon
              currency={tickerFromAssetHash(locationState?.asset)}
            />
          }
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
