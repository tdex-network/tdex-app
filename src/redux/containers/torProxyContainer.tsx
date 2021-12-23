import { connect } from 'react-redux';

import TorProxy from '../../pages/TorProxy';
import type { RootState } from '../types';

const mapStateToProps = (state: RootState) => {
  return {
    torProxy: state.settings.torProxy,
  };
};

export default connect(mapStateToProps)(TorProxy);
