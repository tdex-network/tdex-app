// Main Flow Back Up Page Container
import { connect } from 'react-redux';
import type { Dispatch } from 'redux';

import type { RootState } from '../../index';
import Backup from '../../pages/Backup';
import type { AppError } from '../../utils/errors';
import { setSeedBackupFlag } from '../../utils/storage-helper';
import { setIsBackupDone } from '../actions/appActions';
import { addErrorToast } from '../actions/toastActions';

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
    onError: (err: AppError) => dispatch(addErrorToast(err)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Backup);
