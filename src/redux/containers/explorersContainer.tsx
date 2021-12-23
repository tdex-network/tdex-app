import { connect } from 'react-redux';

import Explorers from '../../pages/Explorers';
import type { RootState } from '../types';

const mapStateToProps = (state: RootState) => {
  return {
    explorerLiquidAPI: state.settings.explorerLiquidAPI,
    explorerBitcoinAPI: state.settings.explorerBitcoinAPI,
    explorerLiquidUI: state.settings.explorerLiquidUI,
    explorerBitcoinUI: state.settings.explorerBitcoinUI,
    network: state.settings.network,
  };
};

export default connect(mapStateToProps)(Explorers);
