import type { AnyAction } from 'redux';

export const RESET_ALL = 'RESET_ALL';

export const resetAll = (): AnyAction => {
  return {
    type: RESET_ALL,
  };
};
