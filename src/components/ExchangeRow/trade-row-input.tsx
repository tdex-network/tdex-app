import { IonIcon, IonInput, IonSpinner, IonText } from "@ionic/react";
import classNames from "classnames";
import Decimal from "decimal.js";
import { chevronDownOutline } from "ionicons/icons";
import React, { useRef, useState } from "react";
import { connect } from "react-redux";
import { BalanceInterface } from "../../redux/actionTypes/walletActionTypes";
import { balanceByAssetSelector } from "../../redux/reducers/walletReducer";
import { RootState } from "../../redux/store";
import { defaultPrecision, LbtcDenomination } from "../../utils/constants";
import { fromSatoshiFixed, isLbtc, toLBTCwithUnit } from "../../utils/helpers";
import { sanitizeInputAmount } from "../../utils/input";
import { onPressEnterKeyCloseKeyboard } from "../../utils/keyboard";
import { AssetWithTicker, getTradablesAssets } from "../../utils/tdex";
import ExchangeSearch from "../ExchangeSearch";
import { CurrencyIcon } from "../icons";

export type ExchangeRowValue = {
  amount: string;
  asset: AssetWithTicker;
}

interface ConnectedProps {
  lbtcUnit: LbtcDenomination;
  balance?: BalanceInterface;
  price: number;
  currency: string;
  searchableAssets: AssetWithTicker[];
}

interface ComponentProps {
  type: 'send' | 'receive';
  value: ExchangeRowValue;
  isLoading: boolean;
  onChange: (value: ExchangeRowValue) => void;
  error?: Error;
}

type Props = ConnectedProps & ComponentProps;

const TradeRowInput: React.FC<Props> = ({
  type,
  value,
  isLoading,
  lbtcUnit,
  onChange,
  balance,
  price,
  error,
  currency,
  searchableAssets,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef<HTMLIonInputElement>(null);

  const onNewAsset = (asset: AssetWithTicker) => {
    onChange({ ...value, asset });
  }

  const onNewAmount = (amount: string) => {
    const unitLBTC = isLbtc(value.asset.asset) ? lbtcUnit : undefined
    onChange({ ...value, amount: sanitizeInputAmount(amount, unitLBTC) });
  }

  const handleInputChange = (e: CustomEvent) => {
    if (isLoading) {
      return;
    }
    
    onNewAmount(e.detail.value);
  }

  return <div className="exchange-coin-container">
      <h2 className="subtitle">{`You ${type}`}</h2>
      <div className="exchanger-row">
        <div className="coin-name" onClick={() => {if (!isLoading) setIsSearchOpen(true)}}>
          <span className="icon-wrapper">
            <CurrencyIcon currency={value.asset.ticker} />
          </span>
          <span>{value.asset.ticker === 'L-BTC' ? lbtcUnit : value.asset.ticker.toUpperCase()}</span>
          <IonIcon className="icon" icon={chevronDownOutline} />
        </div>

        <div
          className={classNames('coin-amount', {
            active: value.amount,
          })}
        >
          <div className="ion-text-end">
          <IonInput
              ref={inputRef}
              color={error && 'danger'}
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
              value={value.amount}
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
            )
          }}
        >
          <span>Total balance:</span>
          <span>{`${fromSatoshiFixed(
            balance?.amount.toString() || '0',
            balance?.precision,
            balance?.precision ?? defaultPrecision,
            balance?.ticker === 'L-BTC' ? lbtcUnit : undefined
          )} ${balance?.ticker === 'L-BTC' ? lbtcUnit : value.asset.ticker}`}</span>
        </span>
        {isLoading ? (
          <IonSpinner name="dots" />
        ) : value.amount && value.asset.coinGeckoID ? (
          <span className="ion-text-right">
            {error ? (
              <IonText color="danger">{error}</IonText>
            ) : (
              <>
                {toLBTCwithUnit(new Decimal(value.amount), balance?.ticker === 'L-BTC' ? lbtcUnit : undefined)
                  .mul(price)
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
        assets={searchableAssets}
        setAsset={onNewAsset}
        isOpen={isSearchOpen}
        close={(ev: any) => {
          ev?.preventDefault();
          setIsSearchOpen(false);
        }}
      />
    </div>
}

const mapStateToProps = (state: RootState, ownProps: ComponentProps): ConnectedProps => ({
  balance: balanceByAssetSelector(ownProps.value.asset.asset)(state),
  lbtcUnit: state.settings.denominationLBTC,
  price: ownProps.value.asset.coinGeckoID ? state.rates.prices[ownProps.value.asset.coinGeckoID] : 0,
  currency: state.settings.currency.name,
  searchableAssets: getTradablesAssets(state.tdex.markets, ownProps.value.amount),
})

export default connect(mapStateToProps)(TradeRowInput)