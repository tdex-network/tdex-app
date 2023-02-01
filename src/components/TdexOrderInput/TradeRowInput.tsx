export {};
/*
import './style.scss';
import { IonIcon, IonInput, IonSpinner, IonText } from '@ionic/react';
import classNames from 'classnames';
import Decimal from 'decimal.js';
import { chevronDownOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import type { Asset } from 'src/store/assetStore';
import { useAssetStore } from 'src/store/assetStore';

import ExchangeSearch from '../../components/ExchangeSearch';
import { useDelayedRender } from '../../hooks/useDelayedRender';
import { useAppStore } from '../../store/appStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useWalletStore } from '../../store/walletStore';
import { defaultPrecision } from '../../utils/constants';
import { fromSatoshiFixed, fromUnitToLbtc, isLbtc, isLbtcTicker, toSatoshi } from '../../utils/helpers';
import { sanitizeInputAmount } from '../../utils/input';
import { onPressEnterKeyCloseKeyboard } from '../../utils/keyboard';
import CurrencyIcon from '../CurrencyIcon';

export type ExchangeRowValue = {
  amount: string;
  asset: Asset;
};

interface ComponentProps {
  type: 'send' | 'receive';
  isLoading: boolean;
  assetSelected?: Asset;
  sats?: number;
  onChangeAsset: (asset: string) => void;
  onChangeSats: (sats: number) => void;
  error?: Error;
  searchableAssets: Asset[];
  onFocus: () => void;
}

type Props = ComponentProps;

const DelayedSpinner: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  return useDelayedRender(400, isLoading)(() => <IonSpinner name="dots" />);
};

export const TradeRowInput: React.FC<Props> = ({
  type,
  assetSelected,
  sats,
  isLoading,
  onChangeAsset,
  onChangeSats,
  error,
  searchableAssets,
  onFocus,
}) => {
  const isFetchingTransactions = useAppStore((state) => state.isFetchingTransactions);
  const assets = useAssetStore((state) => state.assets);
  const currency = useSettingsStore((state) => state.currency);
  const lbtcUnit = useSettingsStore((state) => state.lbtcDenomination);
  const network = useSettingsStore((state) => state.network);
  const balances = useWalletStore((state) => state.balances);
  //
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef<HTMLIonInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [localError, setLocalError] = useState<Error>();
  const onSelectAsset = (asset: Asset) => onChangeAsset(asset.assetHash);

  const onInputAmount = (amount: string) => {
    if (!assetSelected) return;
    const unitLBTC = isLbtc(assetSelected.assetHash, network) ? lbtcUnit : undefined;
    const stringAmount = sanitizeInputAmount(amount, setInputValue, unitLBTC);
    // If value is 0, use placeholder value
    setInputValue(stringAmount === '0' ? '' : stringAmount);
    const satoshis = toSatoshi(stringAmount, assetSelected.precision, unitLBTC).toNumber();
    onChangeSats(satoshis);
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
                <CurrencyIcon assetHash={assetSelected.assetHash} />
              </span>
              <span>{isLbtc(assetSelected.assetHash, network) ? lbtcUnit : assetSelected.ticker.toUpperCase()}</span>
              <IonIcon className="icon" icon={chevronDownOutline} />
            </>
          )}
        </div>

        {isLoading ? (
          <DelayedSpinner isLoading={isLoading} />
        ) : (
          <div
            className={classNames('coin-amount', {
              active: (sats ?? 0) > 0,
            })}
          >
            <div className="ion-text-end">
              <IonInput
                ref={inputRef}
                name={`exchange-${type}-input`}
                color={(localError || error) && 'danger'}
                data-testid={`exchange-${type}-input`}
                // isFetchingTransactions fixes https://github.com/tdex-network/tdex-app/issues/535
                disabled={isLoading || isFetchingTransactions}
                enterkeyhint="done"
                inputmode="decimal"
                onIonChange={handleInputChange}
                onKeyDown={onPressEnterKeyCloseKeyboard}
                onIonFocus={onFocus}
                pattern="^[0-9]*[.,]?[0-9]*$"
                placeholder="0"
                type="tel"
                value={inputValue}
                debounce={1250}
              />
            </div>
          </div>
        )}
      </div>

      <div className="exchanger-row sub-row ion-margin-top">
        <span
          className="balance"
          onClick={() => {
            if (!inputRef.current) return;
            inputRef.current.setFocus().catch(console.error);
            onInputAmount(
              fromSatoshiFixed(
                balances[assetSelected?.assetHash ?? '']?.toString() || '0',
                assets[assetSelected?.assetHash ?? '']?.precision ?? defaultPrecision,
                assets[assetSelected?.assetHash ?? '']?.precision ?? defaultPrecision,
                isLbtcTicker(assets[assetSelected?.assetHash ?? '']?.ticker || '') ? lbtcUnit : undefined
              )
            );
          }}
        >
          <span>Total balance:</span>
          <span>{`${fromSatoshiFixed(
            balances[assetSelected?.assetHash ?? '']?.toString() || '0',
            assets[assetSelected?.assetHash ?? '']?.precision ?? defaultPrecision,
            assets[assetSelected?.assetHash ?? '']?.precision ?? defaultPrecision,
            isLbtcTicker(assets[assetSelected?.assetHash ?? '']?.ticker || '') ? lbtcUnit : undefined
          )} ${
            isLbtcTicker(assets[assetSelected?.assetHash ?? '']?.ticker || '') ? lbtcUnit : assetSelected?.ticker
          }`}</span>
        </span>

        {isLoading ? null : (
          <span className="ion-text-right">
            {error || localError ? (
              <IonText color="danger">{(error || localError)?.message || 'unknown error'}</IonText>
            ) : (
              <>
                {fromUnitToLbtc(
                  new Decimal(inputValue || 0),
                  isLbtcTicker(assets[assetSelected?.assetHash ?? '']?.ticker || '') ? lbtcUnit : undefined
                )
                  .mul(selectedAssetPrice || 0)
                  .toFixed(2)}{' '}
                {currency.value.toUpperCase()}
              </>
            )}
          </span>
        )}
      </div>

      <ExchangeSearch
        assets={searchableAssets}
        currency={currency}
        setAsset={onSelectAsset}
        isOpen={isSearchOpen}
        close={(ev: any) => {
          ev?.preventDefault();
          setIsSearchOpen(false);
        }}
        prices={prices}
      />
    </div>
  );
};
*/
