import { connect } from 'react-redux';

import ClaimPegin from '../../pages/ClaimPegin';
import type { RootState } from '../types';

const mapStateToProps = (state: RootState) => {
  return {
    currentBtcBlockHeight: state.btc.currentBlockHeight,
    explorerLiquidUI: state.settings.explorerLiquidUI,
    explorerBitcoinAPI: state.settings.explorerBitcoinAPI,
    explorerLiquidAPI: state.settings.explorerLiquidAPI,
    network: state.settings.network,
    pegins: state.btc.pegins,
    toasts: state.toasts,
  };
};

export default connect(mapStateToProps)(ClaimPegin);
