import { connect } from 'react-redux';
import ShowMnemonic from '../../pages/ShowMnemonic';
import { AppError } from '../../utils/errors';
import { setSeedBackup } from '../../utils/storage-helper';
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
      setSeedBackup();
      dispatch(setIsBackupDone(done));
    },
    onError: (err: AppError) => dispatch(addErrorToast(err)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ShowMnemonic);
