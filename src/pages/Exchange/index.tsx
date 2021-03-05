import React, { useState, useEffect } from 'react';
import { RouteComponentProps } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
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
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import ExchangeRow from '../../redux/containers/exchangeRowCointainer';
import classNames from 'classnames';
import { RefresherEventDetail } from '@ionic/core';
import './style.scss';
import {
  AssetWithTicker,
  tradablesAssetsSelector,
} from '../../redux/reducers/tdexReducer';
import { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import { allTrades, bestPrice, makeTrade } from '../../utils/tdex';
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

  const [isUpdating, setIsUpdating] = useState(false);
  const [assetSent, setAssetSent] = useState<AssetWithTicker>(balances[0]);
  const tradableAssets = useSelector(tradablesAssetsSelector(assetSent.asset));
  const [assetReceived, setAssetReceived] = useState<AssetWithTicker>(
    tradableAssets[0]
  );
  const [trades, setTrades] = useState<TDEXTrade[]>([]);
  const [trade, setTrade] = useState<TDEXTrade>();
  const [sentAmount, setSentAmount] = useState<string>();
  const [receivedAmount, setReceivedAmount] = useState<string>();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useIonViewWillEnter(() => {
    if (balances.length === 0 || markets.length === 0) {
      dispatch(addErrorToast('no markets available'));
      history.goBack();
    }
  });

  useEffect(() => {
    if (balances.length === 0 || markets.length === 0) return;
    setTrades(allTrades(markets, assetSent.asset, assetReceived.asset));
  }, [assetSent, assetReceived, markets]);

  const onChangeReceived = async (
    newReceivedAmount: string | null | undefined
  ) => {
    if (!newReceivedAmount) {
      setSentAmount('');
      setReceivedAmount('');
      return;
    }
    setReceivedAmount(amountGuard(parseFloat(newReceivedAmount).toFixed(8)));
  };

  const onChangeSent = async (newSentAmount: string | null | undefined) => {
    if (!newSentAmount) {
      setSentAmount('');
      setReceivedAmount('');
      return;
    }

    if (parseFloat(newSentAmount) === 0) {
      setSentAmount(newSentAmount);
      setReceivedAmount(newSentAmount);
      return;
    }

    if (!assetSent) return;
    try {
      setIsUpdating(true);
      setSentAmount(amountGuard(newSentAmount));
      const { amount, asset, trade: bestTrade } = await bestPrice(
        {
          amount: parseFloat(newSentAmount),
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
      setIsUpdating(false);
    }
  };

  const onConfirm = () => {
    setModalOpen(true);
  };

  const onPinConfirm = async (pin: string) => {
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
      addSuccessToast('Trade successfully computed');
      setTimeout(() => {
        dispatch(update());
        history.push(`/tradesummary/${txid}`);
      }, 2000);
    } catch (e) {
      dispatch(addErrorToast(e));
    } finally {
      setTimeout(() => setLoading(false), 1500);
    }
  };

  const onRefresh = (event: CustomEvent<RefresherEventDetail>) => {
    dispatch(update());
    setTimeout(() => {
      event.detail.complete();
    }, 2000);
  };

  return (
    <IonPage>
      <IonRefresher slot="fixed" onIonRefresh={onRefresh}>
        <IonRefresherContent
          pullingIcon={chevronDownCircleOutline}
          refreshingSpinner="circles"
        />
      </IonRefresher>
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
      {assetSent && assetReceived && balances.length > 0 && markets.length > 0 && (
        <IonContent className="exchange-content">
          <div className="exchange">
            <ExchangeRow
              asset={assetSent}
              amount={sentAmount}
              onChangeAmount={onChangeSent}
              readonly={false}
              isUpdating={false}
              assets={balances}
              setAsset={setAssetSent}
            />
            <div
              className={classNames([
                'exchange-divider',
                {
                  disabled: !balances
                    .map((b) => b.asset)
                    .includes(assetReceived.asset),
                },
              ])}
              onClick={() => {
                if (!balances.map((b) => b.asset).includes(assetReceived.asset))
                  return;

                const firstAsset = { ...assetSent };
                setAssetSent(assetReceived);
                setAssetReceived(firstAsset);
              }}
            >
              <IonIcon className="swap-btn" icon={swapVerticalOutline} />
            </div>
            <ExchangeRow
              asset={assetReceived}
              amount={receivedAmount}
              onChangeAmount={onChangeReceived}
              readonly={true}
              isUpdating={isUpdating}
              assets={tradableAssets}
              setAsset={setAssetReceived}
            />
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
                loading
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
