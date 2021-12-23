import { connect } from 'react-redux';
import type { Dispatch } from 'redux';

import Toasts from '../../components/Toasts';
import type { RootState } from '../../index';
import { removeAllToast, removeToast, removeToastByType } from '../actions/toastActions';
import type { ToastType } from '../reducers/toastReducer';

const mapStateToProps = (state: RootState) => {
  return {
    toasts: state.toasts,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    removeToast: (ID: number) => dispatch(removeToast(ID)),
    removeAllToast: () => dispatch(removeAllToast()),
    removeToastByType: (type: ToastType) => dispatch(removeToastByType(type)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Toasts);
