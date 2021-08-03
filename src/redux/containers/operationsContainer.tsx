import { connect } from 'react-redux';

import Operations from '../../pages/Operations';
import { depositPeginUtxosToDisplayTxSelector } from '../reducers/btcReducer';
import { balancesSelector } from '../reducers/walletReducer';

const mapStateToProps = (state: any) => {
  return {
    balances: balancesSelector(state),
    prices: state.rates.prices,
    currency: state.settings.currency.value,
    lbtcUnit: state.settings.denominationLBTC,
    btcTxs: depositPeginUtxosToDisplayTxSelector(state),
    currentBtcBlockHeight: state.btc.currentBlockHeight,
  };
};

export default connect(mapStateToProps)(Operations);
