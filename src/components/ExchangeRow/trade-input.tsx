
import React from 'react';

import TradeRowInput from './trade-row-input';

const ERROR_BALANCE_TOO_LOW = 'Amount is greater than your balance';

interface ExchangeRowsProps {
  
}

const TradeInput: React.FC<ExchangeRowsProps> = ({

}) => {

  return (
    <>
      <TradeRowInput
        type='send'
        value={}
        isLoading={isLoading}
        error={error}

      ></TradeRowInput>
    </>
  );
};

export default ExchangeRow;
