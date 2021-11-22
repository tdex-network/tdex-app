import { connect } from 'react-redux';

import Wallet from '../../pages/Wallet';
import { aggregatedLBTCBalanceSelector, balancesSelector } from '../reducers/walletReducer';
import type { RootState } from '../store';

const mapStateToProps = (state: RootState) => {
  return {
    backupDone: state.app.backupDone,
    balances: balancesSelector(state),
    currency: state.settings.currency.value,
    isFetchingUtxos: state.app.isFetchingUtxos,
    lbtcUnit: state.settings.denominationLBTC,
    prices: state.rates.prices,
    totalLBTC: aggregatedLBTCBalanceSelector(state),
  };
};

export default connect(mapStateToProps)(Wallet);
