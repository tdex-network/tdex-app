import { ActionType } from '../../utils/types';

export const INIT_APP = 'INIT_APP';
export const INIT_APP_SUCCESS = 'INIT_APP_SUCCESS';
export const INIT_APP_FAIL = 'INIT_APP_FAIL';

export const initApp = (): ActionType => {
  return {
    type: INIT_APP,
  };
};

export const initAppSuccess = (): ActionType => {
  return {
    type: INIT_APP_SUCCESS,
  };
};

export const initAppFail = (): ActionType => {
  return {
    type: INIT_APP_FAIL,
  };
};
