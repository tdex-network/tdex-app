import { connect } from 'react-redux';

import App from '../../App';
import type { RootState } from '../types';

const mapStateToProps = (state: RootState) => {
  return {
    appInit: state.app.appInit,
    isAuth: state.wallet.isAuth,
    theme: state.settings.theme,
  };
};

export default connect(mapStateToProps)(App);
