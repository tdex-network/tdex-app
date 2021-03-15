import { connect } from 'react-redux';
import Exchange from '../../pages/Exchange';

import { balancesSelector } from '../reducers/walletReducer';

const mapStateToProps = (state: any) => {
  return {
    balances: balancesSelector(state).filter((b) => b.amount > 0),
    explorerUrl: state.settings.explorerUrl,
    markets: state.tdex.markets,
  };
};

export default connect(mapStateToProps)(Exchange);
