import { connect } from 'react-redux';

import type { RootState } from '../../index';
import LiquidityProvider from '../../pages/LiquidityProvider';

const mapStateToProps = (state: RootState) => {
  return {
    providers: state.tdex.providers,
  };
};

export default connect(mapStateToProps)(LiquidityProvider);
