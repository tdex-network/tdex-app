import { connect } from 'react-redux';

import App from '../../App';

const mapStateToProps = (state: any) => {
  return {
    appInit: state.app.appInit,
    isAuth: state.wallet.isAuth,
    theme: state.settings.theme,
  };
};

export default connect(mapStateToProps)(App);
