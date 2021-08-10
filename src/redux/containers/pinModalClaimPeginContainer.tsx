import { connect } from 'react-redux';

import PinModalClaimPegin from '../../components/PinModal/PinModalClaimPegin';

const mapStateToProps = (state: any) => {
  return {
    currentBtcBlockHeight: state.btc.currentBlockHeight,
    explorerBitcoinUrl: state.settings.explorerBitcoinUrl,
    explorerUrl: state.settings.explorerUrl,
    modalClaimPegins: state.btc.modalClaimPegins,
    pegins: state.btc.pegins,
  };
};

export default connect(mapStateToProps)(PinModalClaimPegin);
