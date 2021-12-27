import { connect } from 'react-redux';

import TradeSummary from '../../pages/TradeSummary';
import type { RootState } from '../types';

const mapStateToProps = (state: RootState) => {
  return {
    network: state.settings.network,
  };
};

export default connect(mapStateToProps)(TradeSummary);
