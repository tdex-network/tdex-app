import { connect } from 'react-redux';

import WatchersLoader from '../../components/WatchersLoader';

const mapStateToProps = (state: any) => {
  return {
    watchers: state.transactions.watchers,
  };
};

export default connect(mapStateToProps)(WatchersLoader);
