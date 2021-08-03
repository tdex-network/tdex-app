import { connect } from 'react-redux';

import ClaimPegin from '../../pages/ClaimPegin';

const mapStateToProps = (state: any) => {
  return {
    addresses: state.wallet.addresses,
    explorerUrl: state.settings.explorerUrl,
    explorerBitcoinUrl: state.settings.explorerBitcoinUrl,
    pegins: state.btc.pegins,
  };
};

export default connect(mapStateToProps)(ClaimPegin);
