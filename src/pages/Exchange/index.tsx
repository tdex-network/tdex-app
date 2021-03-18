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
  useIonViewWillEnter,
} from '@ionic/react';
import ExchangeRow from '../../redux/containers/exchangeRowCointainer';
import classNames from 'classnames';
import './style.scss';
import { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import {
  allTrades,
  AssetWithTicker,
  bestPrice,
  makeTrade,
  getTradablesAssets,
} from '../../utils/tdex';
import {
  fromSatoshiFixed,
  toSatoshi,
  validAmountString,
} from '../../utils/helpers';
import {
  addErrorToast,
  addSuccessToast,
} from '../../redux/actions/toastActions';
import PinModal from '../../components/PinModal';
import { getIdentity } from '../../utils/storage-helper';
import { setAddresses } from '../../redux/actions/walletActions';
import { TDEXMarket, TDEXTrade } from '../../redux/actionTypes/tdexActionTypes';
import { swapVerticalOutline } from 'ionicons/icons';
import { update } from '../../redux/actions/appActions';
import { PreviewData } from '../TradeSummary';
import Refresher from '../../components/Refresher';
import { UtxoInterface } from 'ldk';

interface ExchangeProps extends RouteComponentProps {
  balances: BalanceInterface[];
  utxos: UtxoInterface[];
  explorerUrl: string;
  markets: TDEXMarket[];
}

const Exchange: React.FC<ExchangeProps> = ({
  history,
  balances,
  explorerUrl,
  markets,
  utxos,
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

  const onChangeReceived = async (
    newReceivedAmount: string | null | undefined
  ) => {
    if (!newReceivedAmount) {
      setSentAmount('');
      setReceivedAmount('');
      return;
    }

    if (newReceivedAmount === '.') {
      setReceivedAmount(newReceivedAmount);
      return;
    }

    if (parseFloat(newReceivedAmount) < 0) {
      setSentAmount('0');
      setReceivedAmount(newReceivedAmount);
      return;
    }

    setReceivedAmount(newReceivedAmount);
    if (!assetReceived || trades.length === 0) return;
    updateSentAmount(newReceivedAmount);
  };

  const onChangeSent = async (newSentAmount: string | null | undefined) => {
    if (!newSentAmount) {
      setSentAmount('');
      setReceivedAmount('');
      return;
    }

    if (parseFloat(newSentAmount) < 0) {
      setSentAmount(newSentAmount);
      setReceivedAmount('0');
      return;
    }

    setSentAmount(newSentAmount);
    if (!assetSent || trades.length === 0) return;
    updateReceivedAmount(newSentAmount);
  };

  const onErrorGetPrice = (e: string) => dispatch(addErrorToast(e));

  // if sent input field is focused, it is used to asynchornously update the received amount
  const updateReceivedAmount = async (newSentAmount: string) => {
    if (focused !== 'sent') return;
    if (!assetSent) return;
    try {
      setIsReceivedUpdating(true);
      const { amount, asset, trade: bestTrade } = await bestPrice(
        {
          amount: parseFloat(newSentAmount),
          asset: assetSent.asset,
        },
        trades,
        onErrorGetPrice
      );
      if (asset !== assetReceived?.asset) {
        throw new Error('Wrong preview asset');
      }
      setReceivedAmount(fromSatoshiFixed(amount, 8, 8));
      setTrade(bestTrade);
    } catch (e) {
      console.error(e);
      dispatch(addErrorToast(e.message || e));
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
          amount: parseFloat(newReceivedAmount),
          asset: assetReceived.asset,
        },
        trades,
        onErrorGetPrice
      );

      if (asset !== assetSent?.asset) {
        throw new Error('Wrong preview asset');
      }

      setSentAmount(fromSatoshiFixed(amount, 8, 8));
      setTrade(bestTrade);
    } catch (e) {
      console.error(e);
      dispatch(addErrorToast(e.message || e));
    } finally {
      setIsSentUpdating(false);
    }
  };

  const sentAmountGreaterThanBalance = () => {
    const balanceAmount = balances.find((b) => b.asset === assetSent?.asset)
      ?.amount;
    if (!balanceAmount || !sentAmount) return false;
    const amountAsSats = toSatoshi(parseFloat(sentAmount));
    return amountAsSats > balanceAmount;
  };

  const onConfirm = () => setModalOpen(true);

  // make and broadcast trade, then push to trade summary page
  const onPinConfirm = async (pin: string) => {
    if (!assetSent) return;
    try {
      setModalOpen(false);
      setLoading(true);
      const identity = await getIdentity(pin);
      if (!trade) return;
      const { txid, identityAddresses } = await makeTrade(
        trade,
        {
          amount: toSatoshi(parseFloat(sentAmount || '0')),
          asset: assetSent.asset,
        },
        explorerUrl,
        utxos,
        identity
      );

      dispatch(setAddresses(identityAddresses));
      dispatch(update());
      setTimeout(() => {
        dispatch(update());
      }, 3000);
      addSuccessToast('Trade successfully computed');
      const preview: PreviewData = {
        sent: {
          ticker: assetSent.ticker,
          amount:
            '-' +
            (Number(sentAmount).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            }) || '0.00'),
        },
        received: {
          ticker: assetReceived?.ticker || 'unknown',
          amount: receivedAmount || '0.00',
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
                loading ||
                !validAmountString(sentAmount) ||
                !validAmountString(receivedAmount) ||
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
