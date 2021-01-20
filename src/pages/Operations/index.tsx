import {
  IonPage,
  IonButtons,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonButton,
  IonToolbar,
  IonHeader,
  IonListHeader,
  IonLabel,
  IonText,
  IonLoading,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { withRouter, RouteComponentProps, useParams } from 'react-router';
import classNames from 'classnames';
import { CurrencyIcon, IconBack, TxIcon } from '../../components/icons';
import './style.scss';
import { useDispatch, useSelector } from 'react-redux';
import { getTransactions } from '../../redux/actions/transactionsActions';
import { TxDisplayInterface, TxStatusEnum } from '../../utils/types';
import { formatPriceString, getCoinsEquivalent } from '../../utils/helpers';
import { chevronDownCircleOutline } from 'ionicons/icons';
import { RefresherEventDetail } from '@ionic/core';

const txTypes = ['deposit', 'withdrawal', 'swap', 'trade'];
const statusText = {
  confirmed: 'completed',
  pending: 'pending',
};

const Operations: React.FC<RouteComponentProps> = ({ history }) => {
  const {
    addresses,
    assets,
    transactions,
    currency,
    coinsRates,
    loading,
  } = useSelector((state: any) => ({
    assets: state.wallet.assets,
    transactions: state.transactions.data,
    loading: state.transactions.loading,
    addresses: state.wallet.addresses,
    coinsRates: state.wallet.coinsRates,
    currency: state.settings.currency,
  }));
  const dispatch = useDispatch();
  const [assetTransactions, setAssetTransactions] = useState<
    Array<TxDisplayInterface> | undefined
  >();
  const [assetData, setAssetData] = useState<any>();
  const { asset_id } = useParams();

  useEffect(() => {
    return () => {
      setAssetTransactions(undefined);
      setAssetData(undefined);
    };
  }, []);

  useEffect(() => {
    if (assetData && transactions) {
      const txs = transactions[asset_id].map((tx: TxDisplayInterface) => {
        const priceEquivalent = getCoinsEquivalent(
          assetData,
          coinsRates,
          tx.amountDisplay,
          currency
        );
        return {
          ...tx,
          priceEquivalent: priceEquivalent
            ? formatPriceString(priceEquivalent)
            : priceEquivalent,
          ticker: assetData.ticker,
        };
      });
      setAssetTransactions(txs);
    }
  }, [transactions, assetData]);

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

    if (assets && !transactions) {
      dispatch(getTransactions(addresses));
    }
    if (assets?.length) {
      fillAssetData();
    }
  }, [assets, asset_id]);

  const toggleTxOpen = (idx: number) => {
    if (assetTransactions) {
      const txs = [...assetTransactions];
      txs[idx].open = !txs[idx].open;
      setAssetTransactions(txs);
    }
  };

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

  const onRefresh = (event: CustomEvent<RefresherEventDetail>) => {
    dispatch(getTransactions(addresses));
    setTimeout(() => {
      event.detail.complete();
    }, 2000);
  };

  return (
    <IonPage>
      <div className="gradient-background"></div>
      <IonLoading
        cssClass="my-custom-class"
        isOpen={loading}
        message={'Please wait...'}
      />
      <IonContent className="operations">
        <IonRefresher slot="fixed" onIonRefresh={onRefresh}>
          <IonRefresherContent
            pullingIcon={chevronDownCircleOutline}
            refreshingSpinner="circles"
          />
        </IonRefresher>
        <IonHeader className="header operations">
          <IonToolbar className="with-back-button">
            <IonButton
              style={{ zIndex: 10 }}
              onClick={() => {
                history.push('/wallet');
              }}
            >
              <IconBack />
            </IonButton>
            <IonTitle>{assetData?.name}</IonTitle>
          </IonToolbar>
          <div className="header-info">
            <div className="img-wrapper">
              {assetData && <CurrencyIcon currency={assetData?.ticker} />}
            </div>
            <p className="info-amount">
              {assetData?.amountDisplayFormatted}{' '}
              <span>{assetData?.ticker}</span>
            </p>
            {assetData?.priceEquivalent && (
              <p className="info-amount-converted">
                {assetData.priceEquivalent} {currency.toUpperCase()}
              </p>
            )}
          </div>
          <IonButtons className="operations-buttons">
            <IonButton className="coin-action-button" routerLink="/receive">
              Deposit
            </IonButton>
            <IonButton
              className="coin-action-button"
              onClick={() => {
                history.push(`/withdraw/${asset_id}`);
              }}
            >
              Withdraw
            </IonButton>
            <IonButton className="coin-action-button" routerLink="/exchange">
              Swap
            </IonButton>
          </IonButtons>
        </IonHeader>
        <IonList>
          <IonListHeader>Transactions</IonListHeader>
          {assetTransactions?.map((tx: any, index: number) => (
            <IonItem
              onClick={() => toggleTxOpen(index)}
              className={classNames('list-item transaction-item', {
                open: tx.open,
              })}
            >
              <div className="info-wrapper">
                <div className="item-main-info">
                  <div className="item-start">
                    <div className="icon-wrapper">
                      <TxIcon type={tx.type} />
                    </div>
                    <div className="item-name">
                      <div className="main-row">
                        {tx.ticker} {txTypes[tx.type - 1]}
                      </div>
                      <div className="sub-row">
                        {tx.open ? tx.time : tx.date}
                      </div>
                    </div>
                  </div>
                  <div className="item-end">
                    <div className="amount">
                      <div className="main-row">
                        {tx.sign}
                        {tx.amountDisplayFormatted}
                      </div>
                      <div className="main-row accent">{tx.ticker}</div>
                    </div>
                    {tx.priceEquivalent && (
                      <div className="sub-row ta-end">
                        {tx.sign}
                        {tx.priceEquivalent} {currency.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="sub-info">
                  <div className="fee-row">
                    <IonLabel>
                      Fee <span className="amount">{tx.fee}</span>
                    </IonLabel>
                    <IonText>{renderStatusText(tx.status)}</IonText>
                  </div>
                  <div className="info-row">
                    <IonLabel>ADDR</IonLabel>
                    <IonText>{tx.address}</IonText>
                  </div>
                  <div className="info-row">
                    <IonLabel>TxID</IonLabel>
                    <IonText>{tx.txId}</IonText>
                  </div>
                </div>
              </div>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Operations);
