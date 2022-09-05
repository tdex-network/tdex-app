import './style.scss';
import {
  IonAlert,
  IonButton,
  IonChip,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonLabel,
  IonPage,
  IonRow,
  IonSpinner,
  IonText,
} from '@ionic/react';
import classNames from 'classnames';
import { closeOutline } from 'ionicons/icons';
import type { StateRestorerOpts } from 'ldk';
import { mnemonicRestorerFromState } from 'ldk';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import type { RouteComponentProps } from 'react-router';
import type { NetworkString, UnblindedOutput } from 'tdex-sdk';

import tradeHistory from '../../assets/img/trade-history.svg';
import Header from '../../components/Header';
import Loader from '../../components/Loader';
import PinModal from '../../components/PinModal';
import Refresher from '../../components/Refresher';
import type { TdexOrderInputResult } from '../../components/TdexOrderInput';
import TdexOrderInput from '../../components/TdexOrderInput';
import { useTradeState } from '../../components/TdexOrderInput/hooks';
import type { TDEXMarket, TDEXProvider } from '../../redux/actionTypes/tdexActionTypes';
import type { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import { setIsFetchingUtxos } from '../../redux/actions/appActions';
import { updateMarkets } from '../../redux/actions/tdexActions';
import { addErrorToast, addSuccessToast } from '../../redux/actions/toastActions';
import { watchTransaction } from '../../redux/actions/transactionsActions';
import { unlockUtxos, updateUtxos } from '../../redux/actions/walletActions';
import { useTypedDispatch } from '../../redux/hooks';
import { balancesSelector, lastUsedIndexesSelector, unlockedUtxosSelector } from '../../redux/reducers/walletReducer';
import type { RootState } from '../../redux/types';
import { routerLinks } from '../../routes';
import { PIN_TIMEOUT_FAILURE, PIN_TIMEOUT_SUCCESS } from '../../utils/constants';
import {
  AppError,
  IncorrectPINError,
  NoMarketsAvailableForSelectedPairError,
  NoOtherProvider,
} from '../../utils/errors';
import { customCoinSelector } from '../../utils/helpers';
import { getConnectedTDexMnemonic } from '../../utils/storage-helper';
import { getTradablesAssets, makeTrade } from '../../utils/tdex';
import type { PreviewData } from '../TradeSummary';

import ExchangeErrorModal from './ExchangeErrorModal';

export interface ExchangeConnectedProps {
  balances: BalanceInterface[];
  explorerLiquidAPI: string;
  isFetchingMarkets: boolean;
  lastUsedIndexes: StateRestorerOpts;
  markets: TDEXMarket[];
  network: NetworkString;
  providers: TDEXProvider[];
  torProxy: string;
  utxos: UnblindedOutput[];
}

type Props = RouteComponentProps & ExchangeConnectedProps;

const Exchange: React.FC<Props> = ({
  balances,
  explorerLiquidAPI,
  history,
  isFetchingMarkets,
  lastUsedIndexes,
  markets,
  network,
  providers,
  torProxy,
  utxos,
}) => {
  const dispatch = useTypedDispatch();
  const [tdexOrderInputResult, setTdexOrderInputResult] = useState<TdexOrderInputResult>();
  const [excludedProviders, setExcludedProviders] = useState<TDEXProvider[]>([]);
  const [showExcludedProvidersAlert, setShowExcludedProvidersAlert] = useState(false);
  const [tradeError, setTradeError] = useState<AppError>();
  const { t } = useTranslation();

  const getPinModalDescription = () =>
    t('exchange.pinModalUnlock.desc', {
      sendAmount: tdexOrderInputResult?.send.amount,
      sendUnit: tdexOrderInputResult?.send.unit,
      receiveAmount: tdexOrderInputResult?.receive.amount,
      receiveUnit: tdexOrderInputResult?.receive.unit,
    });

  const getProviderName = (endpoint: string) => markets.find((m) => m.provider.endpoint === endpoint)?.provider.name;

  // confirm flow
  const [needReset, setNeedReset] = useState<boolean>(false);
  const [PINModalOpen, setPINModalOpen] = useState(false);
  const [isBusyMakingTrade, setIsBusyMakingTrade] = useState(false);
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);

  const isSameProviderEndpoint = (provider: TDEXProvider) =>
    function (market: TDEXMarket) {
      return market.provider.endpoint === provider.endpoint;
    };

  const withoutProviders = (...providers: TDEXProvider[]) =>
    function (market: TDEXMarket) {
      const isSameProviderFns = providers.map(isSameProviderEndpoint);
      for (const fn of isSameProviderFns) {
        if (fn(market)) return false;
      }
      return true;
    };

  const getAllMarketsFromNotExcludedProviders = useCallback(
    () => markets.filter(withoutProviders(...excludedProviders)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [markets]
  );

  const getAllMarketsFromNotExcludedProvidersAndOnlySelectedPair = (providerToBan: TDEXProvider) => {
    return markets
      .filter(withoutProviders(...[...excludedProviders, providerToBan]))
      .filter(
        (m) =>
          (m.baseAsset === sendAsset || m.baseAsset === receiveAsset) &&
          (m.quoteAsset === sendAsset || m.quoteAsset === receiveAsset)
      );
  };

  const getAllProvidersExceptExcluded = () =>
    providers.filter((p) => !excludedProviders.map((p) => p.endpoint).includes(p.endpoint));

  const [showNoProvidersAvailableAlert, setShowNoProvidersAvailableAlert] = useState<boolean>(
    !!getAllMarketsFromNotExcludedProviders().length
  );

  useEffect(() => {
    if (getAllMarketsFromNotExcludedProviders().length > 0) {
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
  ] = useTradeState(getAllMarketsFromNotExcludedProviders(), balances);

  const getIdentity = async (pin: string) => {
    try {
      const toRestore = await getConnectedTDexMnemonic(pin, dispatch, network);
      setIsWrongPin(false);
      setTimeout(() => {
        setIsWrongPin(null);
        setNeedReset(true);
      }, PIN_TIMEOUT_SUCCESS);
      return mnemonicRestorerFromState(toRestore)(lastUsedIndexes);
    } catch {
      throw IncorrectPINError;
    }
  };

  const handleSuccess = (txid: string) => {
    dispatch(watchTransaction(txid));
    // Trigger spinner right away
    dispatch(setIsFetchingUtxos(true));
    // But update after a few seconds to make sure new utxo is ready to fetch
    setTimeout(() => dispatch(updateUtxos()), 12_000);
    addSuccessToast('Trade successfully computed');
    const preview: PreviewData = {
      sent: {
        asset: tdexOrderInputResult?.send.asset ?? '',
        ticker: tdexOrderInputResult?.send.unit || 'unknown',
        amount: `-${tdexOrderInputResult?.send.amount || '??'}`,
      },
      received: {
        asset: tdexOrderInputResult?.receive.asset ?? '',
        ticker: tdexOrderInputResult?.receive.unit || 'unknown',
        amount: tdexOrderInputResult?.receive.amount || '??',
      },
    };
    history.replace(`/tradesummary/${txid}`, { preview });
  };

  // make and broadcast trade, then push to trade summary page
  const onPinConfirm = async (pin: string) => {
    setPINModalOpen(false);
    if (!tdexOrderInputResult) return;
    setIsBusyMakingTrade(true);
    try {
      const identity = await getIdentity(pin);
      // propose and complete tdex trade
      // broadcast via liquid explorer
      const txid = await makeTrade(
        tdexOrderInputResult.order,
        { amount: tdexOrderInputResult.send.sats ?? 0, asset: tdexOrderInputResult.send.asset ?? '' },
        identity,
        explorerLiquidAPI,
        utxos,
        customCoinSelector(dispatch),
        torProxy
      );
      handleSuccess(txid);
    } catch (err) {
      dispatch(unlockUtxos());
      setIsWrongPin(true);
      setTimeout(() => {
        setIsWrongPin(null);
        setNeedReset(true);
      }, PIN_TIMEOUT_FAILURE);
      if (err instanceof AppError) {
        setTradeError(err);
      }
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
        dispatch(addErrorToast(NoMarketsAvailableForSelectedPairError));
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
      dispatch(addErrorToast(NoOtherProvider));
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
          markets.length > 0
        }
        message={t('exchange.loaderMsg')}
        delay={0}
        backdropDismiss={true}
        duration={15000}
        onDidDismiss={() => {
          if (providers.length === 0 || getAllMarketsFromNotExcludedProviders().length === 0)
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
        header={t('exchange.noProviderAlert.title')}
        message={t('exchange.noProviderAlert.desc')}
        backdropDismiss={false}
        buttons={[
          {
            text: t('exchange.noProviderAlert.btn1'),
            handler: () => {
              history.replace(routerLinks.wallet);
            },
          },
          {
            text: t('exchange.noProviderAlert.btn2'),
            handler: () => {
              dispatch(updateMarkets());
              // false then true to trigger rerender if already true
              setShowNoProvidersAvailableAlert(false);
              setShowNoProvidersAvailableAlert(true);
            },
          },
        ]}
      />

      {getAllMarketsFromNotExcludedProviders().length > 0 && (
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
              title={t('exchange.pageTitle')}
              isTitleLarge={true}
            />
            <IonRow className="ion-align-items-start ion-bg-color-primary">
              <IonAlert
                isOpen={showExcludedProvidersAlert}
                onDidDismiss={() => setShowExcludedProvidersAlert(false)}
                header={t('exchange.providersExcluded')}
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
                  onClick={() => {
                    setPINModalOpen(true);
                  }}
                >
                  {t('exchange.confirmBtn')}
                </IonButton>
              </IonCol>
            </IonRow>

            {tdexOrderInputResult && sendSats !== 0 && (
              <IonRow className="market-provider ion-margin-vertical-x2 ion-text-center">
                <IonCol size="10" offset="1">
                  <IonText className="trade-info" color="light">
                    {t('exchange.marketProvidedBy')}:{' '}
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

const mapStateToProps = (state: RootState) => {
  return {
    balances: balancesSelector(state),
    explorerLiquidAPI: state.settings.explorerLiquidAPI,
    isFetchingMarkets: state.app.isFetchingMarkets,
    lastUsedIndexes: lastUsedIndexesSelector(state),
    markets: state.tdex.markets,
    network: state.settings.network,
    providers: state.tdex.providers,
    torProxy: state.settings.torProxy,
    utxos: unlockedUtxosSelector(state),
  };
};

export default connect(mapStateToProps)(Exchange);
