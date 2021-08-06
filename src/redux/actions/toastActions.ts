import type { AppError } from '../../utils/errors';
import type { ActionType } from '../../utils/types';
import type { ToastType, ToastOpts } from '../reducers/toastReducer';

export const ADD_TOAST = 'ADD_TOAST';
export const REMOVE_TOAST = 'REMOVE_TOAST';

export function addSuccessToast(
  message: string,
  duration?: number,
): ActionType {
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

export function addWarningToast(
  message: string,
  duration?: number,
): ActionType {
  return {
    type: ADD_TOAST,
    payload: createToast({ message, type: 'warning', duration }),
  };
}

export function removeToast(ID: number): ActionType {
  return {
    type: REMOVE_TOAST,
    payload: ID,
  };
}

// using to increment toast ID
let nextID = 0;

function createToast({
  message,
  type,
  errorCode,
  duration,
}: {
  message: string;
  type: ToastType;
  errorCode?: number;
  duration?: number;
}): ToastOpts {
  return {
    ID: nextID++,
    message,
    type,
    errorCode,
    duration,
  };
}
