import { connect } from 'react-redux';
import Withdrawal from '../../pages/Withdrawal';

import { balancesSelector } from '../reducers/walletReducer';

const mapStateToProps = (state: any) => {
  return {
    balances: balancesSelector(state),
  };
};

export default connect(mapStateToProps)(Withdrawal);
