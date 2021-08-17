import { connect } from 'react-redux';

import ElectrumServer from '../../pages/ElectrumServer';

const mapStateToProps = (state: any) => {
  return {
    explorerUrl: state.settings.explorerUrl,
  };
};

export default connect(mapStateToProps)(ElectrumServer);
