import React, { useState, useEffect } from 'react';
import { RouteComponentProps } from 'react-router';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonLoading,
  IonText,
  IonIcon,
  useIonViewWillEnter,
} from '@ionic/react';
import ExchangeRow from '../../redux/containers/exchangeRowContainer';
import classNames from 'classnames';
import './style.scss';
import { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import {
  allTrades,
  AssetWithTicker,
  makeTrade,
  getTradablesAssets,
} from '../../utils/tdex';
import { toSatoshi } from '../../utils/helpers';
import {
  addErrorToast,
  addSuccessToast,
} from '../../redux/actions/toastActions';
import PinModal from '../../components/PinModal';
import { getIdentityOpts } from '../../utils/storage-helper';
import { setAddresses } from '../../redux/actions/walletActions';
import { TDEXMarket, TDEXTrade } from '../../redux/actionTypes/tdexActionTypes';
import { swapVerticalOutline } from 'ionicons/icons';
import { update } from '../../redux/actions/appActions';
import { PreviewData } from '../TradeSummary';
import Refresher from '../../components/Refresher';
import { AssetConfig, defaultPrecision } from '../../utils/constants';
import { Dispatch } from 'redux';

interface ExchangeProps extends RouteComponentProps {
  balances: BalanceInterface[];
  explorerUrl: string;
  markets: TDEXMarket[];
  assets: Record<string, AssetConfig>;
  dispatch: Dispatch;
}

const Exchange: React.FC<ExchangeProps> = ({
  history,
  balances,
  explorerUrl,
  markets,
  assets,
  dispatch,
}) => {
  // user inputs amount
  const [sentAmount, setSentAmount] = useState<number>();
  const [receivedAmount, setReceivedAmount] = useState<number>();
  // assets selected for trade
  const [assetSent, setAssetSent] = useState<AssetWithTicker>();
  const [assetReceived, setAssetReceived] = useState<AssetWithTicker>();
  // current trades/tradable assets
  const [tradableAssets, setTradableAssets] = useState<AssetWithTicker[]>([]);
  const [trades, setTrades] = useState<TDEXTrade[]>([]);
  // selected trade
  const [trade, setTrade] = useState<TDEXTrade>();

  const [isFocused, setIsFocused] = useState<'sent' | 'receive' | ''>('');

  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useIonViewWillEnter(() => {
    if (balances.length === 0) {
      dispatch(addErrorToast('need founds to trade'));
      history.goBack();
      return;
    }

    if (markets.length === 0) {
      dispatch(addErrorToast('no markets available'));
      history.goBack();
      return;
    }

    setAssetSent(balances[0]);
    setSentAmount(undefined);
    setReceivedAmount(undefined);
  }, [balances, markets]);

  useEffect(() => {
    if (
      balances.length === 0 ||
      markets.length === 0 ||
      !assetSent ||
      !assetReceived
    )
      return;
    setTrades(allTrades(markets, assetSent.asset, assetReceived.asset));
  }, [assetSent, assetReceived, markets]);

  useEffect(() => {
    if (!assetSent) return;
    const tradable = getTradablesAssets(markets, assetSent.asset);
    setTradableAssets(tradable);
    setAssetReceived(tradable[0]);
  }, [assetSent, markets]);

  const sentAmountGreaterThanBalance = () => {
    const balance = balances.find((b) => b.asset === assetSent?.asset);
    if (!balance || !sentAmount) return false;
    const amountAsSats = toSatoshi(sentAmount, balance.precision);
    return amountAsSats > balance.amount;
  };

  const onConfirm = () => setModalOpen(true);

  // make and broadcast trade, then push to trade summary page
  const onPinConfirm = async (pin: string) => {
    if (!assetSent || !trade || !sentAmount) return;
    try {
      setIsFocused('');
      setModalOpen(false);
      setLoading(true);
      const identityOpts = await getIdentityOpts(pin);
      const { txid, identityAddresses } = await makeTrade(
        trade,
        {
          amount: toSatoshi(
            sentAmount,
            assets[assetSent.asset]?.precision || defaultPrecision
          ),
          asset: assetSent.asset,
        },
        explorerUrl,
        identityOpts
      );

      dispatch(setAddresses(identityAddresses));
      addSuccessToast('Trade successfully computed');
      const preview: PreviewData = {
        sent: {
          ticker: assetSent.ticker,
          amount: `-${sentAmount || '??'}`,
        },
        received: {
          ticker: assetReceived?.ticker || 'unknown',
          amount: receivedAmount?.toString() || '??',
        },
      };
      history.replace(`/tradesummary/${txid}`, { preview });
    } catch (e) {
      console.error(e);
      dispatch(addErrorToast(e.message || e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonLoading isOpen={loading} />
      {assetSent && assetReceived && balances.length > 0 && markets.length > 0 && (
        <PinModal
          open={modalOpen}
          title="Unlock your seed"
          description={`Enter your secret PIN to send ${sentAmount} ${assetSent.ticker} and receive ${receivedAmount} ${assetReceived.ticker}.`}
          onConfirm={onPinConfirm}
          onClose={() => {
            setModalOpen(false);
          }}
        />
      )}
      <div className="gradient-background"></div>
      <IonHeader className="exchange-header">
        <IonToolbar>
          <IonTitle>Exchange</IonTitle>
        </IonToolbar>
      </IonHeader>
      {assetSent && balances.length > 0 && markets.length > 0 && (
        <IonContent className="exchange-content">
          <Refresher />
          <div className="exchange">
            <ExchangeRow
              focused={isFocused === 'sent'}
              setFocus={() => setIsFocused('sent')}
              setTrade={(t: TDEXTrade) => setTrade(t)}
              relatedAssetAmount={receivedAmount || 0}
              relatedAssetHash={assetReceived?.asset || ''}
              asset={assetSent}
              trades={trades}
              onChangeAmount={(newAmount: number) => setSentAmount(newAmount)}
              assetsWithTicker={balances}
              setAsset={(asset) => {
                if (assetReceived && asset.asset === assetReceived.asset)
                  setAssetReceived(assetSent);
                setAssetSent(asset);
              }}
            />
            <div
              className={classNames([
                'exchange-divider',
                {
                  disabled:
                    !assetReceived ||
                    !balances.map((b) => b.asset).includes(assetReceived.asset),
                },
              ])}
              onClick={() => {
                if (
                  !assetReceived ||
                  !balances.map((b) => b.asset).includes(assetReceived.asset)
                )
                  return;

                const firstAsset = { ...assetSent };
                setAssetSent(assetReceived);
                setAssetReceived(firstAsset);
              }}
            >
              <IonIcon className="swap-btn" icon={swapVerticalOutline} />
            </div>
            {assetReceived && (
              <ExchangeRow
                focused={isFocused.valueOf() === 'receive'.valueOf()}
                setFocus={() => setIsFocused('receive')}
                setTrade={(t: TDEXTrade) => setTrade(t)}
                trades={trades}
                relatedAssetAmount={sentAmount || 0}
                relatedAssetHash={assetSent?.asset || ''}
                asset={assetReceived}
                onChangeAmount={(newAmount: number) =>
                  setReceivedAmount(newAmount)
                }
                assetsWithTicker={tradableAssets}
                setAsset={(asset) => {
                  if (asset.asset === assetSent.asset)
                    setAssetSent(assetReceived);
                  setAssetReceived(asset);
                }}
              />
            )}
          </div>
          <div className="buttons">
            <IonButton
              className={classNames('main-button', {
                secondary: false,
              })}
              onClick={onConfirm}
              disabled={
                !assetSent ||
                !assetReceived ||
                loading ||
                sentAmountGreaterThanBalance()
              }
            >
              Confirm
            </IonButton>
            <IonButton
              routerLink="/history"
              className="main-button secondary no-border"
            >
              Trade history
            </IonButton>
          </div>
          {trade && (
            <div className="market-provider">
              <IonText className="trade-info" color="light">
                Market provided by:{' '}
                <span className="provider-info">
                  {` ${trade.market.provider.name} - ${trade.market.provider.endpoint}`}
                </span>
              </IonText>
            </div>
          )}
        </IonContent>
      )}
    </IonPage>
  );
};

export default Exchange;
