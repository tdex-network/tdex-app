import { connect } from 'react-redux';
import type { Dispatch } from 'redux';

import RestoreWallet from '../../pages/RestoreWallet';
import { setSeedBackupFlag } from '../../utils/storage-helper';
import { setIsBackupDone } from '../actions/appActions';
import type { RootState } from '../types';

const mapStateToProps = (state: RootState) => {
  return {
    backupDone: state.app.backupDone,
    network: state.settings.network,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    setIsBackupDone: (done: boolean) => {
      setSeedBackupFlag(done);
      dispatch(setIsBackupDone(done));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(RestoreWallet);
