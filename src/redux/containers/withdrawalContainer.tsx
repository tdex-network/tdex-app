import { connect } from 'react-redux';

import Withdrawal from '../../pages/Withdrawal';
import { allUtxosSelector, balancesSelector, lastUsedIndexesSelector } from '../reducers/walletReducer';

const mapStateToProps = (state: any) => {
  return {
    balances: balancesSelector(state),
    explorerLiquidAPI: state.settings.explorerLiquidAPI,
    lastUsedIndexes: lastUsedIndexesSelector(state),
    lbtcUnit: state.settings.denominationLBTC,
    prices: state.rates.prices,
    utxos: allUtxosSelector(state),
  };
};

export default connect(mapStateToProps)(Withdrawal);
