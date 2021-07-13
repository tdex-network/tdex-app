import { connect } from 'react-redux';

import Exchange from '../../pages/Exchange';
import { getTradablesAssets } from '../../utils/tdex';
import { allAssets } from '../reducers/tdexReducer';
import {
  allUtxosSelector,
  balancesSelector,
  lastUsedIndexesSelector,
} from '../reducers/walletReducer';

const mapStateToProps = (state: any) => {
  return {
    assets: state.assets,
    allAssets: allAssets(state),
    balances: balancesSelector(state).filter(
      b =>
        b.amount > 0 &&
        getTradablesAssets(state.tdex.markets, b.asset).length > 0,
    ),
    explorerUrl: state.settings.explorerUrl,
    lastUsedIndexes: lastUsedIndexesSelector(state),
    lbtcUnit: state.settings.denominationLBTC,
    markets: state.tdex.markets,
    utxos: allUtxosSelector(state),
  };
};

export default connect(mapStateToProps)(Exchange);
