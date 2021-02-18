import React, { useState } from 'react';
import './style.scss';
import { CurrencyIcon } from '../icons';
import { IonInput } from '@ionic/react';
import { useSelector } from 'react-redux';
import { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';

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

  const reset = () => {
    setInputAmount(0);
    setResidualBalance(balance.amount);
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
    setResidualBalance(balance.amount - val);
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
        <div className="coin-amount">
          <IonInput
            type="number"
            value={inputAmount}
            placeholder="0"
            className="amount-input"
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
