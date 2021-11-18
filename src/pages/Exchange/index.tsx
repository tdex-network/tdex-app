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
import type { TDEXMarket } from '../../redux/actionTypes/tdexActionTypes';
import type { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import { addErrorToast, addSuccessToast } from '../../redux/actions/toastActions';
import { watchTransaction } from '../../redux/actions/transactionsActions';
import { unlockUtxos } from '../../redux/actions/walletActions';
import ExchangeRow from '../../redux/containers/exchangeRowContainer';
import type { AssetConfig, LbtcDenomination } from '../../utils/constants';
import { defaultPrecision, PIN_TIMEOUT_FAILURE, PIN_TIMEOUT_SUCCESS } from '../../utils/constants';
import { AppError, IncorrectPINError, NoMarketsProvidedError } from '../../utils/errors';
import { customCoinSelector, getAssetHashLBTC, isLbtc, toSatoshi } from '../../utils/helpers';
import type { TDexMnemonicRedux } from '../../utils/identity';
import { getConnectedTDexMnemonic } from '../../utils/storage-helper';
import { computeOrders, makeTrade, getTradablesAssets } from '../../utils/tdex';
import type { PreviewData } from '../TradeSummary';

import './style.scss';

const ERROR_LIQUIDITY = 'Not enough liquidity in market';

interface ExchangeProps extends RouteComponentProps {
  allAssets: AssetConfig[];
  assets: Record<string, AssetConfig>;
  balances: BalanceInterface[];
  dispatch: Dispatch;
  explorerLiquidAPI: string;
  lastUsedIndexes: StateRestorerOpts;
  lbtcUnit: LbtcDenomination;
  markets: TDEXMarket[];
  utxos: UtxoInterface[];
  torProxy: string;
}

const Exchange: React.FC<ExchangeProps> = ({
  history,
  balances,
  explorerLiquidAPI,
  markets,
  utxos,
  assets,
  allAssets,
  dispatch,
  lastUsedIndexes,
  lbtcUnit,
  torProxy,
}) => {
  const [hasBeenSwapped, setHasBeenSwapped] = useState<boolean>(false);
  // user inputs amount
  const [sentAmount, setSentAmount] = useState<string>();
  const [receivedAmount, setReceivedAmount] = useState<string>();
  // errors
  const [needReset, setNeedReset] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);

  useIonViewWillEnter(() => {
    if (markets.length === 0) {
      dispatch(addErrorToast(NoMarketsProvidedError));
      history.goBack();
      return;
    }
  }, [markets]);


  // make and broadcast trade, then push to trade summary page
  const onPinConfirm = async (pin: string) => {
    if (!assetSent || !trade || !sentAmount) return;
    try {
      setModalOpen(false);
      setLoading(true);
      let identity;
      try {
        const toRestore = await getConnectedTDexMnemonic(pin, dispatch);
        identity = (await mnemonicRestorerFromState(toRestore)(lastUsedIndexes)) as TDexMnemonicRedux;
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
            isLbtc(assetSent.asset) ? lbtcUnit : undefined
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

  const swapAssetsAndAmounts = () => {
    setHasBeenSwapped(true);
    setAssetSent(assetReceived);
    setAssetReceived(assetSent);
    setSentAmount(receivedAmount);
    setReceivedAmount(sentAmount);
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
          } and receive ${receivedAmount} ${isLbtc(assetReceived.asset) ? lbtcUnit : assetReceived.ticker}.`}
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
            
            <div className="exchange-divider ion-activatable" onClick={swapAssetsAndAmounts}>
              <img src={swap} alt="swap" />
              <IonRippleEffect type="unbounded" />
            </div>

              </IonRow>

            <IonRow>
              <IonCol size="8.5" offset="1.75">
                <IonButton
                  className={classNames('main-button', {
                    'button-disabled': !assetSent || !assetReceived || isLoading || sentAmountGreaterThanBalance(),
                  })}
                  data-cy="exchange-confirm-btn"
                  disabled={!assetSent || !assetReceived || isLoading || sentAmountGreaterThanBalance()}
                  onClick={onConfirm}
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
