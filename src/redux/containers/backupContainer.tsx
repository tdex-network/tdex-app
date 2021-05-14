// Main Flow Back Up Page Container
import { connect } from 'react-redux';
import Backup from '../../pages/Backup';
import { AppError } from '../../utils/errors';
import { setSeedBackupFlag } from '../../utils/storage-helper';
import { setIsBackupDone } from '../actions/appActions';
import { addErrorToast } from '../actions/toastActions';

const mapStateToProps = (state: any) => {
  return {
    backupDone: state.app.backupDone,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setIsBackupDone: (done: boolean) => {
      setSeedBackupFlag(done);
      dispatch(setIsBackupDone(done));
    },
    onError: (err: AppError) => dispatch(addErrorToast(err)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Backup);
