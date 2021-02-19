import React, { useEffect, useState } from 'react';
import './style.scss';
import { CurrencyIcon } from '../icons';
import { IonInput } from '@ionic/react';
import { useDispatch, useSelector } from 'react-redux';
import { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import { fromSatoshi } from '../../utils/helpers';
import { updateRates } from '../../redux/actions/ratesActions';

interface WithdrawRowInterface {
  balance: BalanceInterface;
  price: number | undefined;
  onAmountChange: (amount: number | undefined) => void;
}

const WithdrawRow: React.FC<WithdrawRowInterface> = ({
  balance,
  price,
  onAmountChange,
}) => {
  const currency = useSelector((state: any) => state.settings.currency);
  const [residualBalance, setResidualBalance] = useState(balance.amount);
  const [inputAmount, setInputAmount] = useState(0);
  const [fiat, setFiat] = useState<number | string>('??');

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(updateRates());
  }, []);

  const reset = () => {
    setInputAmount(0);
    setResidualBalance(fromSatoshi(balance.amount));
    if (price) setFiat(0);
    onAmountChange(undefined);
  };

  const handleAmountChange = (value: string | undefined | null) => {
    if (!value) {
      reset();
      return;
    }

    const val = parseFloat(value);
    setInputAmount(val);
    setResidualBalance(fromSatoshi(balance.amount) - val);
    if (price) setFiat(val * price);
    onAmountChange(val);
  };

  return (
    <div className="exchange-coin-container">
      <div className="exchanger-row">
        <div className="coin-name">
          <span className="icon-wrapper medium">
            <CurrencyIcon currency={balance.ticker} />
          </span>
          <p>{balance.ticker.toUpperCase()}</p>
        </div>
        <div className="ion-text-end">
          <IonInput
            type="number"
            value={inputAmount || ''}
            placeholder="0.00"
            className="amount-input"
            autofocus={true}
            required={true}
            onIonChange={(e) => handleAmountChange(e.detail.value)}
          />
        </div>
      </div>
      <div className="exchanger-row sub-row">
        <div>
          <p>
            Residual balance: {residualBalance ? residualBalance : ''}{' '}
            {balance.ticker.toUpperCase()}{' '}
          </p>
        </div>
        <div>
          <p>
            {fiat} {currency && currency.toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WithdrawRow;
