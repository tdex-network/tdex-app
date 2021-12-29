import { connect } from 'react-redux';

import ExchangeRow from '../../components/ExchangeRow';
import { balancesSelector } from '../reducers/walletReducer';
import type { RootState } from '../types';

const mapStateToProps = (state: RootState) => {
  return {
    assets: state.assets,
    balances: balancesSelector(state),
    currency: state.settings.currency.value,
    lbtcUnit: state.settings.denominationLBTC,
    prices: state.rates.prices,
  };
};

export default connect(mapStateToProps)(ExchangeRow);
