import { connect } from 'react-redux';

import Toasts from '../../components/Toasts';
import { removeAllToast, removeToast } from '../actions/toastActions';

const mapStateToProps = (state: any) => {
  return {
    toasts: state.toasts,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    removeToast: (ID: number) => dispatch(removeToast(ID)),
    removeAllToast: () => dispatch(removeAllToast()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Toasts);
