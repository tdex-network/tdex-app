import { connect } from 'react-redux';

import Explorers from '../../pages/Explorers';

const mapStateToProps = (state: any) => {
  return {
    explorerLiquidAPI: state.settings.explorerLiquidAPI,
    explorerBitcoinAPI: state.settings.explorerBitcoinAPI,
    explorerLiquidUI: state.settings.explorerLiquidUI,
    explorerBitcoinUI: state.settings.explorerBitcoinUI,
  };
};

export default connect(mapStateToProps)(Explorers);
