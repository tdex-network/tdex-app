import type { InputChangeEventDetail } from '@ionic/core/components';
import { IonIcon, IonInput, IonText } from '@ionic/react';
import classNames from 'classnames';
import { chevronDownOutline } from 'ionicons/icons';
import type { Dispatch } from 'react';
import React, { useCallback, useEffect, useState } from 'react';

import type { Asset } from '../../store/assetStore';
import { useSettingsStore } from '../../store/settingsStore';
import type { Balance } from '../../store/walletStore';
import type { NetworkString } from '../../utils/constants';
import { isLbtc, isLbtcTicker } from '../../utils/helpers';
import { sanitizeInputAmount } from '../../utils/input';
import { onPressEnterKeyCloseKeyboard, setAccessoryBar } from '../../utils/keyboard';
import CurrencyIcon from '../CurrencyIcon';

interface WithdrawRowProps {
  amount: string;
  asset: Asset;
  balance: Balance;
  setAmount: Dispatch<string>;
  error: string;
  network: NetworkString;
}

const WithdrawRow: React.FC<WithdrawRowProps> = ({ amount, asset, balance, setAmount, error, network }) => {
  const currencyValue = useSettingsStore((state) => state.currency.ticker);
  const lbtcUnit = useSettingsStore((state) => state.lbtcDenomination);
  const [residualBalance, setResidualBalance] = useState<number>(balance.value);
  const [fiat, setFiat] = useState<string>('0.00');

  const reset = useCallback(() => {
    setResidualBalance(balance.value);
    setFiat('0.00');
    setAmount('');
  }, [balance, setAmount]);

  useEffect(() => {
    setAccessoryBar(true).catch(console.error);
    return () => {
      reset();
      setAccessoryBar(false).catch(console.error);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e: CustomEvent<InputChangeEventDetail>) => {
    if (!e.detail.value || e.detail.value === '0') {
      reset();
      return;
    }
    const unit = isLbtc(asset.assetHash, network) ? lbtcUnit : undefined;
    const sanitizedValue = sanitizeInputAmount(e.detail.value, setAmount, unit);
    // Set values
    setAmount(sanitizedValue);
    const residualAmount = balance.value - +sanitizedValue;
    setResidualBalance(
      +residualAmount.toLocaleString('en-US', {
        maximumFractionDigits: asset.precision,
        useGrouping: false,
      })
    );
  };

  return (
    <div className="exchange-coin-container">
      <div className="exchanger-row">
        <div className="coin-name">
          <span className="icon-wrapper">
            <CurrencyIcon assetHash={asset.assetHash} />
          </span>
          <span>{isLbtcTicker(asset.ticker) ? lbtcUnit : asset.ticker.toUpperCase()}</span>
          <IonIcon className="icon" icon={chevronDownOutline} />
        </div>

        <div
          className={classNames('coin-amount', {
            active: balance,
          })}
        >
          <div className="ion-text-end">
            <IonInput
              name="input-withdraw-amount"
              data-testid="input-withdraw-amount"
              autofocus={true}
              color={error && 'danger'}
              enterkeyhint="done"
              inputmode="decimal"
              onIonChange={handleInputChange}
              onKeyDown={onPressEnterKeyCloseKeyboard}
              pattern="^[0-9]*[.,]?[0-9]*$"
              placeholder="0"
              type="tel"
              value={amount}
            />
          </div>
        </div>
      </div>

      <div className="exchanger-row sub-row">
        <span className="balance" onClick={() => setAmount(residualBalance.toString())} data-testid="button-send-max">
          <div className="overflow-hidden text-no-wrap">
            {`MAX `}
            {error || !residualBalance ? (
              '0.00'
            ) : (
              <span>{`${residualBalance} ${isLbtcTicker(asset.ticker) ? lbtcUnit : asset.ticker.toUpperCase()}`}</span>
            )}
          </div>
        </span>
        <span className="ion-text-right">
          {error ? (
            <IonText color="danger">{error}</IonText>
          ) : (
            <span>
              {fiat} {currencyValue?.toUpperCase()}
            </span>
          )}
        </span>
      </div>
    </div>
  );
};

export default WithdrawRow;
