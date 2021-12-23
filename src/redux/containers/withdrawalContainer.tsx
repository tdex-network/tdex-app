import { connect } from 'react-redux';

import Withdrawal from '../../pages/Withdrawal';
import { allUtxosSelector, balancesSelector, lastUsedIndexesSelector } from '../reducers/walletReducer';
import type { RootState } from '../types';

const mapStateToProps = (state: RootState) => {
  return {
    balances: balancesSelector(state),
    explorerLiquidAPI: state.settings.explorerLiquidAPI,
    lastUsedIndexes: lastUsedIndexesSelector(state),
    lbtcUnit: state.settings.denominationLBTC,
    network: state.settings.network,
    prices: state.rates.prices,
    utxos: allUtxosSelector(state),
  };
};

export default connect(mapStateToProps)(Withdrawal);
