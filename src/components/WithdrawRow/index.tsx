import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import './style.scss';
import { CurrencyIcon } from '../icons';
import { IonInput } from '@ionic/react';
import { fromSatoshi, toSatoshi } from '../../utils/helpers';

interface WithdrawRowInterface {
  className?: string;
  setOpenSearch?: any;
  asset?: any;
  setAmount: any;
  amount: any;
}

const WithdrawRow: React.FC<WithdrawRowInterface> = ({
  className,
  setOpenSearch,
  asset,
  setAmount,
  amount,
}) => {
  const [residualBalance, setResidualBalance] = useState<any>();

  useEffect(() => {
    if (asset && !residualBalance) {
      console.log(fromSatoshi(Number(asset.amount), asset.precision));
      setResidualBalance(
        fromSatoshi(Number(asset.amount), asset.precision).toString()
      );
    }
  }, [asset]);

  useEffect(() => {
    console.log('residualBalance');
    console.log(residualBalance);
  }, [residualBalance]);

  const handleAmountChange = (value: string | undefined | null) => {
    let inputValue = value;
    if (!value) {
      inputValue = '0';
    }
    setAmount(value);
    const balance = fromSatoshi(
      Number(asset.amount) - toSatoshi(Number(inputValue), asset.precision),
      asset.precision
    );
    setResidualBalance(balance);
  };

  return (
    <div className={classNames('exchange-coin-container', className)}>
      <div className="exchanger-row">
        <div className="coin-name" onClick={() => setOpenSearch(true)}>
          <span className="icon-wrapper medium">
            <CurrencyIcon currency={asset?.ticker} />
          </span>
          <p>{asset?.ticker.toUpperCase()}</p>
        </div>
        <div className="coin-amount">
          <IonInput
            type="number"
            value={amount}
            placeholder="0"
            className="amount-input"
            onIonChange={(e) => {
              handleAmountChange(e.detail.value);
            }}
          />
        </div>
      </div>
      <div className="exchanger-row sub-row">
        <div>
          <p>
            Residual balance: {residualBalance ? residualBalance : ''}{' '}
            {asset?.ticker.toUpperCase()}{' '}
          </p>
        </div>
        <div>
          <p>1BTC = 124124 EUR</p>
        </div>
      </div>
    </div>
  );
};

export default WithdrawRow;
