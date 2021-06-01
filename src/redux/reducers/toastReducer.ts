import type { ActionType } from '../../utils/types';
import { ADD_TOAST, REMOVE_TOAST } from '../actions/toastActions';

export type ToastType = 'success' | 'error';

export interface ToastOpts {
  type: ToastType;
  ID: number;
  message: string;
}

const toastReducer = (state: ToastOpts[] = [], action: ActionType): any[] => {
  switch (action.type) {
    case ADD_TOAST:
      return [action.payload, ...state];
    case REMOVE_TOAST:
      return state.filter(({ ID }) => ID !== action.payload);
    default:
      return state;
  }
};

export default toastReducer;
