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
  useIonAlert,
  useIonViewWillEnter,
} from '@ionic/react';
import classNames from 'classnames';
import { closeOutline } from 'ionicons/icons';
import type { StateRestorerOpts } from 'ldk';
import { mnemonicRestorerFromState } from 'ldk';
import React, { useCallback, useState } from 'react';
import type { RouteComponentProps } from 'react-router';
import type { NetworkString, UnblindedOutput } from 'tdex-sdk';
import { balances } from 'tdex-sdk';

import tradeHistory from '../../assets/img/trade-history.svg';
import Header from '../../components/Header';
import Loader from '../../components/Loader';
import PinModal from '../../components/PinModal';
import Refresher from '../../components/Refresher';
import type { TdexOrderInputResult } from '../../components/TdexOrderInput';
import type { TDEXMarket, TDEXProvider } from '../../redux/actionTypes/tdexActionTypes';
import { setIsFetchingUtxos } from '../../redux/actions/appActions';
import { updateMarkets } from '../../redux/actions/tdexActions';
import { addErrorToast, addSuccessToast } from '../../redux/actions/toastActions';
import { watchTransaction } from '../../redux/actions/transactionsActions';
import { unlockUtxos, updateUtxos } from '../../redux/actions/walletActions';
import TdexOrderInput from '../../redux/containers/tdexOrderInputContainer';
import { useTypedDispatch } from '../../redux/hooks';
import { PIN_TIMEOUT_FAILURE, PIN_TIMEOUT_SUCCESS } from '../../utils/constants';
import { AppError, IncorrectPINError, NoOtherProvider } from '../../utils/errors';
import { customCoinSelector } from '../../utils/helpers';
import { getConnectedTDexMnemonic } from '../../utils/storage-helper';
import { makeTrade } from '../../utils/tdex';
import type { PreviewData } from '../TradeSummary';

import ExchangeErrorModal from './ExchangeErrorModal';

export interface ExchangeConnectedProps {
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
  const [presentNoProvidersAvailableAlert, dismissNoProvidersAvailableAlert] = useIonAlert();

  // Tdex order input
  const [tdexOrderInputResult, setTdexOrderInputResult] = useState<TdexOrderInputResult>();
  const [toFilterProviders, setToFilterProviders] = useState<string[]>([]);
  const [showProvidersAlert, setShowProvidersAlert] = useState(false);
  const [tradeError, setTradeError] = useState<AppError>();

  const getPinModalDescription = () =>
    `Enter your secret PIN to send ${tdexOrderInputResult?.send.amount} ${tdexOrderInputResult?.send.unit} and receive ${tdexOrderInputResult?.receive.amount} ${tdexOrderInputResult?.receive.unit}.`;
  const getProviderName = (endpoint: string) => markets.find((m) => m.provider.endpoint === endpoint)?.provider.name;

