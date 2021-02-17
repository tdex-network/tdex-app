import {
  IonContent,
  IonList,
  IonHeader,
  IonItem,
  IonPage,
  IonTitle,
  IonToolbar,
  IonListHeader,
  IonButton,
  IonRefresher,
  IonRefresherContent,
  IonLoading,
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { CurrencyIcon } from '../../components/icons';
import { RefresherEventDetail } from '@ionic/core';
//styles
import './style.scss';
import { chevronDownCircleOutline } from 'ionicons/icons';
import { updateUtxos } from '../../redux/actions/walletActions';
import { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import { fromSatoshi, toSatoshi } from '../../utils/helpers';
import { MAIN_ASSETS } from '../../utils/constants';
import { getPrice } from '../../redux/services/walletService';
import CircleDiagram from '../../components/CircleDiagram';

interface WalletProps extends RouteComponentProps {
  balances: BalanceInterface[];
}

const Wallet: React.FC<WalletProps> = ({ balances, history }) => {
  const { currency, loading } = useSelector((state: any) => ({
    currency: state.settings.currency,
    loading: state.wallet.loading,
  }));

  const [LBTCBalance, setLBTCBalance] = useState<BalanceInterface | undefined>(
    undefined
  );
  const [LBTCBalanceIndex, setLBTCBalanceIndex] = useState(-1);
  const [mainAssets, setMainAssets] = useState<BalanceInterface[]>([]);
  const [secondaryAssets, setSecondaryAssets] = useState<BalanceInterface[]>(
    []
  );

  const UNKNOWN = -1;
  const LOADING = -2;
  const [fiats, setFiats] = useState<number[]>([]);

  const getFiatValue = (balance: BalanceInterface) => {
    const balanceIndex = balances.findIndex((b) => b.ticker === balance.ticker);
    if (balanceIndex < 0) return UNKNOWN;
    return fiats[balanceIndex];
  };

  useEffect(() => {
    const index = balances.findIndex((b) => b.coinGeckoID === 'bitcoin');
    if (index < 0) {
      setLBTCBalance(undefined);
      setLBTCBalanceIndex(-1);
    }

    setLBTCBalanceIndex(index);
    setLBTCBalance(balances[index]);

    const main = [];
    const secondary = [];
    for (const balance of balances) {
      if (MAIN_ASSETS.includes(balance.ticker)) {
        main.push(balance);
        continue;
      }

      secondary.push(balance);
    }

    setMainAssets(main);
    setSecondaryAssets(secondary);
  }, [balances]);

  useEffect(() => {
    (async function () {
      setFiats(balances.map(() => LOADING));
      const fiatsValues = [];
      for (const balance of balances) {
        if (balance.coinGeckoID) {
          const price = await getPrice(balance.coinGeckoID, currency);
          if (price === UNKNOWN) {
            fiatsValues.push(UNKNOWN);
          } else {
            fiatsValues.push(price * toSatoshi(balance.amount));
          }
          continue;
        }
        fiatsValues.push(UNKNOWN);
      }
    })();
  }, [balances, currency]);

  const dispatch = useDispatch();

  const onRefresh = (event: CustomEvent<RefresherEventDetail>) => {
    dispatch(updateUtxos());
    setTimeout(() => {
      event.detail.complete();
    }, 2000);
  };

  return (
    <IonPage>
      <div className="gradient-background"></div>
      {/* <IonLoading
        cssClass="my-custom-class"
        isOpen={loading}
        message={'Please wait...'}
      /> */}
      <IonContent className="wallet-content">
        <IonRefresher slot="fixed" onIonRefresh={onRefresh}>
          <IonRefresherContent
            pullingIcon={chevronDownCircleOutline}
            refreshingSpinner="circles"
          />
        </IonRefresher>
        <div className="diagram">
          <CircleDiagram data={balances} />
        </div>
        <IonHeader className="header wallet">
          <IonToolbar>
            <IonTitle>Wallet</IonTitle>
          </IonToolbar>
          <div className="total-info">
            <div className="header-info wallet">
              <p className="info-heading">Total balance</p>
              <p className="info-amount">
                {LBTCBalance && fromSatoshi(LBTCBalance.amount)}
                <span>LBTC</span>
              </p>
              <p className="info-amount-converted">
                {LBTCBalance && fiats[LBTCBalanceIndex]
                  ? `${fiats[LBTCBalanceIndex]} ${currency.toUpperCase()}`
                  : 'loading...'}{' '}
              </p>
            </div>
          </div>
        </IonHeader>
        <IonList>
          <IonListHeader>
            Asset list
            <IonButton
              className="coin-action-button ml-auto small-button"
              routerLink="/receive"
            >
              Deposit
            </IonButton>
          </IonListHeader>

          {mainAssets.map((balance: BalanceInterface) => {
            const fiatValue = getFiatValue(balance);
            return (
              <IonItem
                key={balance.asset}
                onClick={() => {
                  history.push(`/operations/${balance.asset}`);
                }}
              >
                <div className="item-main-info">
                  <div className="item-start">
                    <CurrencyIcon currency={balance.ticker} />
                    <div className="item-name">
                      <div className="main-row">
                        {balance.coinGeckoID || 'unknown'}
                      </div>
                    </div>
                  </div>
                  <div className="item-end">
                    <div className="first-col">
                      <div className="main-row">
                        {fromSatoshi(balance.amount)}
                      </div>
                      <div className="sub-row">
                        {fiatValue < 0
                          ? fiatValue === UNKNOWN
                            ? 'unknown'
                            : 'loading'
                          : fiatValue}
                      </div>
                    </div>
                    <div className="second-col">
                      <div className="main-row accent">{balance.ticker}</div>
                      {fiatValue > 0 && (
                        <div className="sub-row">{currency.toUpperCase()}</div>
                      )}
                    </div>
                  </div>
                </div>
              </IonItem>
            );
          })}
          {secondaryAssets.length ? (
            <IonListHeader>Other list</IonListHeader>
          ) : (
            ''
          )}
          {secondaryAssets.map((balance: BalanceInterface) => {
            const fiatValue = getFiatValue(balance);
            return (
              <IonItem
                key={balance.asset}
                onClick={() => {
                  history.push(`/operations/${balance.asset}`);
                }}
              >
                <div className="item-main-info">
                  <div className="item-start">
                    <CurrencyIcon currency={balance.ticker} />
                    <div className="item-name">
                      <div className="main-row">
                        {balance.coinGeckoID || 'unknown'}
                      </div>
                    </div>
                  </div>
                  <div className="item-end">
                    <div className="first-col">
                      <div className="main-row">
                        {fromSatoshi(balance.amount)}
                      </div>
                      <div className="sub-row">
                        {fiatValue < 0
                          ? fiatValue === UNKNOWN
                            ? 'unknown'
                            : 'loading'
                          : fiatValue}
                      </div>
                    </div>
                    <div className="second-col">
                      <div className="main-row accent">{balance.ticker}</div>
                      {fiatValue > 0 && (
                        <div className="sub-row">{currency.toUpperCase()}</div>
                      )}
                    </div>
                  </div>
                </div>
              </IonItem>
            );
          })}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Wallet);
