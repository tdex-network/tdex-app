import { connect } from 'react-redux';

import Toasts from '../../components/Toasts';
import { removeToast } from '../actions/toastActions';

const mapStateToProps = (state: any) => {
  return {
    toasts: state.toasts,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    removeToast: (ID: number) => dispatch(removeToast(ID)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Toasts);
