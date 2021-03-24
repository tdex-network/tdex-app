import { connect } from 'react-redux';
import BackupModal from '../../components/BackupModal';
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
    onError: (msg: string) => dispatch(addErrorToast(msg)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(BackupModal);
