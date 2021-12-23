import { connect } from 'react-redux';

import type { RootState } from '../../index';
import Operations from '../../pages/Operations';
import { depositPeginUtxosToDisplayTxSelector } from '../reducers/btcReducer';
import { balancesSelector } from '../reducers/walletReducer';

const mapStateToProps = (state: RootState) => {
  return {
    balances: balancesSelector(state),
    prices: state.rates.prices,
    currency: state.settings.currency.value,
    lbtcUnit: state.settings.denominationLBTC,
    btcTxs: depositPeginUtxosToDisplayTxSelector(state),
    currentBtcBlockHeight: state.btc.currentBlockHeight,
    pegins: state.btc.pegins,
    explorerLiquidAPI: state.settings.explorerLiquidAPI,
    explorerBitcoinAPI: state.settings.explorerBitcoinAPI,
  };
};

export default connect(mapStateToProps)(Operations);
