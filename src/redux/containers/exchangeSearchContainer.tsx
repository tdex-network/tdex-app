import { connect } from 'react-redux';

import ExchangeSearch from '../../components/ExchangeSearch';
import type { RootState } from '../types';

const mapStateToProps = (state: RootState) => {
  return {
    prices: state.rates.prices,
    currency: state.settings.currency,
  };
};

export default connect(mapStateToProps)(ExchangeSearch);
