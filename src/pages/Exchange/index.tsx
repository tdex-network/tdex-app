import './style.scss';
import {
  IonContent,
  IonPage,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonChip,
  IonLabel,
  IonIcon,
  IonAlert,
  IonSpinner,
} from '@ionic/react';
import { Buffer } from 'buffer';
import classNames from 'classnames';
import { closeOutline } from 'ionicons/icons';
import React, { useCallback, useEffect, useState } from 'react';
import type { RouteComponentProps } from 'react-router';

import type { UnblindedInput } from '../../api-spec/protobuf/gen/js/tdex/v2/types_pb';
import tradeHistory from '../../assets/img/trade-history.svg';
import Header from '../../components/Header';
import Loader from '../../components/Loader';
import PinModal from '../../components/PinModal';
import Refresher from '../../components/Refresher';
import type { TdexOrderInputResult } from '../../components/TdexOrderInput';
import { TdexOrderInput } from '../../components/TdexOrderInput';
import { useTradeState } from '../../components/TdexOrderInput/hooks';
import { routerLinks } from '../../routes';
import { SignerService } from '../../services/signerService';
import { getTradablesAssets, makeTradeV1, makeTradeV2 } from '../../services/tdexService';
import type {
  TDEXMarket as TDEXMarketV1,
  TDEXProvider,
  TradeOrder as TradeOrderV1,
} from '../../services/tdexService/v1/tradeCore';
import type { TDEXMarket as TDEXMarketV2, TradeOrder as TradeOrderV2 } from '../../services/tdexService/v2/tradeCore';
import { useAppStore } from '../../store/appStore';
import { useAssetStore } from '../../store/assetStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useTdexStore } from '../../store/tdexStore';
import { useToastStore } from '../../store/toastStore';
import type { CoinSelectionForTrade } from '../../store/walletStore';
import { useWalletStore } from '../../store/walletStore';
import { defaultPrecision, PIN_TIMEOUT_FAILURE } from '../../utils/constants';
import { AppError, NoMarketsAvailableForSelectedPairError, NoOtherProvider } from '../../utils/errors';
import { isLbtc, isLbtcTicker, outpointToString } from '../../utils/helpers';
import { createAmountAndUnit, fromSatoshi, toSatoshi } from '../../utils/unitConversion';
import type { PreviewData } from '../TradeSummary';

import ExchangeErrorModal from './ExchangeErrorModal';

