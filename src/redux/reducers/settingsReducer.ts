import { ActionType } from '../../utils/types';

const initialState = {
  currency: 'eur',
};

const settingsReduccer = (state: any = initialState, action: ActionType) => {
  switch (action.type) {
    default:
      return state;
  }
};

export default settingsReduccer;
