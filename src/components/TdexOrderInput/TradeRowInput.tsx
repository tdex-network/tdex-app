import './style.scss';
import { IonIcon, IonInput, IonSpinner, IonText } from '@ionic/react';
import classNames from 'classnames';
import Decimal from 'decimal.js';
import { chevronDownOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import type { NetworkString } from 'tdex-sdk';

import ExchangeSearch from '../../components/ExchangeSearch';
import { useDelayedRender } from '../../hooks/useDelayedRender';
import type { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import type { CurrencyInterface } from '../../redux/reducers/settingsReducer';
import { balanceByAssetSelector } from '../../redux/reducers/walletReducer';
import type { RootState } from '../../redux/types';
import type { AssetConfig, LbtcDenomination } from '../../utils/constants';
import { defaultPrecision } from '../../utils/constants';
import { fromSatoshiFixed, fromUnitToLbtc, isLbtc, isLbtcTicker, toSatoshi } from '../../utils/helpers';
import { sanitizeInputAmount } from '../../utils/input';
import { onPressEnterKeyCloseKeyboard } from '../../utils/keyboard';
import CurrencyIcon from '../CurrencyIcon';

export type ExchangeRowValue = {
  amount: string;
  asset: AssetConfig;
};

interface ConnectedProps {
  lbtcUnit: LbtcDenomination;
  balance?: BalanceInterface;
  prices: Record<string, number>;
  selectedAssetPrice: number;
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
  return useDelayedRender(400, isLoading)(() => <IonSpinner name="dots" />);
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
  prices,
  selectedAssetPrice,
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
  const { t } = useTranslation();

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

  const sectionTitle = type === 'receive' ? t('exchange.sectionTitle.youReceive') : t('exchange.sectionTitle.youSend');

  return (
    <div className="exchange-coin-container">
      <h2 className="subtitle">{sectionTitle}</h2>
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
                balance?.amount.toString() || '0',
                balance?.precision ?? defaultPrecision,
                balance?.precision ?? defaultPrecision,
                isLbtcTicker(balance?.ticker || '') ? lbtcUnit : undefined
              )
            );
          }}
        >
          <span>{t('exchange.totalBalance')}</span>
          <span>{`${fromSatoshiFixed(
            balance?.amount.toString() || '0',
            balance?.precision ?? defaultPrecision,
            balance?.precision ?? defaultPrecision,
            isLbtcTicker(balance?.ticker || '') ? lbtcUnit : undefined
          )} ${isLbtcTicker(balance?.ticker || '') ? lbtcUnit : assetSelected?.ticker}`}</span>
        </span>

        {isLoading ? null : (
          <span className="ion-text-right">
            {error || localError ? (
              <IonText color="danger">{(error || localError)?.message || 'unknown error'}</IonText>
            ) : (
              <>
                {fromUnitToLbtc(
                  new Decimal(inputValue || 0),
                  isLbtcTicker(balance?.ticker || '') ? lbtcUnit : undefined
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

const mapStateToProps = (state: RootState, ownProps: ComponentProps) => {
  return {
    balance: ownProps.assetSelected ? balanceByAssetSelector(ownProps.assetSelected.assetHash)(state) : undefined,
    currency: state.settings.currency,
    lbtcUnit: state.settings.denominationLBTC,
    network: state.settings.network,
    selectedAssetPrice: ownProps.assetSelected?.coinGeckoID
      ? state.rates.prices[ownProps.assetSelected.coinGeckoID]
      : 0,
    prices: state.rates.prices,
  };
};

export default connect(mapStateToProps)(TradeRowInput);
