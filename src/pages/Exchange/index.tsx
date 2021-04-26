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
import { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import {
  allTrades,
  AssetWithTicker,
  makeTrade,
  getTradablesAssets,
} from '../../utils/tdex';
import { customCoinSelector, toSatoshi } from '../../utils/helpers';
import {
  addErrorToast,
  addSuccessToast,
} from '../../redux/actions/toastActions';
import PinModal from '../../components/PinModal';
import { getConnectedIdentity } from '../../utils/storage-helper';
import { TDEXMarket, TDEXTrade } from '../../redux/actionTypes/tdexActionTypes';
import { swapVerticalOutline } from 'ionicons/icons';
import { PreviewData } from '../TradeSummary';
import Refresher from '../../components/Refresher';
import { UtxoInterface } from 'ldk';
import { AssetConfig, defaultPrecision } from '../../utils/constants';
import { Dispatch } from 'redux';
import { watchTransaction } from '../../redux/actions/transactionsActions';
import { TradeType } from 'tdex-sdk';
import { useSelector } from 'react-redux';
import './style.scss';
import { unlockUtxos } from '../../redux/actions/walletActions';
import { AppError, NoMarketsProvidedError } from '../../utils/errors';

const ERROR_LIQUIDITY = 'Not enough liquidity in market';

interface ExchangeProps extends RouteComponentProps {
  balances: BalanceInterface[];
  utxos: UtxoInterface[];
  explorerUrl: string;
  markets: TDEXMarket[];
  assets: Record<string, AssetConfig>;
  allAssets: AssetWithTicker[];
  dispatch: Dispatch;
}

const Exchange: React.FC<ExchangeProps> = ({
  history,
  balances,
  explorerUrl,
  markets,
  utxos,
  assets,
  allAssets,
  dispatch,
}) => {
  const lbtcUnit = useSelector((state: any) => state.settings.denominationLBTC);
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
  // focused input
  const [isFocused, setIsFocused] = useState<'sent' | 'receive'>('sent');
  // errors
  const [errorSent, setErrorSent] = useState('');
  const [errorReceived, setErrorReceived] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkAvailableAmountSent = () => {
    if (!trade || !sentAmount || !assetSent) return;

    const availableAmount =
      trade.type === TradeType.BUY
        ? trade.market.quoteAmount
        : trade.market.baseAmount;

    const sats = toSatoshi(
      sentAmount,
      assets[assetSent.asset]?.precision || defaultPrecision,
      assetSent.ticker === 'L-BTC' ? lbtcUnit : undefined
    );

    if (availableAmount && availableAmount < sats) {
      setErrorSent(ERROR_LIQUIDITY);
      return;
    }

    setErrorSent('');
  };

  const checkAvailableAmountReceived = () => {
    if (!trade || !receivedAmount || !assetReceived) return;

    const availableAmount =
      trade.type === TradeType.BUY
        ? trade.market.baseAmount
        : trade.market.quoteAmount;

    const sats = toSatoshi(
      receivedAmount,
      assets[assetReceived.asset]?.precision || defaultPrecision,
      assetReceived.ticker === 'L-BTC' ? lbtcUnit : undefined
    );

    if (availableAmount && availableAmount < sats) {
      setErrorReceived(ERROR_LIQUIDITY);
      return;
    }

    setErrorReceived('');
  };

  useIonViewWillEnter(() => {
    if (markets.length === 0) {
      dispatch(addErrorToast(NoMarketsProvidedError));
      history.goBack();
      return;
    }

    setAssetSent(balances.length > 0 ? balances[0] : allAssets[0]);
    setSentAmount(undefined);
    setReceivedAmount(undefined);
  }, [balances, markets]);

  useEffect(() => {
    if (markets.length === 0 || !assetSent || !assetReceived) return;
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
    if (!balance || !sentAmount) return true;
    const amountAsSats = toSatoshi(sentAmount, balance.precision);
    return amountAsSats > balance.amount;
  };

  const onConfirm = () => setModalOpen(true);

  // make and broadcast trade, then push to trade summary page
  const onPinConfirm = async (pin: string) => {
    if (!assetSent || !trade || !sentAmount) return;
    try {
      setModalOpen(false);
      setLoading(true);
      const identity = await getConnectedIdentity(pin, dispatch);
      if (!trade) return;
      const txid = await makeTrade(
        trade,
        {
          amount: toSatoshi(
            sentAmount,
            assets[assetSent.asset]?.precision || defaultPrecision
          ),
          asset: assetSent.asset,
        },
        explorerUrl,
        utxos,
        identity,
        customCoinSelector(dispatch)
      );

      dispatch(watchTransaction(txid));

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
      dispatch(unlockUtxos());
      if (e instanceof AppError) {
        dispatch(addErrorToast(e));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonLoading isOpen={loading} />
      {assetSent && assetReceived && markets.length > 0 && (
        <PinModal
          open={modalOpen}
          title="Unlock your seed"
          description={`Enter your secret PIN to send ${sentAmount} ${assetSent.ticker} and receive ${receivedAmount} ${assetReceived.ticker}.`}
          onConfirm={onPinConfirm}
          onClose={() => {
            setModalOpen(false);
          }}
          isWrongPin={false}
        />
      )}
      <div className="gradient-background"></div>
      <IonHeader className="exchange-header">
        <IonToolbar>
          <IonTitle>Exchange</IonTitle>
        </IonToolbar>
      </IonHeader>
      {assetSent && markets.length > 0 && (
        <IonContent className="exchange-content">
          <Refresher />
          <div className="exchange">
            <ExchangeRow
              checkBalance
              focused={isFocused === 'sent'}
              setFocus={() => setIsFocused('sent')}
              setTrade={(t: TDEXTrade) => setTrade(t)}
              relatedAssetAmount={receivedAmount || 0}
              relatedAssetHash={assetReceived?.asset || ''}
              asset={assetSent}
              trades={trades}
              onChangeAmount={(newAmount: number) => {
                setSentAmount(newAmount);
                checkAvailableAmountSent();
              }}
              assetsWithTicker={allAssets}
              setAsset={(asset) => {
                if (assetReceived && asset.asset === assetReceived.asset)
                  setAssetReceived(assetSent);
                setAssetSent(asset);
              }}
              error={errorSent}
              setError={setErrorSent}
            />
            <div
              className="exchange-divider"
              onClick={() => {
                const firstAsset = { ...assetSent };
                setAssetSent(assetReceived);
                setAssetReceived(firstAsset);
              }}
            >
              <IonIcon className="swap-btn" icon={swapVerticalOutline} />
            </div>
            {assetReceived && (
              <ExchangeRow
                focused={isFocused === 'receive'}
                setFocus={() => setIsFocused('receive')}
                setTrade={(t: TDEXTrade) => setTrade(t)}
                trades={trades}
                relatedAssetAmount={sentAmount || 0}
                relatedAssetHash={assetSent?.asset || ''}
                asset={assetReceived}
                onChangeAmount={(newAmount: number) => {
                  setReceivedAmount(newAmount);
                  checkAvailableAmountReceived();
                }}
                assetsWithTicker={tradableAssets}
                setAsset={(asset) => {
                  if (asset.asset === assetSent.asset)
                    setAssetSent(assetReceived);
                  setAssetReceived(asset);
                }}
                error={errorReceived}
                setError={setErrorReceived}
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
