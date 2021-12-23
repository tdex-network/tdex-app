import { connect } from 'react-redux';

import PinModalClaimPegin from '../../components/PinModal/PinModalClaimPegin';
import type { RootState } from '../types';

const mapStateToProps = (state: RootState) => {
  return {
    currentBtcBlockHeight: state.btc.currentBlockHeight,
    explorerBitcoinAPI: state.settings.explorerBitcoinAPI,
    explorerLiquidAPI: state.settings.explorerLiquidAPI,
    modalClaimPegins: state.btc.modalClaimPegins,
    network: state.settings.network,
    pegins: state.btc.pegins,
  };
};

export default connect(mapStateToProps)(PinModalClaimPegin);
