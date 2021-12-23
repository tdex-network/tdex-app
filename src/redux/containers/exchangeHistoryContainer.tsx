import { connect } from 'react-redux';

import type { RootState } from '../../index';
import TradeHistory from '../../pages/TradeHistory';
import { compareTxDisplayInterfaceByDate } from '../../utils/helpers';
import { tradeTransactionsSelector } from '../reducers/transactionsReducer';

const mapStateToProps = (state: RootState) => {
  return {
    swaps: tradeTransactionsSelector(state).sort(compareTxDisplayInterfaceByDate),
    explorerLiquidUI: state.settings.explorerLiquidUI,
  };
};

export default connect(mapStateToProps)(TradeHistory);
