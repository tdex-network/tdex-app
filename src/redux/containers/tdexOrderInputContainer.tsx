import { connect } from 'react-redux';

import TdexOrderInput from '../../components/TdexOrderInput';
import type { RootState } from '../types';

const mapStateToProps = (state: RootState) => {
  return {
    assetsRegistry: state.assets,
    lbtcUnit: state.settings.denominationLBTC,
  };
};

export default connect(mapStateToProps)(TdexOrderInput);
