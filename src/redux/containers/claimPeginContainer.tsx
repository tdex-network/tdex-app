import { connect } from 'react-redux';

import ClaimPegin from '../../pages/ClaimPegin';

const mapStateToProps = (state: any) => {
  return {
    explorerUrl: state.settings.explorerUrl,
    explorerBitcoinUrl: state.settings.explorerBitcoinUrl,
    peginAddresses: state.wallet.peginAddresses,
  };
};

export default connect(mapStateToProps)(ClaimPegin);
