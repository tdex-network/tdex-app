import type { AppError } from '../../utils/errors';
import type { ActionType } from '../../utils/types';
import type { ToastOpts, ToastType } from '../reducers/toastReducer';

export const ADD_TOAST = 'ADD_TOAST';
export const REMOVE_TOAST = 'REMOVE_TOAST';
export const REMOVE_ALL_TOAST = 'REMOVE_ALL_TOAST';
export const REMOVE_TOAST_BY_TYPE = 'REMOVE_TOAST_BY_TYPE';

export function addSuccessToast(message: string, duration?: number): ActionType {
  return {
    type: ADD_TOAST,
    payload: createToast({ message, type: 'success', duration }),
  };
}

export function addErrorToast(error: AppError, duration?: number): ActionType {
  return {
    type: ADD_TOAST,
    payload: createToast({
      message: error.toToastMessage(),
      type: 'error',
      duration,
      errorCode: error.code,
    }),
  };
}

export function addClaimPeginToast(): ActionType {
  return {
    type: ADD_TOAST,
    payload: createToast({
      message: 'You have some bitcoins ready to be claimed!',
      type: 'claim-pegin',
      duration: 0,
      cssClass: 'claim',
      position: 'bottom',
    }),
  };
}

export function removeToast(ID: number): ActionType {
  return {
    type: REMOVE_TOAST,
    payload: ID,
  };
}

export function removeAllToast(): ActionType {
  return {
    type: REMOVE_ALL_TOAST,
  };
}

export function removeToastByType(type: ToastType): ActionType {
  return {
    type: REMOVE_TOAST_BY_TYPE,
    payload: type,
  };
}

// using to increment toast ID
let nextID = 0;

function createToast({ message, type, errorCode, duration, cssClass, position }: Omit<ToastOpts, 'ID'>): ToastOpts {
  return {
    ID: nextID++,
    message,
    type,
    errorCode,
    duration,
    cssClass,
    position,
  };
}
