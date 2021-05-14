import React, { useEffect, useState } from 'react';
import { CurrencyIcon } from '../icons';
import {
  IonIcon,
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
import { chevronDownOutline } from 'ionicons/icons';
import classNames from 'classnames';

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
              type="number"
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
              {fiat} {currency && currency.toUpperCase()}
            </span>
          )}
        </span>
      </div>
    </div>
  );
};

export default WithdrawRow;
