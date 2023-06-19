import type { ToastButton } from '@ionic/react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { AppError } from '../utils/errors';

export type ToastType = 'success' | 'error' | 'warning' | 'claim-pegin';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  buttons?: ToastButton[];
  cssClass?: string;
  duration?: number;
  errorCode?: number;
  position?: 'top' | 'middle' | 'bottom';
}

interface ToastState {
  toasts: Toast[];
}

interface ToastActions {
  addSuccessToast: (message: string, duration?: number) => void;
  addErrorToast: (error: AppError, duration?: number) => void;
  addClaimPeginToast: () => void;
  removeToast: (toastID: number) => void;
  removeToastByType: (toastType: ToastType) => void;
  resetToastStore: () => void;
}

// using to increment toast ID
let nextID = 0;

function createToast({ message, type, errorCode, duration, cssClass, position }: Omit<Toast, 'id'>): Toast {
  return {
    id: nextID++,
    message,
    type,
    errorCode,
    duration,
    cssClass,
    position,
  };
}

export const useToastStore = create<ToastState & ToastActions>()(
  devtools(
    (set, get) => ({
      toasts: [],
      addSuccessToast: (message, duration) => {
        const isMsgInState = get().toasts.some((t) => t.message === message);
        if (isMsgInState) return;
        set(
          (state) => ({
            toasts: [
              ...state.toasts,
              createToast({
                message,
                type: 'success',
                duration,
              }),
            ],
          }),
          false,
          'addSuccessToast'
        );
      },
      addErrorToast: (error, duration) => {
        const isMsgInState = get().toasts.some((t) => t.message === error.toToastMessage());
        if (isMsgInState) return;
        set(
          (state) => ({
            toasts: [
              ...state.toasts,
              createToast({
                message: error.toToastMessage(),
                type: 'error',
                duration,
                errorCode: error.code,
              }),
            ],
          }),
          false,
          'addErrorToast'
        );
      },
      addClaimPeginToast: () => {
        const message = 'You have some bitcoins ready to be claimed!';
        const isMsgInState = get().toasts.some((t) => t.message === message);
        if (isMsgInState) return;
        set(
          (state) => ({
            toasts: [
              ...state.toasts,
              createToast({
                message: message,
                type: 'claim-pegin',
                duration: 0,
                cssClass: 'claim',
                position: 'bottom',
              }),
            ],
          }),
          false,
          'addClaimPeginToast'
        );
      },
      removeToast: (toastID) => {
        set((state) => ({ toasts: state.toasts.filter(({ id }) => id !== toastID) }), false, 'removeToast');
      },
      removeToastByType: (toastType) => {
        set((state) => ({ toasts: state.toasts.filter(({ type }) => type !== toastType) }), false, 'removeToastByType');
      },
      resetToastStore: () => set({ toasts: [] }, false, 'resetToastStore'),
    }),
    { name: 'store', store: 'toast' }
  )
);
