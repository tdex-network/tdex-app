import {
  IonContent,
  IonPage,
  IonText,
  useIonViewWillEnter,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
} from '@ionic/react';
import classNames from 'classnames';
import type { UtxoInterface, StateRestorerOpts } from 'ldk';
import { mnemonicRestorerFromState } from 'ldk';
import React, { useState, useEffect } from 'react';
import type { RouteComponentProps } from 'react-router';
import type { Dispatch } from 'redux';
import { TradeType } from 'tdex-sdk';

import swap from '../../assets/img/swap.svg';
import tradeHistory from '../../assets/img/trade-history.svg';
import Header from '../../components/Header';
import Loader from '../../components/Loader';
import PinModal from '../../components/PinModal';
import Refresher from '../../components/Refresher';
import type {
  TDEXMarket,
  TDEXTrade,
} from '../../redux/actionTypes/tdexActionTypes';
import type { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import {
  addErrorToast,
  addSuccessToast,
} from '../../redux/actions/toastActions';
import { watchTransaction } from '../../redux/actions/transactionsActions';
import { unlockUtxos } from '../../redux/actions/walletActions';
import ExchangeRow from '../../redux/containers/exchangeRowContainer';
import type { AssetConfig, LbtcDenomination } from '../../utils/constants';
import {
  defaultPrecision,
  PIN_TIMEOUT_FAILURE,
  PIN_TIMEOUT_SUCCESS,
} from '../../utils/constants';
import {
  AppError,
  IncorrectPINError,
  NoMarketsProvidedError,
} from '../../utils/errors';
import {
  customCoinSelector,
  getAssetHashLBTC,
  isLbtc,
  toSatoshi,
} from '../../utils/helpers';
import type { TDexMnemonicRedux } from '../../utils/identity';
import { getConnectedTDexMnemonic } from '../../utils/storage-helper';
import type { AssetWithTicker } from '../../utils/tdex';
import { allTrades, makeTrade, getTradablesAssets } from '../../utils/tdex';
import type { PreviewData } from '../TradeSummary';

import './style.scss';

const ERROR_LIQUIDITY = 'Not enough liquidity in market';

interface ExchangeProps extends RouteComponentProps {
  allAssets: AssetWithTicker[];
  assets: Record<string, AssetConfig>;
  balances: BalanceInterface[];
  dispatch: Dispatch;
  explorerUrl: string;
  lastUsedIndexes: StateRestorerOpts;
  lbtcUnit: LbtcDenomination;
  markets: TDEXMarket[];
  utxos: UtxoInterface[];
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
  lastUsedIndexes,
  lbtcUnit,
}) => {
  const [hasBeenSwapped, setHasBeenSwapped] = useState<boolean>(false);
  // user inputs amount
  const [sentAmount, setSentAmount] = useState<string>();
  const [receivedAmount, setReceivedAmount] = useState<string>();
  // assets selected for trade
  const [assetSent, setAssetSent] = useState<AssetWithTicker>();
  const [assetReceived, setAssetReceived] = useState<AssetWithTicker>();
  // current trades/tradable assets
  const [tradableAssetsForAssetSent, setTradableAssetsForAssetSent] = useState<
    AssetWithTicker[]
  >([]);
  const [tradableAssetsForAssetReceived, setTradableAssetsForAssetReceived] =
    useState<AssetWithTicker[]>([]);
  const [trades, setTrades] = useState<TDEXTrade[]>([]);
  // selected trade
  const [trade, setTrade] = useState<TDEXTrade>();
  // focused input
  const [isFocused, setIsFocused] = useState<'sent' | 'receive'>('sent');
  // errors
  const [errorSent, setErrorSent] = useState('');
  const [errorReceived, setErrorReceived] = useState('');
  const [needReset, setNeedReset] = useState<boolean>(false);
  //
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);

  useIonViewWillEnter(() => {
    if (markets.length === 0) {
      dispatch(addErrorToast(NoMarketsProvidedError));
      history.goBack();
      return;
    }
    const lbtcHash = getAssetHashLBTC();
    const lbtcAsset = allAssets.find(h => h.asset === lbtcHash);
    setAssetSent(lbtcAsset);
    setSentAmount(undefined);
    setReceivedAmount(undefined);
  }, [balances, markets]);

  useEffect(() => {
    if (markets.length === 0 || !assetSent || !assetReceived) return;
    setTrades(allTrades(markets, assetSent.asset, assetReceived.asset));
  }, [assetSent, assetReceived, markets]);

  useEffect(() => {
    if (!assetSent || hasBeenSwapped) return;
    const sentTradables = getTradablesAssets(markets, assetSent.asset);
    // TODO: Add opposite asset and remove current
    setTradableAssetsForAssetReceived(sentTradables);
    setAssetReceived(sentTradables[0]);
  }, [assetSent, markets]);

  useEffect(() => {
    if (!assetReceived || hasBeenSwapped) return undefined;
    const receivedTradables = getTradablesAssets(markets, assetReceived.asset);
    // TODO: Add opposite asset and remove current
    setTradableAssetsForAssetSent(receivedTradables);
    return () => setAssetReceived(undefined);
  }, [assetReceived, markets]);

  const checkAvailableAmountSent = () => {
    if (!trade || !sentAmount || !assetSent) return;
    const availableAmount =
      trade.type === TradeType.BUY
        ? trade.market.quoteAmount
        : trade.market.baseAmount;
    const sats = toSatoshi(
      sentAmount,
      assets[assetSent.asset]?.precision ?? defaultPrecision,
      assetSent.ticker === 'L-BTC' ? lbtcUnit : undefined,
    );
    if (
      !hasBeenSwapped &&
      availableAmount &&
      sats.greaterThan(availableAmount)
    ) {
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
      assets[assetReceived.asset]?.precision ?? defaultPrecision,
      assetReceived.ticker === 'L-BTC' ? lbtcUnit : undefined,
    );
    if (
      !hasBeenSwapped &&
      availableAmount &&
      sats.greaterThan(availableAmount)
    ) {
      setErrorReceived(ERROR_LIQUIDITY);
      return;
    }
    setErrorReceived('');
    // Reset hasBeenSwapped
    setHasBeenSwapped(false);
  };

  const sentAmountGreaterThanBalance = () => {
    const balance = balances.find(b => b.asset === assetSent?.asset);
    if (!balance || !sentAmount) return true;
    const amountAsSats = toSatoshi(
      sentAmount,
      balance.precision,
      balance.ticker === 'L-BTC' ? lbtcUnit : undefined,
    );
    return amountAsSats.greaterThan(balance.amount);
  };

  const onConfirm = () => setModalOpen(true);

  // make and broadcast trade, then push to trade summary page
  const onPinConfirm = async (pin: string) => {
    if (!assetSent || !trade || !sentAmount) return;
    try {
      setModalOpen(false);
      setLoading(true);
      let identity;
      try {
        const toRestore = await getConnectedTDexMnemonic(pin, dispatch);
        identity = (await mnemonicRestorerFromState(toRestore)(
          lastUsedIndexes,
        )) as TDexMnemonicRedux;
        setIsWrongPin(false);
        setTimeout(() => {
          setIsWrongPin(null);
          setNeedReset(true);
        }, PIN_TIMEOUT_SUCCESS);
      } catch (_) {
        throw IncorrectPINError;
      }
      if (!trade) return;
      const txid = await makeTrade(
        trade,
        {
          amount: toSatoshi(
            sentAmount,
            assets[assetSent.asset]?.precision ?? defaultPrecision,
            isLbtc(assetSent.asset) ? lbtcUnit : undefined,
          ).toNumber(),
          asset: assetSent.asset,
        },
        explorerUrl,
        utxos,
        identity,
        customCoinSelector(dispatch),
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
      setLoading(false);
      history.replace(`/tradesummary/${txid}`, { preview });
    } catch (e) {
      console.error(e);
      dispatch(unlockUtxos());
      setIsWrongPin(true);
      setLoading(false);
      setTimeout(() => {
        setIsWrongPin(null);
        setNeedReset(true);
      }, PIN_TIMEOUT_FAILURE);
      if (e instanceof AppError) {
        dispatch(addErrorToast(e));
      }
    }
  };

  return (
    <IonPage id="exchange-page">
      <Loader showLoading={isLoading} delay={0} />
      {assetSent && assetReceived && markets.length > 0 && (
        <PinModal
          open={modalOpen}
          title="Unlock your seed"
          description={`Enter your secret PIN to send ${sentAmount} ${
            isLbtc(assetSent.asset) ? lbtcUnit : assetSent.ticker
          } and receive ${receivedAmount} ${
            isLbtc(assetReceived.asset) ? lbtcUnit : assetReceived.ticker
          }.`}
          onConfirm={onPinConfirm}
          onClose={() => {
            setModalOpen(false);
          }}
          isWrongPin={isWrongPin}
          needReset={needReset}
          setNeedReset={setNeedReset}
          setIsWrongPin={setIsWrongPin}
        />
      )}

      {assetSent && markets.length > 0 && (
        <IonContent className="exchange-content">
          <Refresher />
          <IonGrid className="ion-no-padding ion-padding-top">
            <Header
              hasBackButton={false}
              hasCloseButton={true}
              customRightButton={
                <IonButton
                  className="custom-right-button"
                  onClick={() => history.push('/history')}
                >
                  <img src={tradeHistory} alt="trade history" />
                </IonButton>
              }
              title="Exchange"
              isTitleLarge={true}
            />
            <ExchangeRow
              sendInput={true}
              focused={isFocused === 'sent'}
              setFocus={() => setIsFocused('sent')}
              setTrade={(t: TDEXTrade) => setTrade(t)}
              relatedAssetAmount={receivedAmount || ''}
              relatedAssetHash={assetReceived?.asset || ''}
              asset={assetSent}
              assetAmount={sentAmount}
              trades={trades}
              trade={trade}
              onChangeAmount={(newAmount: string) => {
                setSentAmount(newAmount);
                checkAvailableAmountSent();
              }}
              assetsWithTicker={tradableAssetsForAssetSent}
              setAsset={asset => {
                if (assetReceived && asset.asset === assetReceived.asset)
                  setAssetReceived(assetSent);
                setAssetSent(asset);
              }}
              error={errorSent}
              setError={setErrorSent}
              setOtherInputError={setErrorReceived}
              isLoading={isLoading}
            />

            <div
              className="exchange-divider"
              onClick={() => {
                setHasBeenSwapped(true);
                setAssetSent(assetReceived);
                setAssetReceived(assetSent);
                setSentAmount(receivedAmount);
                setReceivedAmount(sentAmount);
                setTradableAssetsForAssetSent(tradableAssetsForAssetReceived);
                setTradableAssetsForAssetReceived(tradableAssetsForAssetSent);
              }}
            >
              <img src={swap} alt="swap" />
            </div>

            {assetReceived && (
              <ExchangeRow
                sendInput={false}
                focused={isFocused === 'receive'}
                setFocus={() => setIsFocused('receive')}
                setTrade={(t: TDEXTrade) => setTrade(t)}
                trades={trades}
                trade={trade}
                relatedAssetAmount={sentAmount || ''}
                relatedAssetHash={assetSent?.asset || ''}
                asset={assetReceived}
                assetAmount={receivedAmount}
                onChangeAmount={(newAmount: string) => {
                  setReceivedAmount(newAmount);
                  checkAvailableAmountReceived();
                }}
                assetsWithTicker={tradableAssetsForAssetReceived}
                setAsset={asset => {
                  if (asset.asset === assetSent.asset)
                    setAssetSent(assetReceived);
                  setAssetReceived(asset);
                }}
                error={errorReceived}
                setError={setErrorReceived}
                setOtherInputError={setErrorSent}
                isLoading={isLoading}
              />
            )}

            <IonRow>
              <IonCol size="8.5" offset="1.75">
                <IonButton
                  className={classNames('main-button', {
                    'button-disabled':
                      !assetSent ||
                      !assetReceived ||
                      isLoading ||
                      sentAmountGreaterThanBalance(),
                  })}
                  onClick={onConfirm}
                  disabled={
                    !assetSent ||
                    !assetReceived ||
                    isLoading ||
                    sentAmountGreaterThanBalance()
                  }
                >
                  CONFIRM
                </IonButton>
              </IonCol>
            </IonRow>

            {trade && (
              <IonRow className="market-provider ion-margin-vertical-x2 ion-text-center">
                <IonCol size="10" offset="1">
                  <IonText className="trade-info" color="light">
                    Market provided by:{' '}
                    <span className="provider-info">
                      {` ${trade.market.provider.name} - ${trade.market.provider.endpoint}`}
                    </span>
                  </IonText>
                </IonCol>
              </IonRow>
            )}
          </IonGrid>
        </IonContent>
      )}
    </IonPage>
  );
};

export default Exchange;
