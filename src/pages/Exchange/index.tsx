import {
  IonContent,
  IonPage,
  IonText,
  useIonViewWillEnter,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonChip,
  IonLabel,
  IonIcon,
  IonAlert,
} from '@ionic/react';
import classNames from 'classnames';
import { closeOutline } from 'ionicons/icons';
import type { UtxoInterface, StateRestorerOpts } from 'ldk';
import { mnemonicRestorerFromState } from 'ldk';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import type { RouteComponentProps } from 'react-router';

import tradeHistory from '../../assets/img/trade-history.svg';
import Header from '../../components/Header';
import Loader from '../../components/Loader';
import PinModal from '../../components/PinModal';
import Refresher from '../../components/Refresher';
import type { TdexOrderInputResult } from '../../components/TdexOrderInput';
import TdexOrderInput from '../../components/TdexOrderInput';
import type { TDEXMarket } from '../../redux/actionTypes/tdexActionTypes';
import { addErrorToast, addSuccessToast } from '../../redux/actions/toastActions';
import { watchTransaction } from '../../redux/actions/transactionsActions';
import { unlockUtxos } from '../../redux/actions/walletActions';
import { PIN_TIMEOUT_FAILURE, PIN_TIMEOUT_SUCCESS } from '../../utils/constants';
import { AppError, IncorrectPINError, MakeTradeError, NoMarketsProvidedError } from '../../utils/errors';
import { getConnectedTDexMnemonic } from '../../utils/storage-helper';
import type { PreviewData } from '../TradeSummary';

import './style.scss';
import ExchangeErrorModal from './exchange-error-modal';

const isSameProviderEndpoint = (providerEndpoint: string) =>
  function (market: TDEXMarket) {
    return market.provider.endpoint === providerEndpoint;
  };

const withoutProviders = (...endpoints: string[]) =>
  function (market: TDEXMarket) {
    const isSameProviderFns = endpoints.map(isSameProviderEndpoint);

    for (const fn of isSameProviderFns) {
      if (fn(market)) return false;
    }

    return true;
  };

export interface ExchangeConnectedProps {
  explorerLiquidAPI: string;
  lastUsedIndexes: StateRestorerOpts;
  markets: TDEXMarket[];
  utxos: UtxoInterface[];
  torProxy: string;
}

type Props = RouteComponentProps & ExchangeConnectedProps;

const Exchange: React.FC<Props> = ({ history, explorerLiquidAPI, markets, utxos, lastUsedIndexes, torProxy }) => {
  const dispatch = useDispatch();

  // Tdex order input
  const [result, setResult] = useState<TdexOrderInputResult>();
  const [toFilterProviders, setToFilterProviders] = useState<string[]>([]);
  const [showProvidersAlert, setShowProvidersAlert] = useState(false);
  const [tradeError, setTradeError] = useState<AppError>();

  const getPinModalDescription = () =>
    `Enter your secret PIN to send ${result?.send.amount} ${result?.send.unit} and receive ${result?.receive.amount} ${result?.receive.unit}.`;
  const getProviderName = (endpoint: string) => markets.find((m) => m.provider.endpoint === endpoint)?.provider.name;

  // confirm flow
  const [needReset, setNeedReset] = useState<boolean>(false);
  const [PINmodalOpen, setPINModalOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);

  useIonViewWillEnter(() => {
    if (markets.length === 0) {
      dispatch(addErrorToast(NoMarketsProvidedError));
      history.goBack();
      return;
    }
  }, [markets]);

  const getIdentity = async (pin: string) => {
    try {
      const toRestore = await getConnectedTDexMnemonic(pin, dispatch);
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
    addSuccessToast('Trade successfully computed');
    const preview: PreviewData = {
      sent: {
        ticker: result?.send.unit || 'unknown',
        amount: `-${result?.send.amount || '??'}`,
      },
      received: {
        ticker: result?.receive.unit || 'unknown',
        amount: result?.receive.amount || '??',
      },
    };

    history.replace(`/tradesummary/${txid}`, { preview });
  };

  // make and broadcast trade, then push to trade summary page
  const onPinConfirm = async (pin: string) => {
    setPINModalOpen(false);
    if (!result) return;

    setLoading(true);

    try {
      const identity = await getIdentity(pin);

      // // propose and complete tdex trade
      // // broadcast via liquid explorer
      // const txid = await makeTrade(
      //   result.order,
      //   { amount: result.send.sats, asset: result.send.asset },
      //   identity,
      //   explorerLiquidAPI,
      //   utxos,
      //   customCoinSelector(dispatch),
      //   torProxy
      // );

      setTradeError(MakeTradeError);
      // handleSuccess(txid);
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
      setLoading(false);
    }
  };

  const getMarkets = () => markets.filter(withoutProviders(...toFilterProviders));

  return (
    <IonPage id="exchange-page">
      <Loader showLoading={isLoading} delay={0} />
      <ExchangeErrorModal
        result={result}
        error={tradeError}
        onClose={() => setTradeError(undefined)}
        onClickRetry={() => setPINModalOpen(true)}
        onClickTryNext={(endpointToBan: string) => {
          setToFilterProviders([...toFilterProviders, endpointToBan]);
        }}
      />

      <PinModal
        open={result !== undefined && PINmodalOpen}
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
      {markets.length > 0 && (
        <IonContent className="exchange-content">
          <Refresher />
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
          <IonGrid className="ion-no-padding ion-padding-top">
            <IonRow className="ion-align-items-start">
              <IonAlert
                isOpen={showProvidersAlert}
                onDidDismiss={() => setShowProvidersAlert(false)}
                header={'Providers excluded'}
                message={toFilterProviders.reduce((acc, n) => (acc += `${n}<br />`), '')}
                buttons={[
                  'OK',
                  {
                    text: 'clear',
                    handler: () => {
                      setToFilterProviders([]);
                    },
                  },
                ]}
              />

              <IonCol className="ion-padding-start">
                {toFilterProviders.length > 0 && (
                  <IonChip outline color="danger">
                    <IonLabel onClick={() => setShowProvidersAlert(true)}>
                      {toFilterProviders.length} providers excluded
                    </IonLabel>
                    <IonIcon onClick={() => setToFilterProviders([])} icon={closeOutline} />
                  </IonChip>
                )}
              </IonCol>
            </IonRow>

            <IonRow className="ion-align-items-start">
              <IonCol>
                <TdexOrderInput onInput={setResult} markets={getMarkets()} />
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol size="8.5" offset="1.75">
                <IonButton
                  className={classNames('main-button', {
                    'button-disabled': result === undefined,
                  })}
                  data-cy="exchange-confirm-btn"
                  disabled={result === undefined}
                  onClick={() => setPINModalOpen(true)}
                >
                  CONFIRM
                </IonButton>
              </IonCol>
            </IonRow>

            {result && (
              <IonRow className="market-provider ion-margin-vertical-x2 ion-text-center">
                <IonCol size="10" offset="1">
                  <IonText className="trade-info" color="light">
                    Market provided by:{' '}
                    <span className="provider-info">
                      {`${getProviderName(result.order.traderClient.providerUrl)} - ${
                        result.order.traderClient.providerUrl
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
