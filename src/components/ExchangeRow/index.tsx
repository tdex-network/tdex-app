import React from 'react';
import classNames from 'classnames';
import './style.scss';

interface ExchangeRowInterface {
  className?: string;
  setOpenSearch?: any;
}

const ExchangeRow: React.FC<ExchangeRowInterface> = ({
  className,
  setOpenSearch,
}) => {
  return (
    <div className={classNames('exchange-coin-container', className)}>
      <div className="exchanger-row">
        <div className="coin-name" onClick={() => setOpenSearch(true)}>
          <img src="../../assets/img/btc.png" />
          <p>BTC</p>
        </div>
        <div className="coin-amount">
          <p>0</p>
        </div>
      </div>
      <div className="exchanger-row sub-row">
        <div>
          <p>Total balance: 3,00 BTC </p>
        </div>
        <div>
          <p>1BTC = 124124 EUR</p>
        </div>
      </div>
    </div>
  );
};

export default ExchangeRow;
