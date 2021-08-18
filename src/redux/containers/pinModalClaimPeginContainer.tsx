import { connect } from 'react-redux';

import PinModalClaimPegin from '../../components/PinModal/PinModalClaimPegin';

const mapStateToProps = (state: any) => {
  return {
    currentBtcBlockHeight: state.btc.currentBlockHeight,
    explorerBitcoinAPI: state.settings.explorerBitcoinAPI,
    explorerLiquidAPI: state.settings.explorerLiquidAPI,
    modalClaimPegins: state.btc.modalClaimPegins,
    pegins: state.btc.pegins,
  };
};

export default connect(mapStateToProps)(PinModalClaimPegin);
