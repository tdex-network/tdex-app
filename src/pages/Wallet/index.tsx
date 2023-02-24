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
import type { RouteComponentProps } from 'react-router';

import CircleTotalBalance from '../../components/CircleTotalBalance';
import CurrencyIcon from '../../components/CurrencyIcon';
import Header from '../../components/Header';
import Refresher from '../../components/Refresher';
import { routerLinks } from '../../routes';
import { useAppStore } from '../../store/appStore';
import { useAssetStore } from '../../store/assetStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useTdexStore } from '../../store/tdexStore';
import type { Balance } from '../../store/walletStore';
import { useWalletStore } from '../../store/walletStore';
import { updateTdexState } from '../../utils/actions';
import type { NetworkString } from '../../utils/constants';
import { LBTC_ASSET, MAIN_ASSETS } from '../../utils/constants';
import { capitalizeFirstLetter, isLbtc, isLbtcTicker } from '../../utils/helpers';

export const Wallet: React.FC<RouteComponentProps> = ({ history }) => {
  const isBackupDone = useAppStore((state) => state.isBackupDone);
  const isFetchingUtxos = useAppStore((state) => state.isFetchingUtxos);
  const isFetchingMarkets = useAppStore((state) => state.isFetchingMarkets);
  const isFetchingTransactions = useAppStore((state) => state.isFetchingTransactions);
  const addAsset = useAssetStore((state) => state.addAsset);
  const assets = useAssetStore((state) => state.assets);
  const fetchAssetData = useAssetStore((state) => state.fetchAssetData);
  const markets = useTdexStore((state) => state.markets);
  const currency = useSettingsStore((state) => state.currency);
  const lbtcUnit = useSettingsStore((state) => state.lbtcUnit);
  const network = useSettingsStore((state) => state.network);
  const balances = useWalletStore((state) => state.balances);
  const totalLbtc = useWalletStore((state) => state.totalBtc);
  //
  const [balancesSorted, setBalancesSorted] = useState<[string, Balance][]>([]);

  // Init
  useEffect(() => {
    (async () => {
      await updateTdexState();
      // Add main assets to store
      MAIN_ASSETS[network as NetworkString].forEach((asset) => addAsset(asset));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      for (const market of markets) {
        await fetchAssetData(market.baseAsset);
        await fetchAssetData(market.quoteAsset);
      }
    })();
  }, [fetchAssetData, markets]);

  useEffect(() => {
    const balancesToDisplay: [string, Balance][] = [];
    if (!Object.keys(balances ?? {}).length) {
      // Display L-BTC with empty balance
      balancesToDisplay.push([LBTC_ASSET[network].assetHash, { value: 0, counterValue: '0', sats: 0 }]);
    } else {
      for (const assetHash in balances) {
        balancesToDisplay.push([assetHash, balances[assetHash]]);
      }
      // Sort by balance
      balancesToDisplay.sort(([aAssetHash, aAmount], [bAssetHash, bAmount]) => {
        if (aAmount < bAmount) return 1;
        if (aAmount > bAmount) return -1;
        return 0;
      });
      // Move L-btc at the beginning
      const lbtcIndex = balancesToDisplay.findIndex(([assetHash]) => isLbtc(assetHash, network));
      const [lbtcBalance] = balancesToDisplay.splice(lbtcIndex, 1);
      balancesToDisplay.splice(0, 0, lbtcBalance);
    }
    setBalancesSorted(balancesToDisplay);
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
              totalBalance={totalLbtc?.value.toString() ?? '0.00'}
              lbtcUnit={lbtcUnit}
              fiatBalance={`${totalLbtc?.counterValue ?? '0.00'}  ${currency.ticker.toUpperCase()}`}
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
                      if (isBackupDone) {
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

            {balancesSorted.map(([assetHash, balance]) => {
              return (
                <IonItem
                  aria-label={assets[assetHash]?.ticker}
                  data-testid={`item-asset-${assets[assetHash]?.ticker}`}
                  key={assetHash}
                  onClick={() => {
                    history.push(`/operations/${assetHash}`);
                  }}
                >
                  <div className="asset-container">
                    <div className="asset-details">
                      <CurrencyIcon assetHash={assetHash} />
                      <div>
                        {assets[assetHash]?.coinGeckoID
                          ? capitalizeFirstLetter(assets[assetHash].coinGeckoID!)
                          : assets[assetHash]?.ticker}
                      </div>
                    </div>
                    <div className="amount-container ion-text-right">
                      <div className="amount-token">
                        {balance.value}{' '}
                        <span className="ticker">
                          {isLbtcTicker(assets[assetHash]?.ticker) ? lbtcUnit : assets[assetHash]?.ticker}
                        </span>
                      </div>
                      <div className="amount-fiat">
                        {balance.counterValue} {currency.ticker.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </IonItem>
              );
            })}
          </IonList>

          {!totalLbtc && (
            <div className="ion-text-center ion-padding-vertical">
              <IonRow>
                <IonCol size="9" offset="1.5" sizeMd="6" offsetMd="3">
                  <IonButton
                    className="main-button"
                    data-testid="main-button"
                    onClick={() => {
                      if (isBackupDone) {
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
