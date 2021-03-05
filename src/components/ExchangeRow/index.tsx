import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { CurrencyIcon } from '../icons';
import './style.scss';
import { AssetWithTicker } from '../../redux/reducers/tdexReducer';
import { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import { fromSatoshi } from '../../utils/helpers';
import { IonIcon, IonInput, IonSpinner } from '@ionic/react';
import ExchangeSearch from '../../redux/containers/exchangeSearchContainer';
import { caretDown, searchSharp } from 'ionicons/icons';

interface ExchangeRowInterface {
  asset: AssetWithTicker;
  balances: BalanceInterface[];
  prices: Record<string, number>;
  currency: string;
  amount?: string;
  onChangeAmount: (newAmount: string | null | undefined) => Promise<void>;
  readonly: boolean;
  isUpdating: boolean;
  assets: AssetWithTicker[];
  setAsset: (newAsset: AssetWithTicker) => void;
}

const ExchangeRow: React.FC<ExchangeRowInterface> = ({
  asset,
  prices,
  balances,
  amount,
  onChangeAmount,
  currency,
  readonly,
  isUpdating,
  assets,
  setAsset,
}) => {
  const [balanceAmount, setBalanceAmount] = useState<number>();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    setBalanceAmount(balances.find((b) => b.asset === asset.asset)?.amount);
  }, [balances, asset]);

  return (
    <div className="exchange-coin-container">
      <div className="exchanger-row">
        <div
          className="coin-name"
          onClick={() => {
            setIsSearchOpen(true);
          }}
        >
          <span className="icon-wrapper medium">
            <CurrencyIcon currency={asset.ticker} />
          </span>
          <p>{asset.ticker}</p>
          <IonIcon
            className="icon"
            icon={isSearchOpen ? searchSharp : caretDown}
          />
        </div>
        <div
          className={classNames('coin-amount', {
            active: amount,
          })}
        >
          <div className="ion-text-end">
            <IonInput
              type="number"
              value={amount}
              placeholder="0.00"
              onIonChange={(e) => {
                if (!isUpdating) {
                  onChangeAmount(e.detail.value);
                }
              }}
              readonly={readonly}
            />
          </div>
        </div>
      </div>
      <div className="exchanger-row sub-row">
        <div>
          {balanceAmount && (
            <p>{`Total balance: ${fromSatoshi(balanceAmount).toFixed(8)} ${
              asset.ticker
            }`}</p>
          )}
        </div>
        {amount && asset.coinGeckoID && prices[asset.coinGeckoID] && (
          <div>
            <p>
              {(parseFloat(amount) * prices[asset.coinGeckoID]).toFixed(2)}{' '}
              {currency.toUpperCase()}
            </p>
          </div>
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
        assets={assets}
        setAsset={setAsset}
        isOpen={isSearchOpen}
        close={() => setIsSearchOpen(false)}
      />
    </div>
  );
};

export default ExchangeRow;
