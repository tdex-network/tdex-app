import { connect } from 'react-redux';

import LiquidityProvider from '../../pages/LiquidityProvider';
import type { RootState } from '../store';

const mapStateToProps = (state: RootState) => {
  return {
    providers: state.tdex.providers,
  };
};

export default connect(mapStateToProps)(LiquidityProvider);
