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
  useIonViewWillEnter,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { addCircleOutline } from 'ionicons/icons';
import { network } from '../../redux/config';
import { CurrencyIcon } from '../../components/icons';
import { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import {
  capitalizeFirstLetter,
  fromSatoshi,
  fromSatoshiFixed,
} from '../../utils/helpers';
import {
  getMainAsset,
  LBTC_COINGECKOID,
  MAIN_ASSETS,
} from '../../utils/constants';
import { AssetWithTicker } from '../../utils/tdex';
import { ActionType } from '../../utils/types';
import { update } from '../../redux/actions/appActions';
import CircleTotalBalance from '../../components/CircleTotalBalance';
import ExchangeSearch from '../../components/ExchangeSearch';
import Refresher from '../../components/Refresher';
import BackupModal from '../../redux/containers/backupModalContainer';
import { useSelector } from 'react-redux';
import { updateUtxos } from '../../redux/actions/walletActions';
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
  balances,
  prices,
  currency,
  history,
  dispatch,
  totalLBTC,
}) => {
  const lbtcUnit = useSelector((state: any) => state.settings.denominationLBTC);
  const [mainAssets, setMainAssets] = useState<BalanceInterface[]>([]);
  const [fiats, setFiats] = useState<number[]>([]);
  const backupDone = useSelector((state: any) => state.app.backupDone);
  const [backupModal, setBackupModal] = useState(false);
  const [secondaryAssets, setSecondaryAssets] = useState<BalanceInterface[]>(
    []
  );
  const [ExchangeSearchOpen, setExchangeSearchOpen] = useState(false);
  const [assetsWithTicker, setAssetsWithTicker] = useState<AssetWithTicker[]>(
    []
  );

  const UNKNOWN = -1;

  const getFiatValue = (balance: BalanceInterface) => {
    const balanceIndex = balances.findIndex((b) => b.ticker === balance.ticker);
    if (balanceIndex < 0) return UNKNOWN;
    return fiats[balanceIndex];
  };

  const getAssetsWithTicker = () => {
    const assetWithTicker: AssetWithTicker[] = [];
    MAIN_ASSETS.forEach(({ assetHash, ticker, coinGeckoID, chain }) => {
      if (ticker === 'L-BTC' && network.chain !== chain) return;
      assetWithTicker.push({ asset: assetHash, ticker, coinGeckoID });
    });
    secondaryAssets.forEach(({ asset, ticker, coinGeckoID }) => {
      assetWithTicker.push({ asset, ticker, coinGeckoID });
    });
    return assetWithTicker;
  };

  const handleAssetSelection = (asset: AssetWithTicker) => {
    history.push({
      pathname: '/receive',
      state: { depositAsset: asset },
    });
  };

  useIonViewWillEnter(() => dispatch(updateUtxos()));

  useEffect(() => {
    const fiatsValues = balances.map(({ amount, coinGeckoID }) => {
      if (!coinGeckoID) return UNKNOWN;
      const p = prices[coinGeckoID];
      if (!p) return UNKNOWN;
      return p * fromSatoshi(amount);
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
        (a) => a.ticker === 'L-BTC' && a.chain === network.chain
      ).map((a) => {
        return {
          asset: a.assetHash,
          ticker: a.ticker,
          amount: 0,
          precision: 8,
        };
      });
      main.push(lbtc);
    }
    setMainAssets(main);
    setSecondaryAssets(secondary);
    setAssetsWithTicker(getAssetsWithTicker());
  }, [balances]);

  useEffect(() => {
    dispatch(update());
  }, []);

  return (
    <IonPage>
      <div className="gradient-background" />
      <IonContent className="wallet-content">
        <IonGrid>
          <Refresher />
          <IonHeader className="ion-no-border">
            <IonToolbar>
              <IonTitle>Wallet</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonRow className="ion-margin-vertical ion-justify-content-center">
            <CircleTotalBalance
              totalBalance={
                totalLBTC.amount
                  ? fromSatoshiFixed(totalLBTC.amount, 8, undefined, lbtcUnit)
                  : '0.00'
              }
              lbtcUnit={lbtcUnit}
              fiatBalance={
                totalLBTC && prices[LBTC_COINGECKOID]
                  ? `${(
                      fromSatoshi(totalLBTC.amount) * prices[LBTC_COINGECKOID]
                    ).toFixed(2)} ${currency.toUpperCase()}`
                  : undefined
              }
            />
          </IonRow>

          <IonList scroll-y={true}>
            <IonListHeader className="ion-no-margin">
              <IonRow className="ion-align-items-center">
                <IonCol size="6">Asset list</IonCol>
                <IonCol size="6" className="ion-text-right">
                  <IonButton
                    className="ion-no-padding"
                    onClick={() => {
                      if (backupDone) {
                        setExchangeSearchOpen(true);
                        return;
                      }
                      setBackupModal(true);
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
                              balance.amount,
                              balance.precision,
                              balance.precision,
                              balance.ticker === 'L-BTC' ? lbtcUnit : undefined
                            )}
                          </div>
                          <div className="sub-row">
                            {fiatValue < 0
                              ? fiatValue === UNKNOWN
                                ? ''
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
                          {fiatValue >= 0 && (
                            <div className="sub-row">
                              {currency.toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </IonItem>
                );
              })}
          </IonList>

          {!totalLBTC.amount && (
            <div className="ion-text-center ion-padding-vertical">
              <IonButton
                className="main-button"
                onClick={() => {
                  if (backupDone) {
                    setExchangeSearchOpen(true);
                    return;
                  }
                  setBackupModal(true);
                }}
              >
                DEPOSIT ASSETS
              </IonButton>
            </div>
          )}

          <ExchangeSearch
            assets={assetsWithTicker}
            currency={currency}
            isOpen={ExchangeSearchOpen}
            close={() => setExchangeSearchOpen(false)}
            prices={prices}
            setAsset={handleAssetSelection}
            isDepositSearch={true}
          />

          {!backupDone && (
            <BackupModal
              title="Backup your seed before deposit"
              description="Take time to keep your secret words in a safe place before deposit funds."
              removeSkipBtn={true}
              isOpen={backupModal}
              onClose={() => setBackupModal(false)}
            />
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Wallet);
