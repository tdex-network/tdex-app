import { connect } from 'react-redux';
import TradeHistory from '../../pages/TradeHistory';
import { tradeTransactionsSelector } from '../reducers/transactionsReducer';

const mapStateToProps = (state: any) => {
  return {
    swaps: tradeTransactionsSelector(state),
  };
};

export default connect(mapStateToProps)(TradeHistory);
