import { connect } from 'react-redux';

import TorProxy from '../../pages/TorProxy';

const mapStateToProps = (state: any) => {
  return {
    torProxy: state.settings.torProxy,
  };
};

export default connect(mapStateToProps)(TorProxy);
