import { connect } from 'react-redux';
import Exchange from '../../pages/Exchange';
import { getTradablesAssets } from '../../utils/tdex';
import { allAssets } from '../reducers/tdexReducer';
import { balancesSelector, allUtxosSelector } from '../reducers/walletReducer';

const mapStateToProps = (state: any) => {
  return {
    balances: balancesSelector(state).filter(
      (b) =>
        b.amount > 0 &&
        getTradablesAssets(state.tdex.markets, b.asset).length > 0
    ),
    explorerUrl: state.settings.explorerUrl,
    markets: state.tdex.markets,
    utxos: allUtxosSelector(state),
    assets: state.assets,
    allAssets: allAssets(state),
  };
};

export default connect(mapStateToProps)(Exchange);
