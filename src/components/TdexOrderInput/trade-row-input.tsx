import { IonIcon, IonInput, IonSpinner, IonText } from "@ionic/react";
import classNames from "classnames";
import Decimal from "decimal.js";
import { chevronDownOutline } from "ionicons/icons";
import React, { useRef, useState } from "react";
import { connect } from "react-redux";
import { BalanceInterface } from "../../redux/actionTypes/walletActionTypes";
import { balanceByAssetSelector } from "../../redux/reducers/walletReducer";
import { RootState } from "../../redux/store";
import { AssetConfig, defaultPrecision, LbtcDenomination } from "../../utils/constants";
import { fromSatoshiFixed, isLbtc, toSatoshi } from "../../utils/helpers";
import { sanitizeInputAmount } from "../../utils/input";
import { onPressEnterKeyCloseKeyboard } from "../../utils/keyboard";
import { assetHashToAssetConfig, getTradablesAssets } from "../../utils/tdex";
import ExchangeSearch from "../ExchangeSearch";
import { CurrencyIcon } from "../icons";

export type ExchangeRowValue = {
  amount: string;
  asset: AssetConfig;
}

interface ConnectedProps {
  lbtcUnit: LbtcDenomination;
  balance?: BalanceInterface;
  price: number;
  currency: string;
  searchableAssets: AssetConfig[];
}

interface ComponentProps {
  type: 'send' | 'receive';
  isLoading: boolean;
  assetSelected: AssetConfig;
  sats: number;
  onChangeAsset: (asset: string) => void;
  onChangeSats: (sats: number) => void;
  error?: Error;
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

  const onSelectAsset = (asset: AssetConfig) => {
    onChangeAsset(asset.assetHash);
  }

  const onInputAmount = (amount: string) => {
    const unitLBTC = isLbtc(assetSelected.assetHash) ? lbtcUnit : undefined
    const stringAmount = sanitizeInputAmount(amount, unitLBTC);
    const satoshis = toSatoshi(stringAmount, assetSelected.precision, unitLBTC).toNumber();
    onChangeSats(satoshis);
  }

  const handleInputChange = (e: CustomEvent) => {
    if (isLoading) {
      return;
    }
    
    onInputAmount(e.detail.value);
  }

  const getAmountString = () => fromSatoshiFixed(
    sats.toString(10),
    assetSelected.precision,
    assetSelected.precision,
    isLbtc(assetSelected.assetHash) ? lbtcUnit : undefined
  )

  return <div className="exchange-coin-container">
      <h2 className="subtitle">{`You ${type}`}</h2>
      <div className="exchanger-row">
        <div className="coin-name" onClick={() => {if (!isLoading) setIsSearchOpen(true)}}>
          <span className="icon-wrapper">
            <CurrencyIcon currency={assetSelected.ticker} />
          </span>
          <span>{isLbtc(assetSelected.assetHash) ? lbtcUnit : assetSelected.ticker.toUpperCase()}</span>
          <IonIcon className="icon" icon={chevronDownOutline} />
        </div>

        <div
          className={classNames('coin-amount', {
            active: sats > 0,
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
            )
          }}
        >
          <span>Total balance:</span>
          <span>{`${fromSatoshiFixed(
            balance?.amount.toString() || '0',
            balance?.precision,
            balance?.precision ?? defaultPrecision,
            balance?.ticker === 'L-BTC' ? lbtcUnit : undefined
          )} ${balance?.ticker === 'L-BTC' ? lbtcUnit : assetSelected.ticker}`}</span>
        </span>
        {isLoading ? (
          <IonSpinner name="dots" />
        ) : sats && assetSelected.coinGeckoID ? (
          <span className="ion-text-right">
            {error ? (
              <IonText color="danger">{error}</IonText>
            ) : (
              <>
                {new Decimal(getAmountString())
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
        setAsset={onSelectAsset}
        isOpen={isSearchOpen}
        close={(ev: any) => {
          ev?.preventDefault();
          setIsSearchOpen(false);
        }}
      />
    </div>
}

const mapStateToProps = (state: RootState, ownProps: ComponentProps): ConnectedProps => ({
  balance: balanceByAssetSelector(ownProps.assetSelected.assetHash)(state),
  lbtcUnit: state.settings.denominationLBTC,
  price: ownProps.assetSelected.coinGeckoID ? state.rates.prices[ownProps.assetSelected.coinGeckoID] : 0,
  currency: state.settings.currency.name,
  searchableAssets: getTradablesAssets(state.tdex.markets, ownProps.assetSelected.assetHash).map(assetHashToAssetConfig(state.assets)),
})

export default connect(mapStateToProps)(TradeRowInput)