import type { InputChangeEventDetail } from '@ionic/core';
import { IonIcon, IonInput, IonText } from '@ionic/react';
import classNames from 'classnames';
import Decimal from 'decimal.js';
import { chevronDownOutline } from 'ionicons/icons';
import type { Dispatch } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { NetworkString } from 'tdex-sdk';

import type { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import { updatePrices } from '../../redux/actions/ratesActions';
import { fromSatoshi, fromSatoshiFixed, isLbtc, isLbtcTicker, fromUnitToLbtc } from '../../utils/helpers';
import { sanitizeInputAmount } from '../../utils/input';
import { onPressEnterKeyCloseKeyboard, setAccessoryBar } from '../../utils/keyboard';
import CurrencyIcon from '../CurrencyIcon';

interface WithdrawRowInterface {
  amount: string;
  balance: BalanceInterface;
  price: number | undefined;
  setAmount: Dispatch<string>;
  error: string;
  network: NetworkString;
}

const WithdrawRow: React.FC<WithdrawRowInterface> = ({ amount, balance, price, setAmount, error, network }) => {
  const lbtcUnit = useSelector((state: any) => state.settings.denominationLBTC);
  const currency = useSelector((state: any) => state.settings.currency.value);
  const [residualBalance, setResidualBalance] = useState<string>(
    fromSatoshiFixed(
      balance.amount.toString(),
      balance.precision,
      balance.precision,
      isLbtcTicker(balance.ticker) ? lbtcUnit : undefined
    )
  );
  const [fiat, setFiat] = useState<string>('0.00');
  const dispatch = useDispatch();

  const reset = useCallback(() => {
    setResidualBalance(
      fromSatoshiFixed(
        balance.amount.toString(),
        balance.precision,
        balance.precision,
        isLbtc(balance.assetHash, network) ? lbtcUnit : undefined
      )
    );
    if (price) setFiat('0.00');
    setAmount('');
  }, [balance.amount, balance.assetHash, balance.precision, lbtcUnit, network, price, setAmount]);

  useEffect(() => {
    setAccessoryBar(true).catch(console.error);
    dispatch(updatePrices());
    return () => {
      reset();
      setAccessoryBar(false).catch(console.error);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setResidualBalance(
      fromSatoshiFixed(
        balance.amount.toString(),
        balance.precision,
        balance.precision,
        isLbtc(balance.assetHash, network) ? lbtcUnit : undefined
      )
    );
  }, [lbtcUnit, balance.amount, balance.precision, balance.assetHash, network]);

  const handleInputChange = (e: CustomEvent<InputChangeEventDetail>) => {
    if (!e.detail.value || e.detail.value === '0') {
      reset();
      return;
    }
    const unit = isLbtc(balance.assetHash, network) ? lbtcUnit : undefined;
    const sanitizedValue = sanitizeInputAmount(e.detail.value, setAmount, unit);
    // Set values
    setAmount(sanitizedValue);
    const residualAmount = fromSatoshi(balance.amount.toString(), balance.precision, unit).sub(sanitizedValue);
    setResidualBalance(
      residualAmount.toNumber().toLocaleString('en-US', {
        maximumFractionDigits: balance.precision,
        useGrouping: false,
      })
    );
    if (price) {
      setFiat(fromUnitToLbtc(new Decimal(sanitizedValue), unit).mul(price).toFixed(2));
    }
  };

  return (
    <div className="exchange-coin-container">
      <div className="exchanger-row">
        <div className="coin-name">
          <span className="icon-wrapper">
            <CurrencyIcon assetHash={balance.assetHash} />
          </span>
          <span>{isLbtcTicker(balance.ticker) ? lbtcUnit : balance.ticker.toUpperCase()}</span>
          <IonIcon className="icon" icon={chevronDownOutline} />
        </div>

        <div
          className={classNames('coin-amount', {
            active: balance.amount,
          })}
        >
          <div className="ion-text-end">
            <IonInput
              data-cy="input-withdraw-amount"
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
        <span className="balance" onClick={() => setAmount(residualBalance)} data-cy="button-send-max">
          <div className="overflow-hidden text-no-wrap">
            {`MAX `}
            {error || !residualBalance ? (
              '0.00'
            ) : (
              <span>{`${residualBalance} ${
                isLbtcTicker(balance.ticker) ? lbtcUnit : balance.ticker.toUpperCase()
              }`}</span>
            )}
          </div>
        </span>
        <span className="ion-text-right">
          {error ? (
            <IonText color="danger">{error}</IonText>
          ) : (
            <span>
              {fiat} {currency?.toUpperCase()}
            </span>
          )}
        </span>
      </div>
    </div>
  );
};

export default WithdrawRow;
