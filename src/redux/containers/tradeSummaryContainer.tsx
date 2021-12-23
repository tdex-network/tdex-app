import { connect } from 'react-redux';

import type { RootState } from '../../index';
import TradeSummary from '../../pages/TradeSummary';

const mapStateToProps = (state: RootState) => {
  return {
    assets: state.assets,
  };
};

export default connect(mapStateToProps)(TradeSummary);
