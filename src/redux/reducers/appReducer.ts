import { ActionType } from '../../utils/types';
import { INIT_APP_FAIL, INIT_APP_SUCCESS } from '../actions/appActions';

const initialState = {
  appInit: false,
};

const appReducer = (state = initialState, action: ActionType) => {
  switch (action.type) {
    case INIT_APP_SUCCESS:
    case INIT_APP_FAIL:
      return {
        appInit: true,
      };
    default:
      return state;
  }
};

export default appReducer;
