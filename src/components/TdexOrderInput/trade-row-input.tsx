import { IonIcon, IonInput, IonSpinner, IonText } from '@ionic/react';
import classNames from 'classnames';
import Decimal from 'decimal.js';
import { chevronDownOutline } from 'ionicons/icons';
import React, { useRef, useState } from 'react';
import { connect } from 'react-redux';

import type { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import { balanceByAssetSelector } from '../../redux/reducers/walletReducer';
import type { RootState } from '../../redux/store';
import type { AssetConfig, LbtcDenomination } from '../../utils/constants';
import { defaultPrecision } from '../../utils/constants';
import { fromSatoshiFixed, isLbtc, toSatoshi } from '../../utils/helpers';
import { sanitizeInputAmount } from '../../utils/input';
import { onPressEnterKeyCloseKeyboard } from '../../utils/keyboard';
import ExchangeSearch from '../ExchangeSearch';
import { CurrencyIcon } from '../icons';

import './style.scss';

export type ExchangeRowValue = {
  amount: string;
  asset: AssetConfig;
};

interface ConnectedProps {
  lbtcUnit: LbtcDenomination;
  balance?: BalanceInterface;
  price: number;
  currency: string;
}

interface ComponentProps {
  type: 'send' | 'receive';
  isLoading: boolean;
  assetSelected?: AssetConfig;
  sats: number;
  onChangeAsset: (asset: string) => void;
  onChangeSats: (sats: number) => void;
  error?: Error;
  searchableAssets: AssetConfig[];
}

type Props = ConnectedProps & ComponentProps;

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
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef<HTMLIonInputElement>(null);

  const [localError, setLocalError] = useState<Error>();

  const onSelectAsset = (asset: AssetConfig) => {
    onChangeAsset(asset.assetHash);
  };

  const onInputAmount = (amount: string) => {
    if (!assetSelected) return;

    const unitLBTC = isLbtc(assetSelected.assetHash) ? lbtcUnit : undefined;
    const stringAmount = sanitizeInputAmount(amount, unitLBTC);
    const satoshis = toSatoshi(stringAmount, assetSelected.precision, unitLBTC).toNumber();
    onChangeSats(satoshis);

    if (type === 'send' && satoshis > (balance ? balance.amount : 0)) {
      // only check balance in case of `send` input
      throw new Error(`amount greater than balance`);
    }
  };

  const handleInputChange = (e: CustomEvent) => {
    if (isLoading) {
      return;
    }

    setLocalError(undefined);
    try {
      onInputAmount(e.detail.value);
    } catch (e) {
      if (e instanceof Error) {
        setLocalError(e);
      }
    }
  };

  const getAmountString = () =>
    fromSatoshiFixed(
      sats.toString(10),
      assetSelected?.precision || defaultPrecision,
      assetSelected?.precision || defaultPrecision,
      isLbtc(assetSelected?.assetHash ?? '') ? lbtcUnit : undefined
    );

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
              <span>{isLbtc(assetSelected.assetHash) ? lbtcUnit : assetSelected.ticker.toUpperCase()}</span>
              <IonIcon className="icon" icon={chevronDownOutline} />
            </>
          )}
        </div>

        <div
          className={classNames('coin-amount', {
            active: sats > 0,
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
              debounce={500}
              onKeyDown={onPressEnterKeyCloseKeyboard}
              pattern="^[0-9]*[.,]?[0-9]*$"
              placeholder="0"
              type="tel"
              value={getAmountString()}
            />
          </div>
        </div>
      </div>

      <div className="exchanger-row sub-row ion-margin-top">
        <span
          className="balance"
          onClick={() => {
            if (!inputRef.current || !balance) return;
            inputRef.current.setFocus();
            inputRef.current.value = fromSatoshiFixed(
              balance.amount.toString() || '0',
              balance.precision,
              balance.precision ?? defaultPrecision,
              balance.ticker === 'L-BTC' ? lbtcUnit : undefined
            );
          }}
        >
          <span>Total balance:</span>
          <span>{`${fromSatoshiFixed(
            balance?.amount.toString() || '0',
            balance?.precision,
            balance?.precision ?? defaultPrecision,
            balance?.ticker === 'L-BTC' ? lbtcUnit : undefined
          )} ${balance?.ticker === 'L-BTC' ? lbtcUnit : assetSelected?.ticker}`}</span>
        </span>

        {isLoading ? (
          <IonSpinner name="dots" />
        ) : (
          <span className="ion-text-right">
            {error || localError ? (
              <IonText color="danger">{(error || localError)?.message || 'unknown error'}</IonText>
            ) : (
              <>
                {new Decimal(getAmountString() || 0).mul(price || 0).toFixed(2)} {currency.toUpperCase()}
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

const mapStateToProps = (state: RootState, ownProps: ComponentProps): ConnectedProps => ({
  balance: ownProps.assetSelected ? balanceByAssetSelector(ownProps.assetSelected.assetHash)(state) : undefined,
  lbtcUnit: state.settings.denominationLBTC,
  price: ownProps.assetSelected?.coinGeckoID ? state.rates.prices[ownProps.assetSelected.coinGeckoID] : 0,
  currency: state.settings.currency.name,
});

export default connect(mapStateToProps)(TradeRowInput);
