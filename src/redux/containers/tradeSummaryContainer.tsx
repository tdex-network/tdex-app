import { connect } from 'react-redux';
import TradeSummary from '../../pages/TradeSummary';

const mapStateToProps = (state: any) => {
  return {
    assets: state.assets,
  };
};

export default connect(mapStateToProps)(TradeSummary);
