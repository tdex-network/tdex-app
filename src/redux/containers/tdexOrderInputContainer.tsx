import { connect } from 'react-redux';

import TdexOrderInput from '../../components/TdexOrderInput';
import { getTradablesAssets } from '../../utils/tdex';
import { balancesSelector } from '../reducers/walletReducer';
import type { RootState } from '../types';

const mapStateToProps = (state: RootState) => {
  return {
    assetsRegistry: state.assets,
    balances: balancesSelector(state).filter(
      (b) => b.amount > 0 && getTradablesAssets(state.tdex.markets, b.assetHash).length > 0
    ),
    lbtcUnit: state.settings.denominationLBTC,
    network: state.settings.network,
  };
};

export default connect(mapStateToProps)(TdexOrderInput);
