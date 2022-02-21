import './style.scss';
import { IonIcon, IonInput, IonSpinner, IonText } from '@ionic/react';
import classNames from 'classnames';
import Decimal from 'decimal.js';
import { chevronDownOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import type { NetworkString } from 'tdex-sdk';

import { useDelayedRender } from '../../hooks/useDelayedRender';
import type { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import ExchangeSearch from '../../redux/containers/exchangeSearchContainer';
import type { CurrencyInterface } from '../../redux/reducers/settingsReducer';
import type { AssetConfig, LbtcDenomination } from '../../utils/constants';
import { defaultPrecision } from '../../utils/constants';
import { fromSatoshiFixed, fromUnitToLbtc, isLbtc, isLbtcTicker, toSatoshi } from '../../utils/helpers';
import { sanitizeInputAmount } from '../../utils/input';
import { onPressEnterKeyCloseKeyboard } from '../../utils/keyboard';
import { CurrencyIcon } from '../icons';

export type ExchangeRowValue = {
  amount: string;
  asset: AssetConfig;
};

interface ConnectedProps {
  lbtcUnit: LbtcDenomination;
  balance?: BalanceInterface;
  price: number;
  currency: CurrencyInterface;
  network: NetworkString;
}

interface ComponentProps {
  type: 'send' | 'receive';
  isLoading: boolean;
  assetSelected?: AssetConfig;
  sats?: number;
  onChangeAsset: (asset: string) => void;
  onChangeSats: (sats: number) => void;
  error?: Error;
  searchableAssets: AssetConfig[];
  onFocus: () => void;
}

type Props = ConnectedProps & ComponentProps;

const DelayedSpinner: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  return useDelayedRender(1000, isLoading)(() => <IonSpinner name="dots" />);
};

const TradeRowInput: React.FC<Props> = ({
  type,
  assetSelected,
  sats,
  isLoading,
  lbtcUnit,
  onChangeAsset,
  onChangeSats,
  balance,
  price,
  error,
  currency,
  searchableAssets,
  onFocus,
  network,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef<HTMLIonInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [localError, setLocalError] = useState<Error>();
  const onSelectAsset = (asset: AssetConfig) => onChangeAsset(asset.assetHash);

  const onInputAmount = (amount: string) => {
    if (!assetSelected) return;
    const unitLBTC = isLbtc(assetSelected.assetHash, network) ? lbtcUnit : undefined;
    const stringAmount = sanitizeInputAmount(amount, setInputValue, unitLBTC);
    // If value is 0, use placeholder value
    setInputValue(stringAmount === '0' ? '' : stringAmount);
    const satoshis = toSatoshi(stringAmount, assetSelected.precision, unitLBTC).toNumber();
    onChangeSats(satoshis);
    if (type === 'send' && satoshis > (balance ? balance.amount : 0)) {
      // only check balance in case of `send` input
      throw new Error(`amount greater than balance`);
    }
  };

  const handleInputChange = (e: CustomEvent) => {
    setLocalError(undefined);
    if (isLoading) return;
    try {
      onInputAmount(e.detail.value);
    } catch (e) {
      if (e instanceof Error) {
        setLocalError(e);
      }
    }
  };

  useEffect(() => {
    if (!sats) {
      setInputValue('');
      return;
    }
    const newAmountFromSats = fromSatoshiFixed(
      sats.toString(10),
      assetSelected?.precision || defaultPrecision,
      assetSelected?.precision || defaultPrecision,
      isLbtc(assetSelected?.assetHash ?? '', network) ? lbtcUnit : undefined
    );
    setInputValue(newAmountFromSats);
  }, [sats, assetSelected, lbtcUnit, network]);

  return (
    <div className="exchange-coin-container">
      <h2 className="subtitle">{`You ${type}`}</h2>
      <div className="exchanger-row">
        <div
          className="coin-name"
          onClick={() => {
            if (!isLoading) setIsSearchOpen(true);
          }}
        >
          {assetSelected && (
            <>
              <span className="icon-wrapper">
                <CurrencyIcon currency={assetSelected.ticker} />
              </span>
              <span>{isLbtc(assetSelected.assetHash, network) ? lbtcUnit : assetSelected.ticker.toUpperCase()}</span>
              <IonIcon className="icon" icon={chevronDownOutline} />
            </>
          )}
        </div>

        <div
          className={classNames('coin-amount', {
            active: (sats ?? 0) > 0,
          })}
        >
          <div className="ion-text-end">
            <IonInput
              ref={inputRef}
              color={(localError || error) && 'danger'}
              data-cy={`exchange-${type}-input`}
              disabled={isLoading}
              enterkeyhint="done"
              inputmode="decimal"
              onIonChange={handleInputChange}
              onKeyDown={onPressEnterKeyCloseKeyboard}
              onIonFocus={onFocus}
              pattern="^[0-9]*[.,]?[0-9]*$"
              placeholder="0"
              type="tel"
              value={inputValue}
              debounce={500}
            />
          </div>
        </div>
      </div>

      <div className="exchanger-row sub-row ion-margin-top">
        <span
          className="balance"
          onClick={() => {
            if (!inputRef.current || !balance) return;
            inputRef.current.setFocus().catch(console.error);
            inputRef.current.value = fromSatoshiFixed(
              balance.amount.toString() || '0',
              balance.precision ?? defaultPrecision,
              balance.precision ?? defaultPrecision,
              isLbtcTicker(balance.ticker) ? lbtcUnit : undefined
            );
            setInputValue(inputRef.current.value);
          }}
        >
          <span>Total balance:</span>
          <span>{`${fromSatoshiFixed(
            balance?.amount.toString() || '0',
            balance?.precision ?? defaultPrecision,
            balance?.precision ?? defaultPrecision,
            isLbtcTicker(balance?.ticker || '') ? lbtcUnit : undefined
          )} ${isLbtcTicker(balance?.ticker || '') ? lbtcUnit : assetSelected?.ticker}`}</span>
        </span>

        {isLoading ? (
          <DelayedSpinner isLoading={isLoading} />
        ) : (
          <span className="ion-text-right">
            {error || localError ? (
              <IonText color="danger">{(error || localError)?.message || 'unknown error'}</IonText>
            ) : (
              <>
                {fromUnitToLbtc(
                  new Decimal(inputValue || 0),
                  isLbtcTicker(balance?.ticker || '') ? lbtcUnit : undefined
                )
                  .mul(price || 0)
                  .toFixed(2)}{' '}
                {currency.value.toUpperCase()}
              </>
            )}
          </span>
        )}
      </div>

      <ExchangeSearch
        assets={searchableAssets}
        setAsset={onSelectAsset}
        isOpen={isSearchOpen}
        close={(ev: any) => {
          ev?.preventDefault();
          setIsSearchOpen(false);
        }}
      />
    </div>
  );
};

export default TradeRowInput;
