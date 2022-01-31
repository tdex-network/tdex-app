import { connect } from 'react-redux';

import TradeHistory from '../../pages/TradeHistory';
import { compareTxDisplayInterfaceByDate } from '../../utils/helpers';
import { tradeTransactionsSelector } from '../reducers/transactionsReducer';
import type { RootState } from '../types';

const mapStateToProps = (state: RootState) => {
  return {
    assets: state.assets,
    explorerLiquidUI: state.settings.explorerLiquidUI,
    network: state.settings.network,
    swaps: tradeTransactionsSelector(state).sort(compareTxDisplayInterfaceByDate),
  };
};

export default connect(mapStateToProps)(TradeHistory);
