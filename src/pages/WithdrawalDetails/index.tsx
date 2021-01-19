import {
  IonPage,
  IonTitle,
  IonContent,
  IonItem,
  IonButton,
  IonToolbar,
  IonHeader,
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { withRouter, RouteComponentProps, useParams } from 'react-router';
import { CurrencyIcon, IconBack } from '../../components/icons';
import './style.scss';
import { useSelector } from 'react-redux';
import { formatPriceString, getCoinsEquivalent } from '../../utils/helpers';
import { TxStatusEnum } from '../../utils/types';

const statusText = {
  confirmed: 'completed',
  pending: 'pending',
};

const WithdrawalDetails: React.FC<RouteComponentProps> = ({ history }) => {
  const { details, coinsRates, assets, currency } = useSelector(
    (state: any) => ({
      details: state.transactions.withdrawalDetails,
      coinsRates: state.wallet.coinsRates,
      assets: state.wallet.assets,
      currency: state.settings.currency,
    })
  );
  const [assetData, setAssetData] = useState<any>();
  const { asset_id } = useParams();

  useEffect(() => {
    if (!details) {
      history.push(`/withdraw/${asset_id}`);
    }
  }, []);

  useEffect(() => {
    const fillAssetData = () => {
      const asset = assets.find((item: any) => item.asset_id === asset_id);
      const priceEquivalent = getCoinsEquivalent(
        asset,
        coinsRates,
        asset.amountDisplay,
        currency
      );
      const res = {
        asset_id,
        ticker: asset.ticker,
        amountDisplay: asset.amountDisplay,
        amountDisplayFormatted: asset.amountDisplayFormatted,
        name: asset.name,
        priceEquivalent: priceEquivalent
          ? formatPriceString(priceEquivalent)
          : priceEquivalent,
      };
      setAssetData(res);
    };

    if (assets?.length && !assetData) {
      fillAssetData();
    }
  }, [assets]);

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
          {assetData && (
            <CurrencyIcon currency={assetData?.ticker.toUpperCase()} />
          )}
          <p className="info-amount">
            {assetData?.amountDisplayFormatted}{' '}
            {assetData && <span>{assetData?.ticker.toUpperCase()}</span>}
          </p>
        </div>
        <IonItem>
          <div className="item-col">
            <div className="item-main-info">
              <div className="item-start main-row">Amount</div>
              <div className="item-end main-row">
                {details?.sign}
                {details?.amountDisplayFormatted}{' '}
                {assetData && assetData?.ticker.toUpperCase()}
              </div>
            </div>
            <div className="item-main-info">
              <div className="item-start main-row">Status</div>
              <div className="item-end main-row completed">
                {renderStatusText(details?.status)}
              </div>
            </div>
            <div className="item-main-info divider">
              <div className="item-start main-row">Date</div>
              <div className="item-end sub-row">{details?.time}</div>
            </div>
            <div className="item-main-info">
              <div className="item-start main-row">Fee</div>
              <div className="item-end sub-row">{details?.fee}</div>
            </div>
            <div className="item-main-info">
              <div className="item-start main-row">Address</div>
              <div className="item-end sub-row address-row">
                {details?.recipientAddress}
              </div>
            </div>
          </div>
        </IonItem>
        <div className="buttons">
          <IonButton
            routerLink={`/operations/${asset_id}`}
            className="main-button secondary"
          >
            Back to {assetData && assetData?.ticker.toUpperCase()} Wallet
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(WithdrawalDetails);
