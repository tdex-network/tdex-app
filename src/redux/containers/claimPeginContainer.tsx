import { connect } from 'react-redux';

import ClaimPegin from '../../pages/ClaimPegin';

const mapStateToProps = (state: any) => {
  return {
    pegins: state.btc.pegins,
    explorerUrl: state.settings.explorerUrl,
    explorerBitcoinUrl: state.settings.explorerBitcoinUrl,
    toasts: state.toasts,
  };
};

export default connect(mapStateToProps)(ClaimPegin);
