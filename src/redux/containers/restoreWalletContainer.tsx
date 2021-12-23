import { connect } from 'react-redux';
import type { Dispatch } from 'redux';

import type { RootState } from '../../index';
import RestoreWallet from '../../pages/RestoreWallet';
import { setSeedBackupFlag } from '../../utils/storage-helper';
import { setIsBackupDone } from '../actions/appActions';

const mapStateToProps = (state: RootState) => {
  return {
    backupDone: state.app.backupDone,
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