  // confirm flow
  const [needReset, setNeedReset] = useState<boolean>(false);
  const [PINModalOpen, setPINModalOpen] = useState(false);
  const [isBusyMakingTrade, setIsBusyMakingTrade] = useState(false);
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);

  const isSameProviderEndpoint = (providerEndpoint: string) =>
    function (market: TDEXMarket) {
      return market.provider.endpoint === providerEndpoint;
    };

  const withoutProviders = useCallback(
    (...endpoints: string[]) =>
      function (market: TDEXMarket) {
        const isSameProviderFns = endpoints.map(isSameProviderEndpoint);
        for (const fn of isSameProviderFns) {
          if (fn(market)) return false;
        }
        return true;
      },
    []
  );

  const getMarkets = useCallback(
    () => markets.filter(withoutProviders(...toFilterProviders)),
    [markets, toFilterProviders, withoutProviders]
  );
  const getProviders = useCallback(
    () => providers.filter((p) => !toFilterProviders.includes(p.endpoint)),
    [providers, toFilterProviders]
  );

  useIonViewWillEnter(() => {
    if (getMarkets().length === 0 || getProviders().length === 0) return openNoProvidersAvailableAlert();
  }, [balances, getMarkets, getProviders]);

  const openNoProvidersAvailableAlert = () => {
    if (history.location.pathname === '/exchange') {
      presentNoProvidersAvailableAlert({
        header: 'No providers available',
        message:
          'Liquidity providers on Tor network can take a long time to respond or all your providers are offline.',
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
              if (getMarkets().length === 0 || tdexOrderInputResult === undefined) {
                dismissNoProvidersAvailableAlert().then(() => {
                  openNoProvidersAvailableAlert();
                });
              }
            },
          },
        ],
      }).catch(console.error);
    }
  };

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
        ticker: tdexOrderInputResult?.send.unit || 'unknown',
        amount: `-${tdexOrderInputResult?.send.amount || '??'}`,
      },
      received: {
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
    } catch (e) {
      dispatch(unlockUtxos());
      setIsWrongPin(true);
      setTimeout(() => {
        setIsWrongPin(null);
        setNeedReset(true);
      }, PIN_TIMEOUT_FAILURE);
      if (e instanceof AppError) {
        setTradeError(e);
        dispatch(addErrorToast(e));
      }
    } finally {
      setIsBusyMakingTrade(false);
    }
  };

  return (
    <IonPage id="exchange-page">
      <Loader showLoading={isBusyMakingTrade} delay={0} />
      <Loader
        showLoading={history.location.pathname === '/exchange' && isFetchingMarkets && !isBusyMakingTrade}
        message="Discovering TDEX providers with best liquidity..."
        delay={0}
        backdropDismiss={true}
        duration={15000}
        onDidDismiss={() => {
          if (getMarkets().length === 0 || getProviders().length === 0) openNoProvidersAvailableAlert();
        }}
      />
      <ExchangeErrorModal
        result={tdexOrderInputResult}
        error={tradeError}
        onClose={() => setTradeError(undefined)}
        onClickRetry={() => tdexOrderInputResult !== undefined && setPINModalOpen(true)}
        onClickTryNext={(endpointToBan: string) => {
          if (getProviders().length > 1) {
            setToFilterProviders([...toFilterProviders, endpointToBan]);
          } else {
            dispatch(addErrorToast(NoOtherProvider));
          }
        }}
      />

      {getMarkets().length > 0 && (
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
      )}

      {getMarkets().length > 0 && (
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
            <IonRow className="ion-align-items-start">
              <IonAlert
                isOpen={showProvidersAlert}
                onDidDismiss={() => setShowProvidersAlert(false)}
                header={'Providers excluded'}
                message={toFilterProviders.reduce((acc, n) => acc + `${n}<br />`, '')}
                buttons={[
                  'OK',
                  {
                    text: 'clear',
                    handler: () => setToFilterProviders([]),
                  },
                ]}
              />

              {toFilterProviders.length > 0 && (
                <IonCol className="ion-padding-start">
                  <IonChip outline color="danger">
                    <IonLabel onClick={() => setShowProvidersAlert(true)}>
                      {toFilterProviders.length} providers excluded
                    </IonLabel>
                    <IonIcon onClick={() => setToFilterProviders([])} icon={closeOutline} />
                  </IonChip>
                </IonCol>
              )}
            </IonRow>

            <IonRow className="ion-align-items-start">
              <IonCol>
                <TdexOrderInput onInput={setTdexOrderInputResult} markets={getMarkets()} />
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol size="8.5" offset="1.75">
                <IonButton
                  className={classNames('main-button', {
                    'button-disabled': tdexOrderInputResult === undefined,
                  })}
                  data-cy="exchange-confirm-btn"
                  disabled={tdexOrderInputResult === undefined}
                  onClick={() => setPINModalOpen(true)}
                >
                  CONFIRM
                </IonButton>
              </IonCol>
            </IonRow>

            {tdexOrderInputResult && (
              <IonRow className="market-provider ion-margin-vertical-x2 ion-text-center">
                <IonCol size="10" offset="1">
                  <IonText className="trade-info" color="light">
                    Market provided by:{' '}
                    <span className="provider-info">
                      {`${getProviderName((tdexOrderInputResult.order.market as TDEXMarket).provider.endpoint)} - ${
                        tdexOrderInputResult.order.traderClient.providerUrl
                      }`}
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
