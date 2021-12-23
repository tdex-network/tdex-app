import { connect } from 'react-redux';

import type { RootState } from '../../index';
import TorProxy from '../../pages/TorProxy';

const mapStateToProps = (state: RootState) => {
  return {
    torProxy: state.settings.torProxy,
  };
};

export default connect(mapStateToProps)(TorProxy);
