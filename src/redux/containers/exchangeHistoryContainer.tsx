import { connect } from 'react-redux';

import TradeHistory from '../../pages/TradeHistory';
import { compareTxDisplayInterfaceByDate } from '../../utils/helpers';
import { tradeTransactionsSelector } from '../reducers/transactionsReducer';

const mapStateToProps = (state: any) => {
  return {
    swaps: tradeTransactionsSelector(state).sort(compareTxDisplayInterfaceByDate),
  };
};

export default connect(mapStateToProps)(TradeHistory);
