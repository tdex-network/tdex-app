import './style.scss';
import {
  IonContent,
  IonPage,
  IonText,
  useIonViewWillEnter,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonRippleEffect,
  useIonAlert,
} from '@ionic/react';
import classNames from 'classnames';
import type { UtxoInterface, StateRestorerOpts } from 'ldk';
import { mnemonicRestorerFromState } from 'ldk';
import React, { useState, useEffect } from 'react';
import type { RouteComponentProps } from 'react-router';
import type { Dispatch } from 'redux';
import type { NetworkString } from 'tdex-sdk';
import { TradeType } from 'tdex-sdk';

import swap from '../../assets/img/swap.svg';
import tradeHistory from '../../assets/img/trade-history.svg';
import Header from '../../components/Header';
import Loader from '../../components/Loader';
import PinModal from '../../components/PinModal';
import Refresher from '../../components/Refresher';
import type { TDEXMarket, TDEXTrade } from '../../redux/actionTypes/tdexActionTypes';
import type { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import { updateMarkets } from '../../redux/actions/tdexActions';
import { addErrorToast, addSuccessToast } from '../../redux/actions/toastActions';
import { watchTransaction } from '../../redux/actions/transactionsActions';
import { unlockUtxos } from '../../redux/actions/walletActions';
import ExchangeRow from '../../redux/containers/exchangeRowContainer';
import type { AssetConfig, LbtcDenomination } from '../../utils/constants';
import { defaultPrecision, LBTC_ASSET, PIN_TIMEOUT_FAILURE, PIN_TIMEOUT_SUCCESS } from '../../utils/constants';
import { AppError, IncorrectPINError } from '../../utils/errors';
import { customCoinSelector, isLbtc, isLbtcTicker, toSatoshi } from '../../utils/helpers';
import type { TDexMnemonicRedux } from '../../utils/identity';
import { getConnectedTDexMnemonic } from '../../utils/storage-helper';
import type { AssetWithTicker } from '../../utils/tdex';
import { allTrades, makeTrade, getTradablesAssets } from '../../utils/tdex';
import type { PreviewData } from '../TradeSummary';

const ERROR_LIQUIDITY = 'Not enough liquidity in market';

interface ExchangeProps extends RouteComponentProps {
  allAssets: AssetWithTicker[];
  assets: Record<string, AssetConfig>;
  balances: BalanceInterface[];
  dispatch: Dispatch;
  explorerLiquidAPI: string;
  isFetchingMarkets: boolean;
  lastUsedIndexes: StateRestorerOpts;
  lbtcUnit: LbtcDenomination;
  markets: TDEXMarket[];
  network: NetworkString;
  torProxy: string;
  utxos: UtxoInterface[];
}

const Exchange: React.FC<ExchangeProps> = ({
  history,
  balances,
  explorerLiquidAPI,
  markets,
  utxos,
  assets,
  dispatch,
  lastUsedIndexes,
  lbtcUnit,
  network,
  torProxy,
  isFetchingMarkets,
}) => {
  const [hasBeenSwapped, setHasBeenSwapped] = useState<boolean>(false);
  // user inputs amount
  const [sentAmount, setSentAmount] = useState<string>();
  const [receivedAmount, setReceivedAmount] = useState<string>();
  // assets selected for trade
  const [assetSent, setAssetSent] = useState<AssetWithTicker>();
  const [assetReceived, setAssetReceived] = useState<AssetWithTicker>();
  // current trades/tradable assets
  const [tradableAssetsForAssetSent, setTradableAssetsForAssetSent] = useState<AssetWithTicker[]>([]);
  const [tradableAssetsForAssetReceived, setTradableAssetsForAssetReceived] = useState<AssetWithTicker[]>([]);
  const [trades, setTrades] = useState<TDEXTrade[]>([]);
  // selected trade
  const [bestTrade, setBestTrade] = useState<TDEXTrade>();
  // focused input
  const [isFocused, setIsFocused] = useState<'sent' | 'receive'>('sent');
  // errors
  const [errorSent, setErrorSent] = useState('');
  const [errorReceived, setErrorReceived] = useState('');
  const [needReset, setNeedReset] = useState<boolean>(false);
  //
  const [modalOpen, setModalOpen] = useState(false);
  const [isBusyMakingTrade, setIsBusyMakingTrade] = useState(false);
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);
  const [showNoProvidersAvailableAlert, dismissNoProvidersAvailableAlert] = useIonAlert();

  useIonViewWillEnter(() => {
    if (markets.length === 0) {
      openNoProvidersAvailableAlert();
    }
    setAssetSent({
      asset: LBTC_ASSET[network].assetHash,
      ticker: LBTC_ASSET[network].ticker,
    });
    setSentAmount(undefined);
    setReceivedAmount(undefined);
  }, [balances, markets]);

  const openNoProvidersAvailableAlert = () => {
    showNoProvidersAvailableAlert({
      header: 'No providers available',
      message: 'Liquidity providers on Tor network can take a long time to respond or all your providers are offline.',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Go To Wallet',
          handler: () => {
            dismissNoProvidersAvailableAlert()
              .then(() => {
                history.replace('/wallet');
              })
              .catch(console.error);
          },
        },
        {
          text: 'Retry',
          handler: () => {
            dispatch(updateMarkets());
            if (markets.length === 0 || bestTrade === undefined) {
              dismissNoProvidersAvailableAlert().then(() => {
                openNoProvidersAvailableAlert();
              });
            }
          },
        },
      ],
    }).catch(console.error);
  };

  useEffect(() => {
    if (markets.length === 0 || !assetSent || !assetReceived) return;
    setTrades(allTrades(markets, assetSent.asset, assetReceived.asset));
  }, [assetSent?.asset, assetReceived?.asset, markets, assetSent, assetReceived]);

  useEffect(() => {
    if (!assetSent) return;
    const sentTradables = getTradablesAssets(markets, assetSent.asset, network);
    // TODO: Add opposite asset and remove current
    setTradableAssetsForAssetReceived(sentTradables);
    setAssetReceived(sentTradables[0]);
  }, [assetSent, assetSent?.asset, markets, network]);

  useEffect(() => {
    if (assetReceived) {
      const receivedTradables = getTradablesAssets(markets, assetReceived.asset, network);
      // TODO: Add opposite asset and remove current
      setTradableAssetsForAssetSent(receivedTradables);
    }
  }, [assetReceived, assetReceived?.asset, markets, network]);

  const checkAvailableAmountSent = () => {
    if (!bestTrade || !sentAmount || !assetSent) return;
    const availableAmount =
      bestTrade.type === TradeType.BUY ? bestTrade.market.quoteAmount : bestTrade.market.baseAmount;
    const sats = toSatoshi(
      sentAmount,
      assets[assetSent.asset]?.precision ?? defaultPrecision,
      isLbtcTicker(assetSent.ticker) ? lbtcUnit : undefined
    );
    if (!hasBeenSwapped && availableAmount && sats.greaterThan(availableAmount)) {
      setErrorSent(ERROR_LIQUIDITY);
      return;
    }
    setErrorSent('');
  };

  const checkAvailableAmountReceived = () => {
    if (!bestTrade || !receivedAmount || !assetReceived) return;
    const availableAmount =
      bestTrade.type === TradeType.BUY ? bestTrade.market.baseAmount : bestTrade.market.quoteAmount;
    const sats = toSatoshi(
      receivedAmount,
      assets[assetReceived.asset]?.precision ?? defaultPrecision,
      isLbtcTicker(assetReceived.ticker) ? lbtcUnit : undefined
    );
    if (!hasBeenSwapped && availableAmount && sats.greaterThan(availableAmount)) {
      setErrorReceived(ERROR_LIQUIDITY);
      return;
    }
    setErrorReceived('');
    // Reset hasBeenSwapped
    setHasBeenSwapped(false);
  };

  const sentAmountGreaterThanBalance = () => {
    const balance = balances.find((b) => b.asset === assetSent?.asset);
    if (!balance || !sentAmount) return true;
    const amountAsSats = toSatoshi(sentAmount, balance.precision, isLbtcTicker(balance.ticker) ? lbtcUnit : undefined);
    return amountAsSats.greaterThan(balance.amount);
  };

  const onConfirm = () => setModalOpen(true);

  // make and broadcast trade, then push to trade summary page
  const onPinConfirm = async (pin: string) => {
    if (!assetSent || !bestTrade || !sentAmount) return;
    try {
      setModalOpen(false);
      setIsBusyMakingTrade(true);
      let identity;
      try {
        const toRestore = await getConnectedTDexMnemonic(pin, dispatch, network);
        identity = (await mnemonicRestorerFromState(toRestore)(lastUsedIndexes)) as TDexMnemonicRedux;
        setIsWrongPin(false);
        setTimeout(() => {
          setIsWrongPin(null);
          setNeedReset(true);
        }, PIN_TIMEOUT_SUCCESS);
      } catch (_) {
        throw IncorrectPINError;
      }
      const txid = await makeTrade(
        bestTrade,
        {
          amount: toSatoshi(
            sentAmount,
            assets[assetSent.asset]?.precision ?? defaultPrecision,
            isLbtc(assetSent.asset, network) ? lbtcUnit : undefined
          ).toNumber(),
          asset: assetSent.asset,
        },
        explorerLiquidAPI,
        utxos,
        identity,
        customCoinSelector(dispatch),
        torProxy
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
      setIsWrongPin(true);
      setTimeout(() => {
        setIsWrongPin(null);
        setNeedReset(true);
      }, PIN_TIMEOUT_FAILURE);
      if (e instanceof AppError) {
        dispatch(addErrorToast(e));
      }
    } finally {
      setIsBusyMakingTrade(false);
    }
  };

  const swapAssetsAndAmounts = () => {
    setHasBeenSwapped(true);
    setAssetSent(assetReceived);
    setAssetReceived(assetSent);
    setSentAmount(receivedAmount);
    setReceivedAmount(sentAmount);
  };

  return (
    <>
      <IonPage id="exchange-page">
        <Loader showLoading={isBusyMakingTrade} delay={0} />
        {/* Check location because screens are always loaded on Ionic */}
        {/* Otherwise, loaders will show up on the other screens */}
        {history.location.pathname === '/exchange' && (
          <Loader
            showLoading={isFetchingMarkets}
            message="Discovering TDEX providers with best liquidity..."
            delay={0}
            backdropDismiss={true}
            duration={15000}
            onDidDismiss={() => {
              if (markets.length === 0 || bestTrade === undefined) {
                openNoProvidersAvailableAlert();
              }
            }}
          />
        )}

        {assetSent && assetReceived && markets.length > 0 && (
          <PinModal
            open={modalOpen}
            title="Unlock your seed"
            description={`Enter your secret PIN to send ${sentAmount} ${
              isLbtc(assetSent.asset, network) ? lbtcUnit : assetSent.ticker
            } and receive ${receivedAmount} ${isLbtc(assetReceived.asset, network) ? lbtcUnit : assetReceived.ticker}.`}
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
                  <IonButton className="custom-right-button" onClick={() => history.push('/history')}>
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
                setTrade={(t: TDEXTrade) => setBestTrade(t)}
                relatedAssetAmount={receivedAmount || ''}
                relatedAssetHash={assetReceived?.asset || ''}
                asset={assetSent}
                assetAmount={sentAmount}
                trades={trades}
                trade={bestTrade}
                onChangeAmount={(newAmount: string) => {
                  setSentAmount(newAmount);
                  checkAvailableAmountSent();
                }}
                assetsWithTicker={tradableAssetsForAssetSent}
                setAsset={(asset) => {
                  if (assetReceived && asset.asset === assetReceived.asset) setAssetReceived(assetSent);
                  setAssetSent(asset);
                }}
                error={errorSent}
                setError={setErrorSent}
                setOtherInputError={setErrorReceived}
                isLoading={isBusyMakingTrade}
                torProxy={torProxy}
                network={network}
              />

              <div className="exchange-divider ion-activatable" onClick={swapAssetsAndAmounts}>
                <img src={swap} alt="swap" />
                <IonRippleEffect type="unbounded" />
              </div>

              {assetReceived && (
                <ExchangeRow
                  sendInput={false}
                  focused={isFocused === 'receive'}
                  setFocus={() => setIsFocused('receive')}
                  setTrade={(t: TDEXTrade) => setBestTrade(t)}
                  trades={trades}
                  trade={bestTrade}
                  relatedAssetAmount={sentAmount || ''}
                  relatedAssetHash={assetSent?.asset || ''}
                  asset={assetReceived}
                  assetAmount={receivedAmount}
                  onChangeAmount={(newAmount: string) => {
                    setReceivedAmount(newAmount);
                    checkAvailableAmountReceived();
                  }}
                  assetsWithTicker={tradableAssetsForAssetReceived}
                  setAsset={(asset) => {
                    if (asset.asset === assetSent.asset) setAssetSent(assetReceived);
                    setAssetReceived(asset);
                  }}
                  error={errorReceived}
                  setError={setErrorReceived}
                  setOtherInputError={setErrorSent}
                  isLoading={isBusyMakingTrade}
                  torProxy={torProxy}
                  network={network}
                />
              )}

              <IonRow>
                <IonCol size="8.5" offset="1.75">
                  <IonButton
                    className={classNames('main-button', {
                      'button-disabled':
                        !assetSent || !assetReceived || isBusyMakingTrade || sentAmountGreaterThanBalance(),
                    })}
                    data-cy="exchange-confirm-btn"
                    disabled={!assetSent || !assetReceived || isBusyMakingTrade || sentAmountGreaterThanBalance()}
                    onClick={onConfirm}
                  >
                    CONFIRM
                  </IonButton>
                </IonCol>
              </IonRow>

              {bestTrade && (
                <IonRow className="market-provider ion-margin-vertical-x2 ion-text-center">
                  <IonCol size="10" offset="1">
                    <IonText className="trade-info" color="light">
                      Market provided by:{' '}
                      <span className="provider-info">
                        {` ${bestTrade.market.provider.name} - ${bestTrade.market.provider.endpoint}`}
                      </span>
                    </IonText>
                  </IonCol>
                </IonRow>
              )}
            </IonGrid>
          </IonContent>
        )}
      </IonPage>
    </>
  );
};
export default Exchange;
