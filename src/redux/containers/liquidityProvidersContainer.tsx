import { connect } from 'react-redux';

import LiquidityProvider from '../../pages/LiquidityProvider';
import type { RootState } from '../types';

const mapStateToProps = (state: RootState) => {
  return {
    network: state.settings.network,
    providers: state.tdex.providers,
  };
};

export default connect(mapStateToProps)(LiquidityProvider);
