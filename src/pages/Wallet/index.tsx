import './style.scss';
import {
  IonContent,
  IonList,
  IonItem,
  IonPage,
  IonListHeader,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
} from '@ionic/react';
import { addCircleOutline } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import type { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router';
import type { NetworkString } from 'tdex-sdk';

import CircleTotalBalance from '../../components/CircleTotalBalance';
import Header from '../../components/Header';
import Refresher from '../../components/Refresher';
import { CurrencyIcon } from '../../components/icons';
import type { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import { aggregatedLBTCBalanceSelector, balancesSelector } from '../../redux/reducers/walletReducer';
import type { RootState } from '../../redux/types';
import { routerLinks } from '../../routes';
import type { LbtcDenomination } from '../../utils/constants';
import { LBTC_ASSET, LBTC_COINGECKOID } from '../../utils/constants';
import { capitalizeFirstLetter, fromSatoshi, fromSatoshiFixed, isLbtc, isLbtcTicker } from '../../utils/helpers';

interface WalletProps extends RouteComponentProps {
  backupDone: boolean;
  balances: BalanceInterface[];
  currency: string;
  isFetchingUtxos: boolean;
  isFetchingMarkets: boolean;
  isFetchingTransactions: boolean;
  lbtcUnit: LbtcDenomination;
  network: NetworkString;
  prices: Record<string, number>;
  totalLBTC: BalanceInterface;
}

const Wallet: React.FC<WalletProps> = ({
  backupDone,
  balances,
  currency,
  isFetchingUtxos,
  isFetchingMarkets,
  isFetchingTransactions,
  history,
  lbtcUnit,
  network,
  prices,
  totalLBTC,
}) => {
  const [assets, setAssets] = useState<BalanceInterface[]>([]);
  const [fiats, setFiats] = useState<number[]>([]);
  const UNKNOWN = -1;

  const getFiatValue = (balance: BalanceInterface) => {
    const balanceIndex = balances?.findIndex((b) => b?.ticker === balance?.ticker);
    if (balanceIndex < 0) return UNKNOWN;
    return fiats[balanceIndex];
  };

  useEffect(() => {
    const fiatsValues = balances.map(({ amount, coinGeckoID }) => {
      if (!coinGeckoID) return UNKNOWN;
      const p = prices[coinGeckoID];
      if (!p) return UNKNOWN;
      return fromSatoshi(amount.toString()).mul(p).toNumber();
    });
    setFiats(fiatsValues);
  }, [prices, balances, UNKNOWN]);

  useEffect(() => {
    const main = [];
    if (!balances.length) {
      // Display L-BTC with empty balance
      main.push({ ...LBTC_ASSET[network], amount: 0 });
    } else {
      main.push(...balances);
    }
    // Delete L-BTC from array
    const lbtcIndex = main.findIndex((a) => isLbtc(a.assetHash, network));
    const [lbtc] = main.splice(lbtcIndex, 1);
    // Sort by balance
    main.sort((a, b) => {
      if (a.amount < b.amount) return 1;
      if (a.amount > b.amount) return -1;
      return 0;
    });
    // Add lbtc back to the beginning
    main.splice(0, 0, lbtc);
    setAssets(main);
  }, [balances, network]);

  return (
    <IonPage>
      <IonContent className="wallet-content">
        <Refresher />
        <IonGrid>
          <Header
            title="Wallet"
            hasCloseButton={true}
            hasBackButton={false}
            isTitleLarge={true}
            customRightButton={
              isFetchingUtxos || isFetchingMarkets || isFetchingTransactions ? <IonSpinner name="lines-small" /> : <></>
            }
          />
          <IonRow className="ion-margin-vertical ion-justify-content-center">
            <CircleTotalBalance
              totalBalance={
                totalLBTC.amount ? fromSatoshiFixed(totalLBTC.amount.toString(), 8, undefined, lbtcUnit) : '0.00'
              }
              lbtcUnit={lbtcUnit}
              fiatBalance={
                totalLBTC && prices[LBTC_COINGECKOID]
                  ? `${fromSatoshi(totalLBTC.amount.toString())
                      .mul(prices[LBTC_COINGECKOID])
                      .toFixed(2)} ${currency.toUpperCase()}`
                  : `0.00 ${currency.toUpperCase()}`
              }
            />
          </IonRow>

          <IonList scroll-y={true}>
            <IonListHeader className="ion-no-margin">
              <IonRow className="ion-align-items-center">
                <IonCol size="10">Asset list</IonCol>
                <IonCol size="2">
                  <IonButton
                    className="ion-no-padding"
                    onClick={() => {
                      if (backupDone) {
                        history.push({ pathname: routerLinks.deposit });
                        return;
                      }
                      history.push({ pathname: routerLinks.backup });
                    }}
                  >
                    <IonIcon icon={addCircleOutline} slot="icon-only" color="success" />
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonListHeader>

            {assets
              .filter((b) => b !== undefined)
              .map((balance: BalanceInterface) => {
                const fiatValue = getFiatValue(balance);
                return (
                  <IonItem
                    aria-label={balance.ticker}
                    data-cy={`item-asset-${balance.ticker}`}
                    key={balance.assetHash}
                    onClick={() => {
                      history.push(`/operations/${balance.assetHash}`);
                    }}
                  >
                    <div className="asset-container">
                      <div className="asset-details">
                        <CurrencyIcon currency={balance.ticker} />
                        <div>{balance.coinGeckoID ? capitalizeFirstLetter(balance.coinGeckoID) : balance.ticker}</div>
                      </div>
                      <div className="amount-container ion-text-right">
                        <div className="amount-token">
                          {fromSatoshiFixed(
                            balance.amount.toString(),
                            balance.precision,
                            balance.precision,
                            isLbtcTicker(balance.ticker) ? lbtcUnit : undefined
                          )}{' '}
                          <span className="ticker">{isLbtcTicker(balance.ticker) ? lbtcUnit : balance.ticker}</span>
                        </div>
                        <div className="amount-fiat">
                          {fiatValue < 0
                            ? fiatValue === UNKNOWN
                              ? ''
                              : 'loading'
                            : `${fiatValue?.toFixed(2)} ${currency.toUpperCase()}`}
                        </div>
                      </div>
                    </div>
                  </IonItem>
                );
              })}
          </IonList>

          {!totalLBTC.amount && (
            <div className="ion-text-center ion-padding-vertical">
              <IonRow>
                <IonCol size="9" offset="1.5" sizeMd="6" offsetMd="3">
                  <IonButton
                    className="main-button"
                    data-cy="main-button"
                    onClick={() => {
                      if (backupDone) {
                        history.push({ pathname: routerLinks.deposit });
                        return;
                      }
                      history.push({ pathname: routerLinks.backup });
                    }}
                  >
                    RECEIVE ASSETS
                  </IonButton>
                </IonCol>
              </IonRow>
            </div>
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    backupDone: state.app.backupDone,
    balances: balancesSelector(state),
    currency: state.settings.currency.value,
    isFetchingUtxos: state.app.isFetchingUtxos,
    isFetchingMarkets: state.app.isFetchingMarkets,
    isFetchingTransactions: state.app.isFetchingTransactions,
    lbtcUnit: state.settings.denominationLBTC,
    network: state.settings.network,
    prices: state.rates.prices,
    totalLBTC: aggregatedLBTCBalanceSelector(state),
  };
};

export default withRouter(connect(mapStateToProps)(Wallet));
