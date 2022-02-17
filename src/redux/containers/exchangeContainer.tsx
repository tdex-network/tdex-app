import { connect } from 'react-redux';

import Exchange from '../../pages/Exchange';
import { unlockedUtxosSelector, lastUsedIndexesSelector } from '../reducers/walletReducer';
import type { RootState } from '../types';

const mapStateToProps = (state: RootState) => {
  return {
    explorerLiquidAPI: state.settings.explorerLiquidAPI,
    isFetchingMarkets: state.app.isFetchingMarkets,
    lastUsedIndexes: lastUsedIndexesSelector(state),
    markets: state.tdex.markets,
    network: state.settings.network,
    providers: state.tdex.providers,
    torProxy: state.settings.torProxy,
    utxos: unlockedUtxosSelector(state),
  };
};

export default connect(mapStateToProps)(Exchange);
