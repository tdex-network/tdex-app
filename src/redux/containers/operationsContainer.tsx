import { connect } from 'react-redux';
import Operations from '../../pages/Operations';

import { balancesSelector } from '../reducers/walletReducer';

const mapStateToProps = (state: any) => {
  return {
    balances: balancesSelector(state),
    prices: state.rates.prices,
    currency: state.settings.currency.value,
  };
};

export default connect(mapStateToProps)(Operations);
