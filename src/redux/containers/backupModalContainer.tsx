import { connect } from 'react-redux';
import BackupModal from '../../components/BackupModal';
import { AppError } from '../../utils/errors';
import { setSeedBackup } from '../../utils/storage-helper';
import { setBackupDone } from '../actions/appActions';
import { addErrorToast } from '../actions/toastActions';

const mapStateToProps = (state: any) => {
  return {
    backupDone: state.app.backupDone,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setDone: () => {
      setSeedBackup();
      dispatch(setBackupDone());
    },
    onError: (err: AppError) => dispatch(addErrorToast(err)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(BackupModal);
