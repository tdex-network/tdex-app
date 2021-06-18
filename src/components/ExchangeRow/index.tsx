import type { InputChangeEventDetail } from '@ionic/core';
import {
  IonIcon,
  IonInput,
  IonSpinner,
  IonText,
  useIonViewDidEnter,
  useIonViewDidLeave,
} from '@ionic/react';
import classNames from 'classnames';
import { chevronDownOutline } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import type { TDEXTrade } from '../../redux/actionTypes/tdexActionTypes';
import type { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import ExchangeSearch from '../../redux/containers/exchangeSearchContainer';
import { defaultPrecision } from '../../utils/constants';
import type { AssetConfig } from '../../utils/constants';
import {
  fromSatoshi,
  fromSatoshiFixed,
  isLbtc,
  toLBTCwithUnit,
  toSatoshi,
} from '../../utils/helpers';
import {
  onPressEnterKeyCloseKeyboard,
  setAccessoryBar,
} from '../../utils/keyboard';
import { bestBalance, bestPrice, calculatePrice } from '../../utils/tdex';
import type { AssetWithTicker } from '../../utils/tdex';
import { CurrencyIcon } from '../icons';
import './style.scss';

const ERROR_BALANCE_TOO_LOW = 'Amount is greater than your balance';

interface ExchangeRowInterface {
  sendInput: boolean;
  // the asset handled by the component.
  asset: AssetWithTicker;
  assetAmount?: number;
  // using to auto-update with best trade price
  trades: TDEXTrade[];
  relatedAssetHash: string;
  relatedAssetAmount: number;
  // actions to parent component.
  onChangeAmount: (newAmount: number) => void;
  setTrade: (trade: TDEXTrade) => void;
  trade?: TDEXTrade;
  // for exchange search
  assetsWithTicker: AssetWithTicker[];
  setAsset: (newAsset: AssetWithTicker) => void;
  setFocus: () => void;
  focused: boolean;
  // redux connected props
  assets: Record<string, AssetConfig>;
  balances: BalanceInterface[];
  prices: Record<string, number>;
  currency: string;
  // error
  error: string;
  setError: (msg: string) => void;
  setOtherInputError: (msg: string) => void;
}

const ExchangeRow: React.FC<ExchangeRowInterface> = ({
  assetAmount,
  trades,
  trade,
  relatedAssetHash,
  relatedAssetAmount,
  asset,
  prices,
  balances,
  onChangeAmount,
  currency,
  assetsWithTicker,
  setTrade,
  assets,
  setAsset,
  setFocus,
  focused,
  sendInput,
  error,
  setError,
  setOtherInputError,
}) => {
  const lbtcUnit = useSelector((state: any) => state.settings.denominationLBTC);
  const [balance, setBalance] = useState<BalanceInterface>();
  const [amount, setAmount] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useIonViewDidEnter(() => {
    setAccessoryBar(true).catch(console.error);
    setError('');
    setAmount('');
  });

  useIonViewDidLeave(() => {
    setAccessoryBar(false).catch(console.error);
    setAmount('');
  });

  useEffect(() => {
    setBalance(balances.find(b => b.asset === asset.asset));
  }, [balances, asset]);

  useEffect(() => {
    if (assetAmount) {
      setAmount(assetAmount.toString());
    }
  }, [assetAmount]);

  useEffect(() => {
    void (async (): Promise<void> => {
      let newTrade;
      let bestPriceRes;
      let updatedAmount;
      // skip the effect if the input field is focused
      if (focused || trades.length === 0 || !relatedAssetHash) return;
      if (relatedAssetAmount === 0) {
        onChangeAmount(0);
        setAmount('');
        return;
      }
      setIsUpdating(true);
      try {
        newTrade = await bestBalance(trades);
      } catch (err) {
        console.error(err);
        setError(err.message);
        bestPriceRes = await bestPrice(
          {
            amount: relatedAssetAmount,
            asset: relatedAssetHash,
            precision: assets[relatedAssetHash]?.precision || defaultPrecision,
          },
          trades,
          console.error,
        );
        newTrade = bestPriceRes.trade;
      }
      //
      let priceInSats;
      try {
        priceInSats = await calculatePrice(
          {
            amount: relatedAssetAmount,
            asset: relatedAssetHash,
            precision: assets[relatedAssetHash]?.precision || defaultPrecision,
          },
          newTrade,
        );
        setTrade(newTrade);
        //
        if (isLbtc(asset.asset)) {
          const precision =
            assets[priceInSats.asset]?.precision || defaultPrecision;
          updatedAmount = fromSatoshiFixed(
            priceInSats.amount,
            precision,
            precision,
            isLbtc(asset.asset) ? lbtcUnit : undefined,
          );
        } else {
          // Convert fiat
          const priceInBtc = fromSatoshi(
            priceInSats.amount,
            assets[priceInSats.asset]?.precision || defaultPrecision,
            'L-BTC',
          );
          updatedAmount = toLBTCwithUnit(priceInBtc, lbtcUnit).toLocaleString(
            'en-US',
            {
              minimumFractionDigits: 0,
              maximumFractionDigits: assets[relatedAssetHash]?.precision,
              useGrouping: false,
            },
          );
        }
        setAmount(updatedAmount);
        onChangeAmount(parseFloat(updatedAmount));
        setIsUpdating(false);
      } catch (err) {
        console.error(err);
        setOtherInputError(err.message);
        setIsUpdating(false);
      }
    })();
    // Need 'trade' to compute price based on last trade with proper type
    // Need 'asset' which is accurate faster than balance
    // Need 'balance' to display quote asset price
  }, [relatedAssetAmount, relatedAssetHash, asset, balance, trade]);

  const handleInputChange = (e: CustomEvent<InputChangeEventDetail>) => {
    if (!isUpdating) {
      if (!e.detail.value) {
        setError('');
        setAmount('');
        onChangeAmount(0);
        return;
      }
      if (
        // No more than 12 chars
        e.detail.value.length >= 12 ||
        // No letters
        /[a-zA-Z]/.test(e.detail.value) ||
        // No more than one dot
        /(\..*){2,}/.test(e.detail.value)
      ) {
        // Hack to trigger a re-render
        setAmount('');
      }
      const val = e.detail.value
        .replace(',', '.')
        // Remove non numeric chars or period
        .replace(/[^0-9.]/g, '')
        // Remove last dot. Remove all if consecutive.
        .replace(/\.$/, '');
      const valSats = toSatoshi(
        parseFloat(val),
        balance?.precision,
        isLbtc(asset.asset) ? lbtcUnit : undefined,
      );
      setAmount(val);
      onChangeAmount(parseFloat(val));
      // Check balance
      if (sendInput && valSats > (balance?.amount ?? 0)) {
        setError(ERROR_BALANCE_TOO_LOW);
      }
    }
  };

  return (
    <div className="exchange-coin-container">
      <h2 className="subtitle">{`You ${sendInput ? 'Send' : 'Receive'}`}</h2>
      <div className="exchanger-row">
        <div className="coin-name" onClick={() => setIsSearchOpen(true)}>
          <span className="icon-wrapper">
            <CurrencyIcon currency={asset.ticker} />
          </span>
          <span>
            {asset.ticker === 'L-BTC' ? lbtcUnit : asset.ticker.toUpperCase()}
          </span>
          <IonIcon className="icon" icon={chevronDownOutline} />
        </div>

        <div
          className={classNames('coin-amount', {
            active: amount,
          })}
        >
          <div className="ion-text-end">
            <IonInput
              color={error && 'danger'}
              debounce={200}
              disabled={isUpdating}
              enterkeyhint="done"
              inputmode="decimal"
              onIonChange={handleInputChange}
              onIonFocus={setFocus}
              onKeyDown={onPressEnterKeyCloseKeyboard}
              pattern="^[0-9]+(([.,][0-9]+)?)$"
              placeholder="0"
              type="tel"
              value={amount}
            />
          </div>
        </div>
      </div>

      <div className="exchanger-row sub-row">
        <span
          className="balance"
          onClick={() => {
            setFocus();
            setAmount(
              fromSatoshiFixed(
                balance?.amount || 0,
                balance?.precision,
                balance?.precision || defaultPrecision,
                balance?.ticker === 'L-BTC' ? lbtcUnit : undefined,
              ),
            );
          }}
        >
          <span>Total balance:</span>
          <span>{`${fromSatoshiFixed(
            balance?.amount || 0,
            balance?.precision,
            balance?.precision || defaultPrecision,
            balance?.ticker === 'L-BTC' ? lbtcUnit : undefined,
          )} ${balance?.ticker === 'L-BTC' ? lbtcUnit : asset.ticker}`}</span>
        </span>
        {amount && asset.coinGeckoID && prices[asset.coinGeckoID] ? (
          <span className="ion-text-right">
            {error ? (
              <IonText color="danger">{error}</IonText>
            ) : (
              <>
                {(
                  toLBTCwithUnit(
                    parseFloat(amount),
                    balance?.ticker === 'L-BTC' ? lbtcUnit : undefined,
                  ) * prices[asset.coinGeckoID]
                ).toFixed(2)}{' '}
                {currency.toUpperCase()}
              </>
            )}
          </span>
        ) : (
          <span />
        )}
      </div>
      <div
        className={classNames('spinner', 'ion-text-end', {
          visible: isUpdating,
        })}
      >
        <IonSpinner color="light" name="dots" />
      </div>
      <ExchangeSearch
        assets={assetsWithTicker}
        setAsset={setAsset}
        isOpen={isSearchOpen}
        close={() => setIsSearchOpen(false)}
      />
    </div>
  );
};

export default ExchangeRow;
