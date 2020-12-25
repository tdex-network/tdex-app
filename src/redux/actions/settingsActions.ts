import { ActionType } from '../../utils/types';

export const SET_ELECTRUM_SERVER = 'SET_ELECTRUM_SERVER';

export const setElectrumServer = (url: string): ActionType => {
  return {
    type: SET_ELECTRUM_SERVER,
    payload: url,
  };
};