export const Exchange: React.FC<RouteComponentProps> = ({ history }) => {
  const isFetchingMarkets = useAppStore((state) => state.isFetchingMarkets);
  const explorerLiquidAPI = useSettingsStore((state) => state.explorerLiquidAPI);
  const network = useSettingsStore((state) => state.network);
  const torProxy = useSettingsStore((state) => state.torProxy);
  const getProtoVersion = useTdexStore((state) => state.getProtoVersion);
  const markets = useTdexStore((state) => state.markets);
  const providers = useTdexStore((state) => state.providers);
  const refetchTdexProvidersAndMarkets = useTdexStore((state) => state.refetchTdexProvidersAndMarkets);
  const addErrorToast = useToastStore((state) => state.addErrorToast);
  const addSuccessToast = useToastStore((state) => state.addSuccessToast);
  const masterBlindingKey = useWalletStore((state) => state.masterBlindingKey);
  const unlockOutpoints = useWalletStore((state) => state.unlockOutpoints);
  //
  const [tdexOrderInputResult, setTdexOrderInputResult] = useState<TdexOrderInputResult>();
  const [excludedProviders, setExcludedProviders] = useState<TDEXProvider[]>([]);
  const [showExcludedProvidersAlert, setShowExcludedProvidersAlert] = useState(false);
  const [tradeError, setTradeError] = useState<AppError | Error>();

  const getPinModalDescription = () => {
    if (!tdexOrderInputResult) return 'Trade preview error';
    const assets = useAssetStore.getState().assets;
    const lbtcUnit = useSettingsStore.getState().lbtcUnit;
    const tradeFeeAmount = fromSatoshi(
      tradeFeeSats ?? 0,
      assets[tdexOrderInputResult?.order.market.quoteAsset]?.precision ?? defaultPrecision,
      isLbtcTicker(assets[tdexOrderInputResult?.order.market.quoteAsset]?.ticker) ? lbtcUnit : undefined
    );
    return `Enter your secret PIN to send ${tdexOrderInputResult?.send.amount} ${tdexOrderInputResult?.send.unit} and
          receive ${Number(tdexOrderInputResult?.receive.amount ?? 0) - tradeFeeAmount} ${
      tdexOrderInputResult?.receive.unit
    }
    ${
      tdexOrderInputResult.providerVersion === 'v2'
        ? `(${tdexOrderInputResult?.receive.amount} ${tdexOrderInputResult?.receive.unit} minus ${tradeFeeAmount} ${tdexOrderInputResult?.receive.unit} of trading fees)`
        : ''
    }`;
  };

  const getProviderName = (endpoint: string) => {
    return (
      markets.v1.find((m) => m.provider.endpoint === endpoint)?.provider.name ||
      markets.v2.find((m) => m.provider.endpoint === endpoint)?.provider.name
    );
  };

  // confirm flow
  const [needReset, setNeedReset] = useState<boolean>(false);
  const [PINModalOpen, setPINModalOpen] = useState(false);
  const [isBusyMakingTrade, setIsBusyMakingTrade] = useState(false);
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);

  const isSameProviderEndpoint = (provider: TDEXProvider) =>
    function (market: TDEXMarketV1 | TDEXMarketV2) {
      return market.provider.endpoint === provider.endpoint;
    };

  const withoutProviders = useCallback(
    (...providers: TDEXProvider[]) =>
      (market: TDEXMarketV1 | TDEXMarketV2) => {
        const isSameProviderFns = providers.map(isSameProviderEndpoint);
        for (const fn of isSameProviderFns) {
          if (fn(market)) return false;
        }
        return true;
      },
    []
  );

  const getAllMarketsFromNotExcludedProviders = useCallback(
    () => ({
      v1: markets.v1.filter(withoutProviders(...excludedProviders)),
      v2: markets.v2.filter(withoutProviders(...excludedProviders)),
    }),
    [excludedProviders, markets.v1, markets.v2, withoutProviders]
  );

  const getAllMarketsFromNotExcludedProvidersAndOnlySelectedPair = (
    providerToBan: TDEXProvider
  ): (TDEXMarketV1 | TDEXMarketV2)[] => {
    return [
      ...markets.v1
        .filter(withoutProviders(...[...excludedProviders, providerToBan]))
        .filter(
          (m) =>
            (m.baseAsset === sendAsset || m.baseAsset === receiveAsset) &&
            (m.quoteAsset === sendAsset || m.quoteAsset === receiveAsset)
        ),
      ...markets.v2
        .filter(withoutProviders(...[...excludedProviders, providerToBan]))
        .filter(
          (m) =>
            (m.baseAsset === sendAsset || m.baseAsset === receiveAsset) &&
            (m.quoteAsset === sendAsset || m.quoteAsset === receiveAsset)
        ),
    ];
  };

  const getAllProvidersExceptExcluded = () =>
    providers.filter((p) => !excludedProviders.map((p) => p.endpoint).includes(p.endpoint));

  const [showNoProvidersAvailableAlert, setShowNoProvidersAvailableAlert] = useState<boolean>(
    !!getAllMarketsFromNotExcludedProviders().v1.length && !!getAllMarketsFromNotExcludedProviders().v2.length
  );

  useEffect(() => {
    if (
      getAllMarketsFromNotExcludedProviders().v1.length > 0 ||
      getAllMarketsFromNotExcludedProviders().v2.length > 0
    ) {
      setShowNoProvidersAvailableAlert(false);
    } else {
      setShowNoProvidersAvailableAlert(true);
    }
  }, [getAllMarketsFromNotExcludedProviders]);

  const [
    bestOrder,
    sendAsset,
    sendSats,
    receiveAsset,
    receiveSats,
    setReceiveAsset,
    setSendAsset,
    setSendAmount,
    setReceiveAmount,
    setSendLoader,
    sendLoader,
    setReceiveLoader,
    receiveLoader,
    sendError,
    receiveError,
    setFocus,
    swapAssets,
    setHasBeenSwapped,
    setSendAssetHasChanged,
    setReceiveAssetHasChanged,
    tradeFeeSats,
  ] = useTradeState(getAllMarketsFromNotExcludedProviders());

  const handleSuccess = async (txid: string) => {
    if (!tdexOrderInputResult) return;
    // Persist trade addresses
    await useWalletStore.getState().getNextAddress(false);
    await useWalletStore.getState().getNextAddress(true);
    addSuccessToast('Trade successfully computed');
    const sendAmountAndUnit = createAmountAndUnit({
      sats: tdexOrderInputResult.send.sats,
      asset: tdexOrderInputResult.send.asset,
    });
    const receiveAmountAndUnit = createAmountAndUnit({
      sats: (tdexOrderInputResult.receive.sats ?? 0) - (tradeFeeSats ?? 0),
      asset: tdexOrderInputResult.receive.asset,
    });
    const preview: PreviewData = {
      sent: {
        asset: tdexOrderInputResult.send.asset ?? '',
        ticker: sendAmountAndUnit.unit || 'unknown',
        amount: `-${sendAmountAndUnit.amount || '??'}`,
      },
      received: {
        asset: tdexOrderInputResult.receive.asset ?? '',
        ticker: receiveAmountAndUnit.unit || 'unknown',
        amount: receiveAmountAndUnit.amount || '??',
      },
    };
    history.replace(`/tradesummary/${txid}`, { preview });
  };

  // make and broadcast trade, then push to trade summary page
  const onPinConfirm = async (pin: string) => {
    setPINModalOpen(false);
    if (!tdexOrderInputResult) {
      console.error('tdexOrderInputResult is missing');
      return;
    }
    setIsBusyMakingTrade(true);
    try {
      const assets = useAssetStore.getState().assets;
      const lbtcUnit = useSettingsStore.getState().lbtcUnit;
      const signer = await SignerService.fromPassword(pin);
      if (!tdexOrderInputResult.send.asset) {
        throw new Error('No send asset');
      }
      const { utxos, changeOutputs } = await useWalletStore.getState().selectUtxos(
        [
          {
            address: '',
            value: toSatoshi(
              Number(tdexOrderInputResult.send.amount),
              assets[tdexOrderInputResult.send.asset].precision ?? 8,
              isLbtc(tdexOrderInputResult.send.asset, network) ? lbtcUnit : undefined
            ),
            asset: tdexOrderInputResult.send.asset,
          },
        ],
        true
      );
      let witnessUtxos: CoinSelectionForTrade['witnessUtxos'] = {};
      for (const utxo of utxos) {
        const witnessUtxo = await useWalletStore.getState().getWitnessUtxo(utxo.txid, utxo.vout);
        if (witnessUtxo) {
          witnessUtxos[
            outpointToString({
              txid: utxo.txid,
              vout: utxo.vout,
            })
          ] = witnessUtxo;
        }
      }
      const unblindedWitnessUtxos = await useWalletStore.getState().unblindUtxos(Object.values(witnessUtxos));
      const unblindedInputs = unblindedWitnessUtxos
        .map((input, index) => {
          if (!(input instanceof Error)) {
            return {
              index: index,
              asset: input.asset,
              amount: input.value.toString(),
              assetBlinder: Buffer.from(input.assetBlindingFactor, 'hex').reverse().toString('hex'),
              amountBlinder: Buffer.from(input.valueBlindingFactor, 'hex').reverse().toString('hex'),
            };
          }
          return undefined;
        })
        .filter((input): input is UnblindedInput => !!input);
      const coinSelectionForTrade: CoinSelectionForTrade = {
        witnessUtxos,
        changeOutputs,
        unblindedInputs,
      };

      // Dry run address generation
      const addressForChangeOutput = await useWalletStore.getState().getNextAddress(true, true);
      if (!addressForChangeOutput.confidentialAddress) throw new Error('No address for change');
      const addressForSwapOutput = await useWalletStore.getState().getNextAddress(false, true);
      if (!addressForSwapOutput.confidentialAddress) throw new Error('No address for output');

      // propose and complete tdex trade
      // broadcast via liquid explorer
      let txid;
      const version = await getProtoVersion(tdexOrderInputResult.order.traderClient.providerUrl);
      if (version === 'v1') {
        txid = await makeTradeV1(
          tdexOrderInputResult?.order as TradeOrderV1,
          { amount: tdexOrderInputResult?.send.sats ?? 0, asset: tdexOrderInputResult?.send.asset ?? '' },
          explorerLiquidAPI,
          coinSelectionForTrade,
          signer,
          masterBlindingKey,
          network,
          addressForChangeOutput,
          addressForSwapOutput,
          torProxy
        );
      } else {
        txid = await makeTradeV2(
          tdexOrderInputResult?.order as TradeOrderV2,
          { amount: tdexOrderInputResult?.send.sats ?? 0, asset: tdexOrderInputResult?.send.asset ?? '' },
          explorerLiquidAPI,
          coinSelectionForTrade,
          signer,
          masterBlindingKey,
          network,
          addressForChangeOutput,
          addressForSwapOutput,
          torProxy
        );
      }
      await handleSuccess(txid);
    } catch (err) {
      console.error(err);
      setIsWrongPin(true);
      setTimeout(() => {
        setIsWrongPin(null);
        setNeedReset(true);
      }, PIN_TIMEOUT_FAILURE);
      if (err instanceof AppError || err instanceof Error) {
        setTradeError(err);
      }
      await unlockOutpoints();
    } finally {
      setIsBusyMakingTrade(false);
    }
  };

  const onClickTryNext = (providerToBan: TDEXProvider) => {
    if (getAllProvidersExceptExcluded().length > 1) {
      if (!excludedProviders.map((p) => p.endpoint).includes(providerToBan.endpoint)) {
        setExcludedProviders([...excludedProviders, providerToBan]);
        setTdexOrderInputResult(undefined);
      }
      if (getAllMarketsFromNotExcludedProvidersAndOnlySelectedPair(providerToBan).length === 0) {
        addErrorToast(NoMarketsAvailableForSelectedPairError);
        // Set next possible trading pair
        setSendLoader(false);
        setReceiveLoader(false);
        setSendAmount(0).catch(console.error);
        setReceiveAmount(0).catch(console.error);
        const tradableAssets = getTradablesAssets(markets, sendAsset || '').filter((t) => t !== receiveAsset);
        if (tradableAssets.length > 0) {
          setSendAsset(sendAsset);
          setReceiveAsset(tradableAssets[0]);
        } else {
          const tradableAssets = getTradablesAssets(markets, receiveAsset || '').filter((t) => t !== sendAsset);
          setSendAsset(receiveAsset);
          setReceiveAsset(tradableAssets[0]);
        }
      }
    } else {
      addErrorToast(NoOtherProvider);
    }
  };

  return (
    <IonPage id="exchange-page">
      <Loader showLoading={isBusyMakingTrade} delay={0} />
      <Loader
        showLoading={
          history.location.pathname === routerLinks.exchange &&
          isFetchingMarkets &&
          !isBusyMakingTrade &&
          !tradeError &&
          getAllProvidersExceptExcluded().length > 0 &&
          // At least one market is available, otherwise we display NoProvidersAvailableAlert
          (markets.v1.length > 0 || markets.v2.length > 0)
        }
        message="Discovering TDEX providers with best liquidity..."
        delay={0}
        backdropDismiss={true}
        duration={15000}
        onDidDismiss={() => {
          if (
            providers.length === 0 ||
            (getAllMarketsFromNotExcludedProviders().v1.length === 0 &&
              getAllMarketsFromNotExcludedProviders().v2.length === 0)
          )
            setShowNoProvidersAvailableAlert(true);
        }}
      />
      <ExchangeErrorModal
        result={tdexOrderInputResult}
        error={tradeError}
        onClose={() => setTradeError(undefined)}
        onClickRetry={() => tdexOrderInputResult !== undefined && setPINModalOpen(true)}
        onClickTryNext={onClickTryNext}
      />
      <PinModal
        open={tdexOrderInputResult !== undefined && PINModalOpen}
        title="Unlock your seed"
        description={getPinModalDescription()}
        onConfirm={onPinConfirm}
        onClose={() => {
          setPINModalOpen(false);
        }}
        isWrongPin={isWrongPin}
        needReset={needReset}
        setNeedReset={setNeedReset}
        setIsWrongPin={setIsWrongPin}
      />
      <IonAlert
        isOpen={showNoProvidersAvailableAlert && history.location.pathname === routerLinks.exchange}
        header="No providers available"
        message="Liquidity providers on Tor network can take a long time to respond or all your providers are offline."
        backdropDismiss={false}
        buttons={[
          {
            text: 'Go To Wallet',
            handler: () => {
              history.replace(routerLinks.wallet);
            },
          },
          {
            text: 'Retry',
            handler: async () => {
              await refetchTdexProvidersAndMarkets();
              // false then true to trigger rerender if already true
              setShowNoProvidersAvailableAlert(false);
              setShowNoProvidersAvailableAlert(true);
            },
          },
        ]}
      />

      {(getAllMarketsFromNotExcludedProviders().v1.length > 0 ||
        getAllMarketsFromNotExcludedProviders().v2.length > 0) && (
        <IonContent className="exchange-content">
          <Refresher />
          <IonGrid className="ion-no-padding">
            <Header
              className="ion-padding-top"
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
            <IonRow className="ion-align-items-start ion-bg-color-primary">
              <IonAlert
                isOpen={showExcludedProvidersAlert}
                onDidDismiss={() => setShowExcludedProvidersAlert(false)}
                header={'Providers excluded'}
                message={excludedProviders.reduce((acc, p) => acc + `- ${p.name} - <br> ${p.endpoint} <br><br>`, '')}
                buttons={[
                  'OK',
                  {
                    text: 'clear',
                    handler: () => setExcludedProviders([]),
                  },
                ]}
              />

              {excludedProviders.length > 0 && (
                <IonCol className="ion-padding-start">
                  <IonChip outline color="danger">
                    <IonLabel onClick={() => setShowExcludedProvidersAlert(true)}>
                      {excludedProviders.length} providers excluded
                    </IonLabel>
                    <IonIcon onClick={() => setExcludedProviders([])} icon={closeOutline} />
                  </IonChip>
                </IonCol>
              )}
            </IonRow>

            <IonRow className="ion-align-items-start">
              <IonCol>
                <TdexOrderInput
                  onInput={setTdexOrderInputResult}
                  markets={getAllMarketsFromNotExcludedProviders()}
                  bestOrder={bestOrder}
                  sendAsset={sendAsset}
                  sendSats={sendSats}
                  receiveAsset={receiveAsset}
                  receiveSats={receiveSats}
                  setReceiveAsset={setReceiveAsset}
                  setSendAsset={setSendAsset}
                  setSendAmount={setSendAmount}
                  setReceiveAmount={setReceiveAmount}
                  sendLoader={sendLoader}
                  receiveLoader={receiveLoader}
                  sendError={sendError}
                  receiveError={receiveError}
                  setFocus={setFocus}
                  swapAssets={swapAssets}
                  setHasBeenSwapped={setHasBeenSwapped}
                  setSendAssetHasChanged={setSendAssetHasChanged}
                  setReceiveAssetHasChanged={setReceiveAssetHasChanged}
                />
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol size="8.5" offset="1.75">
                <IonButton
                  className={classNames('main-button', {
                    'button-disabled': tdexOrderInputResult === undefined,
                  })}
                  data-testid="exchange-confirm-btn"
                  disabled={
                    tdexOrderInputResult === undefined ||
                    sendSats === 0 ||
                    receiveSats === 0 ||
                    sendLoader ||
                    receiveLoader
                  }
                  onClick={async () => {
                    setPINModalOpen(true);
                  }}
                >
                  CONFIRM
                </IonButton>
              </IonCol>
            </IonRow>

            {tdexOrderInputResult?.order.market && tdexOrderInputResult.order.traderClient && sendSats !== 0 && (
              <IonRow className="market-provider ion-margin-vertical-x2 ion-text-center">
                <IonCol size="10" offset="1">
                  <IonText className="trade-info" color="light">
                    Market provided by:{' '}
                    {sendLoader || receiveLoader || !tdexOrderInputResult ? (
                      <IonSpinner name="dots" className="vertical-middle" />
                    ) : (
                      <span className="provider-info">
                        {`${getProviderName(tdexOrderInputResult.order.market.provider.endpoint)} - ${
                          tdexOrderInputResult.order.traderClient.providerUrl
                        }`}
                      </span>
                    )}
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
