import React, { useEffect, useState } from 'react';
import { CurrencyIcon } from '../icons';
import {
  IonInput,
  IonText,
  useIonViewDidEnter,
  useIonViewDidLeave,
} from '@ionic/react';
import { useDispatch, useSelector } from 'react-redux';
import { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import {
  fromSatoshi,
  fromSatoshiFixed,
  toLBTCwithUnit,
} from '../../utils/helpers';
import { updatePrices } from '../../redux/actions/ratesActions';
import {
  onPressEnterKeyCloseKeyboard,
  setAccessoryBar,
} from '../../utils/keyboard';
import './style.scss';

interface WithdrawRowInterface {
  balance: BalanceInterface;
  price: number | undefined;
  onAmountChange: (amount: number | undefined) => void;
  error: string;
}

const WithdrawRow: React.FC<WithdrawRowInterface> = ({
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
      balance.ticker === 'L-BTC' ? lbtcUnit : undefined
    )
  );
  const [fiat, setFiat] = useState<string>('0.00');

  const dispatch = useDispatch();

  useIonViewDidEnter(() => {
    setAccessoryBar(true);
  });

  useIonViewDidLeave(() => {
    setAccessoryBar(false);
  });

  useEffect(() => {
    dispatch(updatePrices());
  }, []);

  const reset = () => {
    setResidualBalance(
      fromSatoshiFixed(
        balance.amount,
        balance.precision,
        balance.precision,
        balance.ticker === 'L-BTC' ? lbtcUnit : undefined
      )
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
        balance.ticker === 'L-BTC' ? lbtcUnit : undefined
      ) - val;
    setResidualBalance(
      residualAmount.toLocaleString(undefined, {
        maximumFractionDigits: balance.precision,
      })
    );
    if (price)
      setFiat(
        (
          toLBTCwithUnit(
            val,
            balance.ticker === 'L-BTC' ? lbtcUnit : undefined
          ) * price
        ).toFixed(2)
      );
  };

  return (
    <div className="exchange-coin-container">
      <div className="exchanger-row">
        <div className="coin-name">
          <span className="icon-wrapper">
            <CurrencyIcon currency={balance.ticker} />
          </span>
          <p className="ticker">
            {balance.ticker === 'L-BTC'
              ? lbtcUnit
              : balance.ticker.toUpperCase()}
          </p>
        </div>
        <div className="ion-text-end">
          <IonInput
            inputmode="decimal"
            placeholder="0.00"
            className="amount-input"
            autofocus={true}
            onIonChange={(e) => handleAmountChange(e.detail.value)}
            color={error && 'danger'}
            debounce={200}
            onKeyDown={onPressEnterKeyCloseKeyboard}
            enterkeyhint="done"
          />
        </div>
      </div>
      <div className="exchanger-row sub-row">
        <div>
          {!error && (
            <p>
              Residual balance: {residualBalance ? residualBalance : ''}{' '}
              {balance.ticker === 'L-BTC'
                ? lbtcUnit
                : balance.ticker.toUpperCase()}{' '}
            </p>
          )}
        </div>
        <div>
          {error ? (
            <IonText color="danger">{error}</IonText>
          ) : (
            <p>
              {fiat} {currency && currency.toUpperCase()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawRow;
