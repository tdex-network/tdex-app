import React from 'react';
import classNames from 'classnames';
import './style.scss';
import { IconBTC } from '../icons';

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
          <span className="icon-wrapper medium">
            <IconBTC width="24px" height="24px"></IconBTC>
          </span>
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
