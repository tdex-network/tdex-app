import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import './style.scss';
import { CurrencyIcon } from '../icons';
import { IonInput } from '@ionic/react';
import { fromSatoshi, toSatoshi } from '../../utils/helpers';
import { useSelector } from 'react-redux';

interface WithdrawRowInterface {
  className?: string;
  setOpenSearch?: any;
  asset?: any;
  setAmount: any;
  amount: any;
  residualBalance: any;
  setResidualBalance: any;
  checkValidData: any;
}

const WithdrawRow: React.FC<WithdrawRowInterface> = ({
  className,
  setOpenSearch,
  asset,
  setAmount,
  amount,
  setResidualBalance,
  residualBalance,
  checkValidData,
}) => {
  const { currency } = useSelector((state: any) => ({
    currency: state.settings.currency,
  }));
  const [priceEquivalent, setPriceEquivalent] = useState<any>('0');
  useEffect(() => {
    if (asset && !residualBalance) {
      setResidualBalance(
        fromSatoshi(Number(asset.amount), asset.precision).toString()
      );
    }
  }, [asset]);

  const handleAmountChange = (value: string | undefined | null) => {
    let inputValue = value;
    if (!value) {
      inputValue = '0';
      setPriceEquivalent('0');
    } else {
      // TODO handle price
      setPriceEquivalent(10);
    }
    setAmount(value);
    const balance = fromSatoshi(
      Number(asset.amount) - toSatoshi(Number(inputValue), asset.precision),
      asset.precision
    );
    setResidualBalance(balance);
    checkValidData(residualBalance, inputValue);
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
          <p>
            {priceEquivalent} {currency && currency.toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WithdrawRow;
