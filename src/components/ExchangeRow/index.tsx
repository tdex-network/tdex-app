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
import { Decimal } from 'decimal.js';
import { chevronDownOutline } from 'ionicons/icons';
import { debounce } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { sanitizeInputAmount } from '../../utils/input';
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
  assetAmount?: string;
  // using to auto-update with best trade price
  trades: TDEXTrade[];
  relatedAssetHash: string;
  relatedAssetAmount: string;
  // actions to parent component.
  onChangeAmount: (newAmount: string) => void;
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
  isLoading: boolean;
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
  isLoading,
}) => {
  const lbtcUnit = useSelector((state: any) => state.settings.denominationLBTC);
  const [balance, setBalance] = useState<BalanceInterface>();
  const [amount, setAmount] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const inputAmountValueQueue = useRef<string[]>([]);

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

  const updatePriceDebounced = useMemo(
    () =>
      debounce(async () => {
        let newTrade;
        let bestPriceRes;
        let updatedAmount;
        const lastInputAmount = inputAmountValueQueue.current.pop() ?? '0';
        // Clear array by only keeping the last element
        inputAmountValueQueue.current = [lastInputAmount];
        // Get best trade
        setIsUpdating(true);
        try {
          if (
            relatedAssetHash === trades[0].market.baseAsset ||
            relatedAssetHash === trades[0].market.quoteAsset
          ) {
            newTrade = await bestBalance(trades);
          } else {
            setIsUpdating(false);
            return;
          }
        } catch (err) {
          console.error(err);
          setError(err.message);
          bestPriceRes = await bestPrice(
            {
              amount: lastInputAmount,
              asset: relatedAssetHash,
              precision:
                assets[relatedAssetHash]?.precision ?? defaultPrecision,
            },
            trades,
            lbtcUnit,
            console.error,
          );
          newTrade = bestPriceRes.trade;
        }
        //
        let priceInSats: { amount: number; asset: string };
        try {
          priceInSats = await calculatePrice(
            {
              amount: lastInputAmount,
              asset: relatedAssetHash,
              precision:
                assets[relatedAssetHash]?.precision ?? defaultPrecision,
            },
            newTrade,
            lbtcUnit,
          );
          setTrade(newTrade);
          //
          if (isLbtc(asset.asset)) {
            const precision =
              assets[priceInSats.asset]?.precision ?? defaultPrecision;
            updatedAmount = fromSatoshiFixed(
              priceInSats.amount.toString(),
              precision,
              precision,
              isLbtc(asset.asset) ? lbtcUnit : undefined,
            );
          } else {
            // Convert fiat
            const priceInBtc = fromSatoshi(
              priceInSats.amount.toString(),
              assets[priceInSats.asset]?.precision ?? defaultPrecision,
              lbtcUnit,
            );
            updatedAmount = toLBTCwithUnit(priceInBtc, lbtcUnit)
              .toNumber()
              .toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: assets[relatedAssetHash]?.precision,
                useGrouping: false,
              });
          }
          setAmount(updatedAmount === '0' ? '' : updatedAmount);
          onChangeAmount(updatedAmount === '0' ? '' : updatedAmount);
        } catch (err) {
          console.error(err);
          setOtherInputError(err.message);
        }
        setIsUpdating(false);
      }, 500),
    [relatedAssetHash, trades],
  );

  useEffect(() => {
    void (async (): Promise<void> => {
      // Skip calculating price if the input is focused
      if (isLoading || focused || trades.length === 0 || !relatedAssetHash)
        return;
      if (relatedAssetAmount === '0') {
        onChangeAmount('');
        setAmount('');
        return;
      }
      //
      inputAmountValueQueue.current.push(relatedAssetAmount);
      await updatePriceDebounced();
    })();
    // Need 'trade' to compute price based on last trade with proper type
    // Need 'trades' to compute bestBalance trade
    // Need 'asset' which is accurate faster than balance
    // Need 'balance' to display quote asset price
    // Need 'isLoading' to prevent running the effect when confirming trade
  }, [
    isLoading,
    relatedAssetAmount,
    relatedAssetHash,
    asset,
    balance,
    trade,
    trades,
  ]);

  const handleInputChange = (e: CustomEvent<InputChangeEventDetail>) => {
    if (!isUpdating) {
      if (!e.detail.value || e.detail.value === '0') {
        setError('');
        setAmount('');
        onChangeAmount('');
        return;
      }
      // Sanitize
      const sanitizedValue = sanitizeInputAmount(e.detail.value, setAmount);
      // Set
      setAmount(sanitizedValue);
      onChangeAmount(sanitizedValue);
      // Check balance
      const valSats = toSatoshi(
        sanitizedValue,
        balance?.precision,
        isLbtc(asset.asset) ? lbtcUnit : undefined,
      );
      if (sendInput && valSats.greaterThan(balance?.amount ?? 0)) {
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
              disabled={isUpdating}
              enterkeyhint="done"
              inputmode="decimal"
              onIonChange={handleInputChange}
              onIonFocus={setFocus}
              onKeyDown={onPressEnterKeyCloseKeyboard}
              pattern="^[0-9]*[.,]?[0-9]*$"
              placeholder="0"
              type="tel"
              value={amount}
            />
          </div>
        </div>
      </div>

      <div className="exchanger-row sub-row ion-margin-top">
        <span
          className="balance"
          onClick={() => {
            setFocus();
            setAmount(
              fromSatoshiFixed(
                balance?.amount.toString() || '0',
                balance?.precision,
                balance?.precision ?? defaultPrecision,
                balance?.ticker === 'L-BTC' ? lbtcUnit : undefined,
              ),
            );
          }}
        >
          <span>Total balance:</span>
          <span>{`${fromSatoshiFixed(
            balance?.amount.toString() || '0',
            balance?.precision,
            balance?.precision ?? defaultPrecision,
            balance?.ticker === 'L-BTC' ? lbtcUnit : undefined,
          )} ${balance?.ticker === 'L-BTC' ? lbtcUnit : asset.ticker}`}</span>
        </span>
        {isUpdating ? (
          <IonSpinner name="dots" />
        ) : amount && asset.coinGeckoID && prices[asset.coinGeckoID] ? (
          <span className="ion-text-right">
            {error ? (
              <IonText color="danger">{error}</IonText>
            ) : (
              <>
                {toLBTCwithUnit(
                  new Decimal(amount),
                  balance?.ticker === 'L-BTC' ? lbtcUnit : undefined,
                )
                  .mul(prices[asset.coinGeckoID])
                  .toFixed(2)}{' '}
                {currency.toUpperCase()}
              </>
            )}
          </span>
        ) : (
          <span />
        )}
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
