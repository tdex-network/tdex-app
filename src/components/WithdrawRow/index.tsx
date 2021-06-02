import {
  IonIcon,
  IonInput,
  IonText,
  useIonViewDidEnter,
  useIonViewDidLeave,
} from '@ionic/react';
import classNames from 'classnames';
import { chevronDownOutline } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import { updatePrices } from '../../redux/actions/ratesActions';
import {
  fromSatoshi,
  fromSatoshiFixed,
  toLBTCwithUnit,
} from '../../utils/helpers';
import {
  onPressEnterKeyCloseKeyboard,
  setAccessoryBar,
} from '../../utils/keyboard';
import { CurrencyIcon } from '../icons';

interface WithdrawRowInterface {
  amount: number | undefined;
  balance: BalanceInterface;
  price: number | undefined;
  onAmountChange: (amount: number | undefined) => void;
  error: string;
}

const WithdrawRow: React.FC<WithdrawRowInterface> = ({
  amount,
  balance,
  price,
  onAmountChange,
  error,
}) => {
  const lbtcUnit = useSelector((state: any) => state.settings.denominationLBTC);
  const currency = useSelector((state: any) => state.settings.currency.value);
  const [residualBalance, setResidualBalance] = useState<string>(
    fromSatoshiFixed(
      balance.amount,
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
        balance.amount,
        balance.precision,
        balance.precision,
        balance.ticker === 'L-BTC' ? lbtcUnit : undefined,
      ),
    );
  }, [lbtcUnit]);

  useEffect(() => {
    dispatch(updatePrices());
  }, []);

  useEffect(() => {
    handleAmountChange(amount?.toString());
  }, [price]);

  const reset = () => {
    setResidualBalance(
      fromSatoshiFixed(
        balance.amount,
        balance.precision,
        balance.precision,
        balance.ticker === 'L-BTC' ? lbtcUnit : undefined,
      ),
    );
    if (price) setFiat('0.00');
    onAmountChange(undefined);
  };

  const handleAmountChange = (value: string | undefined | null) => {
    if (!value) {
      reset();
      return;
    }

    const val = parseFloat(value.replace(',', '.'));
    onAmountChange(val);
    const residualAmount =
      fromSatoshi(
        balance.amount,
        balance.precision,
        balance.ticker === 'L-BTC' ? lbtcUnit : undefined,
      ) - val;
    setResidualBalance(
      residualAmount.toLocaleString('en-US', {
        maximumFractionDigits: balance.precision,
        useGrouping: false,
      }),
    );
    if (price)
      setFiat(
        (
          toLBTCwithUnit(
            val,
            balance.ticker === 'L-BTC' ? lbtcUnit : undefined,
          ) * price
        ).toFixed(2),
      );
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
              value={amount}
              type="number"
              inputmode="decimal"
              placeholder="0.00"
              className="amount-input"
              autofocus={true}
              onIonChange={e => handleAmountChange(e.detail.value)}
              color={error && 'danger'}
              debounce={200}
              onKeyDown={onPressEnterKeyCloseKeyboard}
              enterkeyhint="done"
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
