import { connect } from 'react-redux';

import WatchersLoader from '../../components/WatchersLoader';
import type { RootState } from '../store';

const mapStateToProps = (state: RootState) => {
  return {
    watchers: state.transactions.watchers,
  };
};

export default connect(mapStateToProps)(WatchersLoader);
