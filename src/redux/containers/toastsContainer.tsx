import { connect } from 'react-redux';

import Toasts from '../../components/Toasts';
import { removeAllToast, removeToast, removeToastByType } from '../actions/toastActions';
import type { ToastType } from '../reducers/toastReducer';

const mapStateToProps = (state: any) => {
  return {
    toasts: state.toasts,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    removeToast: (ID: number) => dispatch(removeToast(ID)),
    removeAllToast: () => dispatch(removeAllToast()),
    removeToastByType: (type: ToastType) => dispatch(removeToastByType(type)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Toasts);
