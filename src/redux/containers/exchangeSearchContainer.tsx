import { connect } from 'react-redux';

import ExchangeSearch from '../../components/ExchangeSearch';
import type { RootState } from '../../index';

const mapStateToProps = (state: RootState) => {
  return {
    prices: state.rates.prices,
    currency: state.settings.currency.value,
  };
};

export default connect(mapStateToProps)(ExchangeSearch);
