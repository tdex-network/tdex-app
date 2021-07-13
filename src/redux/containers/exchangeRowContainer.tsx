import { connect } from 'react-redux';

import ExchangeRow from '../../components/ExchangeRow';
import { balancesSelector } from '../reducers/walletReducer';

const mapStateToProps = (state: any) => {
  return {
    assets: state.assets,
    balances: balancesSelector(state),
    currency: state.settings.currency.value,
    lbtcUnit: state.settings.denominationLBTC,
    prices: state.rates.prices,
  };
};

export default connect(mapStateToProps)(ExchangeRow);
