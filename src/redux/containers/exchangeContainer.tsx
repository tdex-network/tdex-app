import { connect } from 'react-redux';

import type { ExchangeConnectedProps } from '../../pages/Exchange';
import Exchange from '../../pages/Exchange';
import { allUtxosSelector, lastUsedIndexesSelector } from '../reducers/walletReducer';
import type { RootState } from '../store';

const mapStateToProps = (state: RootState): ExchangeConnectedProps => {
  return {
    assets: state.assets,
    explorerLiquidAPI: state.settings.explorerLiquidAPI,
    lastUsedIndexes: lastUsedIndexesSelector(state),
    lbtcUnit: state.settings.denominationLBTC,
    markets: state.tdex.markets,
    utxos: allUtxosSelector(state),
    torProxy: state.settings.torProxy,
  };
};

export default connect(mapStateToProps)(Exchange);
