import { connect } from 'react-redux';

import ClaimPegin from '../../pages/ClaimPegin';

const mapStateToProps = (state: any) => {
  return {
    currentBtcBlockHeight: state.btc.currentBlockHeight,
    explorerLiquidUI: state.settings.explorerLiquidUI,
    explorerBitcoinUrl: state.settings.explorerBitcoinUrl,
    pegins: state.btc.pegins,
    toasts: state.toasts,
  };
};

export default connect(mapStateToProps)(ClaimPegin);
