import { connect } from 'react-redux';

import Withdrawal from '../../pages/Withdrawal';
import { allUtxosSelector, balancesSelector } from '../reducers/walletReducer';

const mapStateToProps = (state: any) => {
  return {
    balances: balancesSelector(state),
    utxos: allUtxosSelector(state),
    prices: state.rates.prices,
    explorerURL: state.settings.explorerUrl,
  };
};

export default connect(mapStateToProps)(Withdrawal);
