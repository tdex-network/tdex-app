import type { ToastButton } from '@ionic/react';

import type { ActionType } from '../../utils/types';
import { ADD_TOAST, REMOVE_ALL_TOAST, REMOVE_TOAST, REMOVE_TOAST_BY_TYPE } from '../actions/toastActions';

export type ToastType = 'success' | 'error' | 'warning' | 'claim-pegin';

export interface ToastOpts {
  ID: number;
  message: string;
  type: ToastType;
  buttons?: ToastButton[];
  cssClass?: string;
  duration?: number;
  errorCode?: number;
  position?: 'top' | 'middle' | 'bottom';
}
export type ToastState = ToastOpts[];

const toastReducer = (state: ToastState = [], action: ActionType): any[] => {
  switch (action.type) {
    case ADD_TOAST:
      return [action.payload, ...state];
    case REMOVE_TOAST:
      return state.filter(({ ID }) => ID !== action.payload);
    case REMOVE_ALL_TOAST:
      return [];
    case REMOVE_TOAST_BY_TYPE:
      return state.filter(({ type }) => type !== action.payload);
    default:
      return state;
  }
};

export default toastReducer;
