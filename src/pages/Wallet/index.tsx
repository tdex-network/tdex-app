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
} from '@ionic/react';
import { addCircleOutline } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router';

import CircleTotalBalance from '../../components/CircleTotalBalance';
import Header from '../../components/Header';
import Refresher from '../../components/Refresher';
import { CurrencyIcon } from '../../components/icons';
import type { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import { network } from '../../redux/config';
import type { AssetConfig } from '../../utils/constants';
import {
  getMainAsset,
  LBTC_COINGECKOID,
  MAIN_ASSETS,
} from '../../utils/constants';
import {
  capitalizeFirstLetter,
  fromSatoshi,
  fromSatoshiFixed,
} from '../../utils/helpers';
import type { ActionType } from '../../utils/types';
import './style.scss';

interface WalletProps extends RouteComponentProps {
  balances: BalanceInterface[];
  currency: string;
  prices: Record<string, number>;
  dispatch: (action: ActionType) => void;
  backupDone: boolean;
  totalLBTC: BalanceInterface;
}

const Wallet: React.FC<WalletProps> = ({
  backupDone,
  balances,
  prices,
  currency,
  history,
  totalLBTC,
}) => {
  const lbtcUnit = useSelector((state: any) => state.settings.denominationLBTC);
  const [mainAssets, setMainAssets] = useState<BalanceInterface[]>([]);
  const [fiats, setFiats] = useState<number[]>([]);
  const [secondaryAssets, setSecondaryAssets] = useState<BalanceInterface[]>(
    [],
  );
  const [depositAssets, setDepositAssets] = useState<AssetConfig[]>([]);

  const UNKNOWN = -1;

  const getFiatValue = (balance: BalanceInterface) => {
    const balanceIndex = balances?.findIndex(
      b => b?.ticker === balance?.ticker,
    );
    if (balanceIndex < 0) return UNKNOWN;
    return fiats[balanceIndex];
  };

  const getDepositAssets = () => {
    const assets: AssetConfig[] = [...MAIN_ASSETS];
    secondaryAssets.forEach(({ asset, ticker, coinGeckoID, precision }) => {
      assets.push({
        assetHash: asset,
        ticker,
        coinGeckoID,
        precision,
        color: '',
      });
    });
    return assets;
  };

  useEffect(() => {
    const fiatsValues = balances.map(({ amount, coinGeckoID }) => {
      if (!coinGeckoID) return UNKNOWN;
      const p = prices[coinGeckoID];
      if (!p) return UNKNOWN;
      return fromSatoshi(amount.toString()).mul(p).toNumber();
    });
    setFiats(fiatsValues);
  }, [prices, balances]);

  useEffect(() => {
    const main = [];
    const secondary = [];
    if (balances.length) {
      for (const balance of balances) {
        if (getMainAsset(balance.asset)) {
          main.push(balance);
          continue;
        }
        secondary.push(balance);
      }
    } else {
      // Display L-BTC with empty balance
      const [lbtc] = MAIN_ASSETS.filter(
        a => a.ticker === 'L-BTC' && a.chain === network.chain,
      ).map(a => {
        return {
          asset: a.assetHash,
          ticker: a.ticker,
          amount: 0,
          precision: 8,
        };
      });
      main.push(lbtc);
    }
    // Delete L-BTC from array
    const lbtcIndex = main.findIndex(a => a.ticker === 'L-BTC');
    const [lbtc] = main.splice(lbtcIndex, 1);
    // Sort by balance
    main.sort((a, b) => {
      if (a.amount < b.amount) return 1;
      if (a.amount > b.amount) return -1;
      return 0;
    });
    // Add lbtc back to the beginning
    main.splice(0, 0, lbtc);

    setMainAssets(main);
    setSecondaryAssets(secondary);
    setDepositAssets(getDepositAssets());
  }, [balances]);

  return (
    <IonPage>
      <IonContent className="wallet-content">
        <Refresher />
        <IonGrid>
          <Header title="Wallet" hasBackButton={false} isTitleLarge={true} />
          <IonRow className="ion-margin-vertical ion-justify-content-center">
            <CircleTotalBalance
              totalBalance={
                totalLBTC.amount
                  ? fromSatoshiFixed(
                      totalLBTC.amount.toString(),
                      8,
                      undefined,
                      lbtcUnit,
                    )
                  : '0.00'
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
                        history.push({
                          pathname: '/deposit',
                          state: { depositAssets },
                        });
                        return;
                      }
                      history.push({
                        pathname: '/backup',
                        state: { depositAssets },
                      });
                    }}
                  >
                    <IonIcon
                      icon={addCircleOutline}
                      slot="icon-only"
                      color="success"
                    />
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonListHeader>

            {mainAssets
              .concat(secondaryAssets)
              .filter(b => b !== undefined)
              .map((balance: BalanceInterface) => {
                const fiatValue = getFiatValue(balance);
                return (
                  <IonItem
                    aria-label={balance.ticker}
                    key={balance.asset}
                    onClick={() => {
                      history.push(`/operations/${balance.asset}`);
                    }}
                  >
                    <div className="item-main-info">
                      <div className="item-start">
                        <CurrencyIcon currency={balance.ticker} />
                        <div className="item-name">
                          <div
                            className="main-row"
                            aria-label={`${balance.ticker}-asset`}
                          >
                            {balance.coinGeckoID
                              ? capitalizeFirstLetter(balance.coinGeckoID)
                              : balance.ticker}
                          </div>
                        </div>
                      </div>
                      <div className="item-end">
                        <div className="first-col">
                          <div
                            className="main-row"
                            aria-label={`${balance.ticker}-amount`}
                          >
                            {fromSatoshiFixed(
                              balance.amount.toString(),
                              balance.precision,
                              balance.precision,
                              balance.ticker === 'L-BTC' ? lbtcUnit : undefined,
                            )}
                          </div>
                          <div className="sub-row">
                            {fiatValue < 0
                              ? fiatValue === UNKNOWN
                                ? 0
                                : 'loading'
                              : fiatValue?.toFixed(2)}
                          </div>
                        </div>
                        <div className="second-col">
                          <div className="main-row accent">
                            {balance.ticker === 'L-BTC'
                              ? lbtcUnit
                              : balance.ticker}
                          </div>
                          <div className="sub-row">
                            {currency.toUpperCase()}
                          </div>
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
                    onClick={() => {
                      if (backupDone) {
                        history.push({
                          pathname: '/deposit',
                          state: { depositAssets },
                        });
                        return;
                      }
                      history.push({
                        pathname: '/backup',
                        state: { depositAssets },
                      });
                    }}
                  >
                    DEPOSIT ASSETS
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

export default withRouter(Wallet);
