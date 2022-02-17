import { connect } from 'react-redux';

import TdexOrderInput from '../../components/TdexOrderInput';
import { selectAllTradableAssets } from '../reducers/tdexReducer';
import type { RootState } from '../types';

const mapStateToProps = (state: RootState) => {
  return {
    assetsRegistry: state.assets,
    allTradableAssets: selectAllTradableAssets(state),
    lbtcUnit: state.settings.denominationLBTC,
  };
};

export default connect(mapStateToProps)(TdexOrderInput);
