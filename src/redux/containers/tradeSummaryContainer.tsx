import { connect } from 'react-redux';

import TradeSummary from '../../pages/TradeSummary';
import type { RootState } from '../store';

const mapStateToProps = (state: RootState) => {
  return {
    assets: state.assets,
  };
};

export default connect(mapStateToProps)(TradeSummary);
