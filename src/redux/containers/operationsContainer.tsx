import { connect } from 'react-redux';
import Operations from '../../pages/Operations';
import { transactionsByAssetSelector } from '../reducers/transactionsReducer';

import { balancesSelector } from '../reducers/walletReducer';

const mapStateToProps = (state: any) => {
  return {
    balances: balancesSelector(state),
    transactionsByAsset: transactionsByAssetSelector(state),
    prices: state.rates.prices,
  };
};

export default connect(mapStateToProps)(Operations);
