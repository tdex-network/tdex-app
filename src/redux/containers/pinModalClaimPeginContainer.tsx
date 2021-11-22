import { connect } from 'react-redux';

import PinModalClaimPegin from '../../components/PinModal/PinModalClaimPegin';
import type { RootState } from '../store';

const mapStateToProps = (state: RootState) => {
  return {
    currentBtcBlockHeight: state.btc.currentBlockHeight,
    explorerBitcoinAPI: state.settings.explorerBitcoinAPI,
    explorerLiquidAPI: state.settings.explorerLiquidAPI,
    modalClaimPegins: state.btc.modalClaimPegins,
    pegins: state.btc.pegins,
  };
};

export default connect(mapStateToProps)(PinModalClaimPegin);
