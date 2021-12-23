import { connect } from 'react-redux';
import type { Dispatch } from 'redux';

import ShowMnemonicOnboarding from '../../pages/ShowMnemonic/show-mnemonic-onboarding';
import type { AppError } from '../../utils/errors';
import { setSeedBackupFlag } from '../../utils/storage-helper';
import { setIsBackupDone } from '../actions/appActions';
import { addErrorToast } from '../actions/toastActions';
import type { RootState } from '../types';

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

export default connect(mapStateToProps, mapDispatchToProps)(ShowMnemonicOnboarding);
