import { connect } from 'react-redux';
import Withdrawal from '../../pages/Withdrawal';

import {
  allUtxosSelector,
  balancesSelector,
  getCoinSelector,
} from '../reducers/walletReducer';

const mapStateToProps = (state: any) => {
  return {
    balances: balancesSelector(state),
    coinSelector: getCoinSelector(state),
    utxos: allUtxosSelector(state),
    prices: state.rates.prices,
    explorerURL: state.settings.explorerUrl,
  };
};

export default connect(mapStateToProps)(Withdrawal);
