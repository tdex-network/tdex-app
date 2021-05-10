import { AppError } from '../../utils/errors';
import { ActionType } from '../../utils/types';
import { ToastType, ToastOpts } from '../reducers/toastReducer';

export const ADD_TOAST = 'ADD_TOAST';
export const REMOVE_TOAST = 'REMOVE_TOAST';

export function addSuccessToast(message: string): ActionType {
  return {
    type: ADD_TOAST,
    payload: createToast(message, 'success'),
  };
}

export function addErrorToast(error: AppError): ActionType {
  return {
    type: ADD_TOAST,
    payload: createToast(error.toToastMessage(), 'error'),
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

function createToast(message: string, type: ToastType): ToastOpts {
  return {
    ID: nextID++,
    message,
    type,
  };
}
