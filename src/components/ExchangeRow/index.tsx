import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { CurrencyIcon } from '../icons';
import { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import { fromSatoshi, fromSatoshiFixed } from '../../utils/helpers';
import { IonIcon, IonInput, IonSpinner } from '@ionic/react';
import ExchangeSearch from '../../redux/containers/exchangeSearchContainer';
import { caretDown, searchSharp } from 'ionicons/icons';
import { AssetWithTicker, bestPrice } from '../../utils/tdex';

import './style.scss';
import { TDEXTrade } from '../../redux/actionTypes/tdexActionTypes';
import { Dispatch } from 'redux';
import { addErrorToast } from '../../redux/actions/toastActions';
import { AssetConfig, defaultPrecision } from '../../utils/constants';

interface ExchangeRowInterface {
  // the asset handled by the component.
  asset: AssetWithTicker;
  // using to auto-update with best trade price
  trades: TDEXTrade[];
  relatedAssetHash: string;
  relatedAssetAmount: number;
  // actions to parent component.
  onChangeAmount: (newAmount: number) => void;
  setTrade: (trade: TDEXTrade) => void;
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
  dispatch: Dispatch;
}

const ExchangeRow: React.FC<ExchangeRowInterface> = ({
  trades,
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
  dispatch,
  setFocus,
  focused,
}) => {
  const [balance, setBalance] = useState<BalanceInterface>();
  const [amount, setAmount] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const onErrorGetPrice = (e: any) => dispatch(addErrorToast(e.message || e)); // TODO handle error

  useEffect(() => {
    setBalance(balances.find((b) => b.asset === asset.asset));
  }, [balances, asset]);

  useEffect(() => {
    if (focused || trades.length === 0 || !relatedAssetHash) return; // skip the effect if the input field is focused
    if (relatedAssetAmount === 0) {
      onChangeAmount(0);
      setAmount('');
    }
    setIsUpdating(true);
    bestPrice(
      {
        amount: relatedAssetAmount,
        asset: relatedAssetHash,
        precision: assets[relatedAssetHash]?.precision || defaultPrecision,
      },
      trades,
      onErrorGetPrice
    )
      .then(({ amount: previewAmount, asset: previewAsset, trade }) => {
        setTrade(trade);
        const precision = assets[previewAsset]?.precision || defaultPrecision;
        const updatedAmount = fromSatoshiFixed(
          previewAmount,
          precision,
          precision
        );
        setAmount(updatedAmount);
        onChangeAmount(fromSatoshi(previewAmount, precision));
      })
      .catch((err) => {
        console.error(err);
        dispatch(addErrorToast(err.message || err));
      })
      .finally(() => setIsUpdating(false));
  }, [relatedAssetAmount, relatedAssetHash]);

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
                  if (!e.detail.value) {
                    setAmount('');
                    onChangeAmount(0);
                    return;
                  }
                  const val = e.detail.value.replace(',', '.');
                  setAmount(val);
                  onChangeAmount(parseFloat(val));
                }
              }}
              onIonFocus={() => setFocus()}
              disabled={isUpdating}
            />
          </div>
        </div>
      </div>
      <div className="exchanger-row sub-row">
        <div>
          <p>{`Total balance: ${fromSatoshiFixed(
            balance?.amount || 0,
            balance?.precision,
            balance?.precision || defaultPrecision
          )} ${asset.ticker}`}</p>
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
        assets={assetsWithTicker}
        setAsset={setAsset}
        isOpen={isSearchOpen}
        close={() => setIsSearchOpen(false)}
      />
    </div>
  );
};

export default ExchangeRow;
