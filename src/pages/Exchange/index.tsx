import React, { useState, useEffect } from 'react';
import { RouteComponentProps } from 'react-router';
import { useDispatch } from 'react-redux';
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
  IonRefresher,
  IonRefresherContent,
  useIonViewWillEnter,
} from '@ionic/react';
import ExchangeRow from '../../redux/containers/exchangeRowCointainer';
import classNames from 'classnames';
import { RefresherEventDetail } from '@ionic/core';
import './style.scss';
import { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import {
  allTrades,
  AssetWithTicker,
  bestPrice,
  makeTrade,
  getTradablesAssets,
} from '../../utils/tdex';
import { amountGuard, fromSatoshiFixed, toSatoshi } from '../../utils/helpers';
import {
  addErrorToast,
  addSuccessToast,
} from '../../redux/actions/toastActions';
import PinModal from '../../components/PinModal';
import { getIdentityOpts } from '../../utils/storage-helper';
import { setAddresses } from '../../redux/actions/walletActions';
import { TDEXMarket, TDEXTrade } from '../../redux/actionTypes/tdexActionTypes';
import { chevronDownCircleOutline, swapVerticalOutline } from 'ionicons/icons';
import { update } from '../../redux/actions/appActions';

interface ExchangeProps extends RouteComponentProps {
  balances: BalanceInterface[];
  explorerUrl: string;
  markets: TDEXMarket[];
}

const Exchange: React.FC<ExchangeProps> = ({
  history,
  balances,
  explorerUrl,
  markets,
}) => {
  const dispatch = useDispatch();

  const [isSentUpdating, setIsSentUpdating] = useState(false);
  const [isReceivedUpdating, setIsReceivedUpdating] = useState(false);
  const [focused, setFocused] = useState<'sent' | 'received'>('sent');
  const [assetSent, setAssetSent] = useState<AssetWithTicker>();
  const [tradableAssets, setTradableAssets] = useState<AssetWithTicker[]>([]);
  const [assetReceived, setAssetReceived] = useState<AssetWithTicker>();
  const [trades, setTrades] = useState<TDEXTrade[]>([]);
  const [trade, setTrade] = useState<TDEXTrade>();
  const [sentAmount, setSentAmount] = useState<string>();
  const [receivedAmount, setReceivedAmount] = useState<string>();
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
  });

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
    if (!assetReceived) {
      setAssetReceived(tradable[0]);
    }
  }, [assetSent, markets]);

  const onChangeReceived = async (
    newReceivedAmount: string | null | undefined
  ) => {
    if (!newReceivedAmount) {
      setSentAmount('');
      setReceivedAmount('');
      return;
    }

    if (parseFloat(newReceivedAmount) <= 0) {
      setSentAmount('0');
      setReceivedAmount(newReceivedAmount);
      return;
    }

    setReceivedAmount(amountGuard(newReceivedAmount));
    if (!assetReceived || trades.length === 0) return;
    updateSentAmount(newReceivedAmount);
  };

  const onChangeSent = async (newSentAmount: string | null | undefined) => {
    if (!newSentAmount) {
      setSentAmount('');
      setReceivedAmount('');
      return;
    }

    if (parseFloat(newSentAmount) <= 0) {
      setSentAmount(newSentAmount);
      setReceivedAmount('0');
      return;
    }

    setSentAmount(amountGuard(newSentAmount));
    if (!assetSent || trades.length === 0) return;
    updateReceivedAmount(newSentAmount);
  };

  // if sent input field is focused, it is used to asynchornously update the received amount
  const updateReceivedAmount = async (newSentAmount: string) => {
    if (focused !== 'sent') return;
    if (!assetSent) return;
    try {
      setIsReceivedUpdating(true);
      const { amount, asset, trade: bestTrade } = await bestPrice(
        {
          amount: parseFloat(amountGuard(newSentAmount)),
          asset: assetSent.asset,
        },
        trades
      );
      // TODO check asset
      setReceivedAmount(amountGuard(fromSatoshiFixed(amount, 8, 8)));
      setTrade(bestTrade);
    } catch (e) {
      console.error(e);
      dispatch(addErrorToast(e.message || e));
      setReceivedAmount('');
    } finally {
      setIsReceivedUpdating(false);
    }
  };

  // if received input field is focused, it is used to asynchronously update the sent amount
  const updateSentAmount = async (newReceivedAmount: string) => {
    if (focused !== 'received') return;
    if (!assetReceived) return;
    try {
      setIsSentUpdating(true);
      const { amount, asset, trade: bestTrade } = await bestPrice(
        {
          amount: parseFloat(amountGuard(newReceivedAmount)),
          asset: assetReceived.asset,
        },
        trades
      );
      // TODO check asset
      setSentAmount(amountGuard(fromSatoshiFixed(amount, 8, 8)));
      setTrade(bestTrade);
    } catch (e) {
      console.error(e);
      dispatch(addErrorToast(e.message || e));
      setReceivedAmount('');
    } finally {
      setIsSentUpdating(false);
    }
  };

  const onConfirm = () => setModalOpen(true);

  // make and broadcast trade, then push to trade summary page
  const onPinConfirm = async (pin: string) => {
    if (!assetSent) return;
    try {
      setModalOpen(false);
      setLoading(true);
      const identityOpts = await getIdentityOpts(pin);
      if (!trade) return;
      const { txid, identityAddresses } = await makeTrade(
        trade,
        { amount: toSatoshi(parseFloat(sentAmount!)), asset: assetSent.asset },
        explorerUrl,
        identityOpts
      );

      dispatch(setAddresses(identityAddresses));
      dispatch(update());
      setTimeout(() => {
        dispatch(update());
      }, 3000);
      addSuccessToast('Trade successfully computed');
      history.push(`/tradesummary/${txid}`);
    } catch (e) {
      console.error(e);
      dispatch(addErrorToast(e.message || e));
    } finally {
      setLoading(false);
    }
  };

  // update action on refresh
  const onRefresh = (event: CustomEvent<RefresherEventDetail>) => {
    dispatch(update());
    setTimeout(() => {
      event.detail.complete();
    }, 2000);
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
          <IonRefresher slot="fixed" onIonRefresh={onRefresh}>
            <IonRefresherContent
              pullingIcon={chevronDownCircleOutline}
              refreshingSpinner="circles"
            />
          </IonRefresher>
          <div className="exchange">
            <ExchangeRow
              asset={assetSent}
              amount={sentAmount}
              onChangeAmount={onChangeSent}
              isUpdating={isSentUpdating}
              assets={balances}
              setAsset={(asset) => {
                if (assetReceived && asset.asset === assetReceived.asset)
                  setAssetReceived(assetSent);
                setAssetSent(asset);
              }}
              setFocused={() => setFocused('sent')}
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
                asset={assetReceived}
                amount={receivedAmount}
                onChangeAmount={onChangeReceived}
                isUpdating={isReceivedUpdating}
                assets={tradableAssets}
                setAsset={(asset) => {
                  if (asset.asset === assetSent.asset)
                    setAssetSent(assetReceived);
                  setAssetReceived(asset);
                }}
                setFocused={() => setFocused('received')}
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
                !sentAmount ||
                !receivedAmount ||
                loading ||
                (balances.find((b) => b.asset === assetSent.asset)?.amount ||
                  -1) < toSatoshi(parseFloat(sentAmount))
              }
            >
              Confirm
            </IonButton>
            <IonButton routerLink="/history" className="main-button secondary">
              Go to trade history
            </IonButton>
            {trade && (
              <IonText className="trade-info" color="light">
                Market provided by:{' '}
                <span className="provider-info">
                  {` ${trade.market.provider.name} - ${trade.market.provider.endpoint}`}
                </span>
              </IonText>
            )}
          </div>
        </IonContent>
      )}
    </IonPage>
  );
};

export default Exchange;
