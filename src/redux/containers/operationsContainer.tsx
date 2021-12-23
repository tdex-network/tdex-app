import { connect } from 'react-redux';

import Operations from '../../pages/Operations';
import { depositPeginUtxosToDisplayTxSelector } from '../reducers/btcReducer';
import { balancesSelector } from '../reducers/walletReducer';
import type { RootState } from '../types';

const mapStateToProps = (state: RootState) => {
  return {
    balances: balancesSelector(state),
    btcTxs: depositPeginUtxosToDisplayTxSelector(state),
    currentBtcBlockHeight: state.btc.currentBlockHeight,
    currency: state.settings.currency.value,
    explorerLiquidAPI: state.settings.explorerLiquidAPI,
    explorerBitcoinAPI: state.settings.explorerBitcoinAPI,
    lbtcUnit: state.settings.denominationLBTC,
    network: state.settings.network,
    pegins: state.btc.pegins,
    prices: state.rates.prices,
  };
};

export default connect(mapStateToProps)(Operations);
