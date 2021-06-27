import type { InputChangeEventDetail } from '@ionic/core';
import {
  IonIcon,
  IonInput,
  IonText,
  useIonViewDidEnter,
  useIonViewDidLeave,
} from '@ionic/react';
import classNames from 'classnames';
import Decimal from 'decimal.js';
import { chevronDownOutline } from 'ionicons/icons';
import type { Dispatch } from 'react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import { updatePrices } from '../../redux/actions/ratesActions';
import {
  fromSatoshi,
  fromSatoshiFixed,
  toLBTCwithUnit,
} from '../../utils/helpers';
import { sanitizeInputAmount } from '../../utils/input';
import {
  onPressEnterKeyCloseKeyboard,
  setAccessoryBar,
} from '../../utils/keyboard';
import { CurrencyIcon } from '../icons';

interface WithdrawRowInterface {
  amount: string;
  balance: BalanceInterface;
  price: number | undefined;
  setAmount: Dispatch<string>;
  error: string;
}

const WithdrawRow: React.FC<WithdrawRowInterface> = ({
  amount,
  balance,
  price,
  setAmount,
  error,
}) => {
  const lbtcUnit = useSelector((state: any) => state.settings.denominationLBTC);
  const currency = useSelector((state: any) => state.settings.currency.value);
  const [residualBalance, setResidualBalance] = useState<string>(
    fromSatoshiFixed(
      balance.amount.toString(),
      balance.precision,
      balance.precision,
      balance.ticker === 'L-BTC' ? lbtcUnit : undefined,
    ),
  );
  const [fiat, setFiat] = useState<string>('0.00');
  const dispatch = useDispatch();

  useIonViewDidEnter(() => {
    setAccessoryBar(true).catch(console.error);
  });

  useIonViewDidLeave(() => {
    setAccessoryBar(false).catch(console.error);
    reset();
  });

  useEffect(() => {
    setResidualBalance(
      fromSatoshiFixed(
        balance.amount.toString(),
        balance.precision,
        balance.precision,
        balance.ticker === 'L-BTC' ? lbtcUnit : undefined,
      ),
    );
  }, [lbtcUnit, balance.amount]);

  useEffect(() => {
    dispatch(updatePrices());
  }, []);

  const reset = () => {
    setResidualBalance(
      fromSatoshiFixed(
        balance.amount.toString(),
        balance.precision,
        balance.precision,
        balance.ticker === 'L-BTC' ? lbtcUnit : undefined,
      ),
    );
    if (price) setFiat('0.00');
    setAmount('');
  };

  const handleInputChange = (e: CustomEvent<InputChangeEventDetail>) => {
    if (!e.detail.value || e.detail.value === '0') {
      reset();
      return;
    }

    const sanitizedValue = sanitizeInputAmount(e.detail.value, setAmount);
    // Set values
    setAmount(sanitizedValue);
    const residualAmount = fromSatoshi(
      balance.amount.toString(),
      balance.precision,
      balance.ticker === 'L-BTC' ? lbtcUnit : undefined,
    ).sub(sanitizedValue);
    setResidualBalance(
      residualAmount.toNumber().toLocaleString('en-US', {
        maximumFractionDigits: balance.precision,
        useGrouping: false,
      }),
    );
    if (price) {
      setFiat(
        toLBTCwithUnit(
          new Decimal(sanitizedValue),
          balance.ticker === 'L-BTC' ? lbtcUnit : undefined,
        )
          .mul(price)
          .toFixed(2),
      );
    }
  };

  return (
    <div className="exchange-coin-container">
      <div className="exchanger-row">
        <div className="coin-name">
          <span className="icon-wrapper">
            <CurrencyIcon currency={balance.ticker} />
          </span>
          <span>
            {balance.ticker === 'L-BTC'
              ? lbtcUnit
              : balance.ticker.toUpperCase()}
          </span>
          <IonIcon className="icon" icon={chevronDownOutline} />
        </div>

        <div
          className={classNames('coin-amount', {
            active: balance.amount,
          })}
        >
          <div className="ion-text-end">
            <IonInput
              autofocus={true}
              color={error && 'danger'}
              enterkeyhint="done"
              inputmode="decimal"
              onIonChange={handleInputChange}
              onKeyDown={onPressEnterKeyCloseKeyboard}
              pattern="^[0-9]+(([.,][0-9]+)?)$"
              placeholder="0"
              type="tel"
              value={amount}
            />
          </div>
        </div>
      </div>

      <div className="exchanger-row sub-row">
        <span className="balance">
          <>
            <span>Residual balance:</span>
            {error ? (
              '0.00'
            ) : (
              <span>
                {`${residualBalance && residualBalance} ${
                  balance.ticker === 'L-BTC'
                    ? lbtcUnit
                    : balance.ticker.toUpperCase()
                }`}
              </span>
            )}
          </>
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
