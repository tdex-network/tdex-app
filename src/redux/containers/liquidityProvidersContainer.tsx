import { connect } from 'react-redux';
import LiquidityProvider from '../../pages/LiquidityProvider';

const mapStateToProps = (state: any) => {
  return {
    providers: state.tdex.providers,
  };
};

export default connect(mapStateToProps)(LiquidityProvider);
