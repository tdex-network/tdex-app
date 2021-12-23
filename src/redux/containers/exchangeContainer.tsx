import { connect } from 'react-redux';

import type { RootState } from '../../index';
import Exchange from '../../pages/Exchange';
import { getTradablesAssets } from '../../utils/tdex';
import { allAssets } from '../reducers/tdexReducer';
import { allUtxosSelector, balancesSelector, lastUsedIndexesSelector } from '../reducers/walletReducer';

const mapStateToProps = (state: RootState) => {
  return {
    assets: state.assets,
    allAssets: allAssets(state),
    balances: balancesSelector(state).filter(
      (b) => b.amount > 0 && getTradablesAssets(state.tdex.markets, b.asset).length > 0
    ),
    explorerLiquidAPI: state.settings.explorerLiquidAPI,
    lastUsedIndexes: lastUsedIndexesSelector(state),
    lbtcUnit: state.settings.denominationLBTC,
    markets: state.tdex.markets,
    utxos: allUtxosSelector(state),
    torProxy: state.settings.torProxy,
  };
};

export default connect(mapStateToProps)(Exchange);
