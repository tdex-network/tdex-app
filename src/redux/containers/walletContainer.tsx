import { connect } from 'react-redux';

import Wallet from '../../pages/Wallet';
import { balancesSelector } from '../reducers/walletReducer';

const mapStateToProps = (state: any) => {
  return {
    balances: balancesSelector(state),
  };
};

export default connect(mapStateToProps)(Wallet);
