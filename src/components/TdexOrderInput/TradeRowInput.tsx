import './style.scss';
import { IonIcon, IonInput, IonSpinner, IonText } from '@ionic/react';
import classNames from 'classnames';
import { chevronDownOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import type { Asset } from 'src/store/assetStore';
import { useAssetStore } from 'src/store/assetStore';

import ExchangeSearch from '../../components/ExchangeSearch';
import { useDelayedRender } from '../../hooks/useDelayedRender';
import { useAppStore } from '../../store/appStore';
import { useRateStore } from '../../store/rateStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useWalletStore } from '../../store/walletStore';
import { defaultPrecision, LBTC_COINGECKOID } from '../../utils/constants';
import { isLbtc, isLbtcTicker } from '../../utils/helpers';
import { sanitizeInputAmount } from '../../utils/input';
import { onPressEnterKeyCloseKeyboard } from '../../utils/keyboard';
import { fromSatoshiFixed, fromUnitToLbtc, toSatoshi } from '../../utils/unitConversion';
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
  const rates = useRateStore((state) => state.rates);
  const currency = useSettingsStore((state) => state.currency);
  const lbtcUnit = useSettingsStore((state) => state.lbtcUnit);
  const network = useSettingsStore((state) => state.network);
  const balances = useWalletStore((state) => state.balances);
  //
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef<HTMLIonInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [localError, setLocalError] = useState<Error>();
  const [tradeCounterValue, setTradeCounterValue] = useState<string>('0');
  const onSelectAsset = (asset: Asset) => onChangeAsset(asset.assetHash);

  const onInputAmount = (amount: number) => {
    if (!assetSelected) return;
    const unitLBTC = isLbtc(assetSelected.assetHash, network) ? lbtcUnit : undefined;
    const stringAmount = sanitizeInputAmount(amount.toString(), setInputValue, unitLBTC);
    // If value is 0, use placeholder value
    setInputValue(stringAmount === '0' ? '' : stringAmount);
    const satoshis = toSatoshi(Number(stringAmount), assetSelected.precision, unitLBTC);
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
      sats,
      assetSelected?.precision || defaultPrecision,
      assetSelected?.precision || defaultPrecision,
      isLbtc(assetSelected?.assetHash ?? '', network) ? lbtcUnit : undefined
    );
    setInputValue(newAmountFromSats);
    // TODO: add counter value for fiat
    if (rates && isLbtc(assetSelected?.assetHash ?? '', network)) {
      const cv =
        fromUnitToLbtc(
          Number(inputValue),
          isLbtcTicker(assets[assetSelected?.assetHash ?? '']?.ticker || '') ? lbtcUnit : undefined
        ) * rates[LBTC_COINGECKOID][currency.ticker];
      setTradeCounterValue(cv.toFixed(2));
    }
  }, [sats, assetSelected, lbtcUnit, network, rates, inputValue, assets, currency.ticker]);

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
            onInputAmount(balances?.[assetSelected?.assetHash ?? ''].value ?? 0);
          }}
        >
          <span>Total balance:</span>
          <span>{`${balances?.[assetSelected?.assetHash ?? 0]?.value ?? 0} ${
            isLbtcTicker(assets[assetSelected?.assetHash ?? '']?.ticker || '') ? lbtcUnit : assetSelected?.ticker
          }`}</span>
        </span>

        {isLoading ? null : (
          <span className="ion-text-right">
            {error || localError ? (
              <IonText color="danger">{(error || localError)?.message || 'unknown error'}</IonText>
            ) : (
              <>{`${tradeCounterValue} ${currency.ticker.toUpperCase()}`}</>
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
      />
    </div>
  );
};
