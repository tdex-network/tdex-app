import { connect } from 'react-redux';

import TradeHistory from '../../pages/TradeHistory';
import { compareTxDisplayInterfaceByDate } from '../../utils/helpers';
import { tradeTransactionsSelector } from '../reducers/transactionsReducer';
import type { RootState } from '../store';

const mapStateToProps = (state: RootState) => {
  return {
    swaps: tradeTransactionsSelector(state).sort(compareTxDisplayInterfaceByDate),
  };
};

export default connect(mapStateToProps)(TradeHistory);
