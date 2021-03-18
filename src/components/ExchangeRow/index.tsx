import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { CurrencyIcon } from '../icons';
import { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import { fromSatoshiFixed } from '../../utils/helpers';
import {
  IonIcon,
  IonInput,
  IonSpinner,
  useIonViewDidEnter,
  useIonViewDidLeave,
} from '@ionic/react';
import ExchangeSearch from '../../redux/containers/exchangeSearchContainer';
import { caretDown, searchSharp } from 'ionicons/icons';
import { AssetWithTicker } from '../../utils/tdex';

import './style.scss';
import { onPressEnterKeyCloseKeyboard } from '../../utils/keyboard';
import { Plugins } from '@capacitor/core';

interface ExchangeRowInterface {
  asset: AssetWithTicker;
  balances: BalanceInterface[];
  prices: Record<string, number>;
  currency: string;
  amount?: string;
  onChangeAmount: (newAmount: string | null | undefined) => Promise<void>;
  isUpdating: boolean;
  assets: AssetWithTicker[];
  setAsset: (newAsset: AssetWithTicker) => void;
  setFocused: () => void;
}

const { Keyboard } = Plugins;

const ExchangeRow: React.FC<ExchangeRowInterface> = ({
  asset,
  prices,
  balances,
  amount,
  onChangeAmount,
  currency,
  isUpdating,
  assets,
  setAsset,
  setFocused,
}) => {
  const [balanceAmount, setBalanceAmount] = useState<number>();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useIonViewDidEnter(() => {
    Keyboard.setAccessoryBarVisible({ isVisible: true });
  });

  useIonViewDidLeave(() => {
    Keyboard.setAccessoryBarVisible({ isVisible: false });
  });

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
              enterkeyhint="done"
              onKeyDown={onPressEnterKeyCloseKeyboard}
              inputmode="decimal"
              value={amount}
              placeholder="0.00"
              onIonChange={(e) => {
                if (!isUpdating) {
                  onChangeAmount(e.detail.value);
                }
              }}
              onIonFocus={(e) => setFocused()}
              disabled={isUpdating}
            />
          </div>
        </div>
      </div>
      <div className="exchanger-row sub-row">
        <div>
          <p>{`Total balance: ${fromSatoshiFixed(balanceAmount || 0, 8, 8)} ${
            asset.ticker
          }`}</p>
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
