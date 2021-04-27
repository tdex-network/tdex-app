import { connect } from 'react-redux';

import Wallet from '../../pages/Wallet';
import {
  aggregatedLBTCBalanceSelector,
  balancesSelector,
} from '../reducers/walletReducer';

const mapStateToProps = (state: any) => {
  return {
    totalLBTC: aggregatedLBTCBalanceSelector(state),
    balances: balancesSelector(state),
    prices: state.rates.prices,
    currency: state.settings.currency.value,
    backupDone: state.app.backupDone,
  };
};

export default connect(mapStateToProps)(Wallet);
