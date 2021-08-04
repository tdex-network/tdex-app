import { IonToast } from '@ionic/react';
import { closeCircleOutline } from 'ionicons/icons';
import React from 'react';

import type { ToastOpts, ToastType } from '../../redux/reducers/toastReducer';
import {
  TOAST_TIMEOUT_FAILURE,
  TOAST_TIMEOUT_SUCCESS,
} from '../../utils/constants';

interface ToastsProps {
  toasts: ToastOpts[];
  removeToast: (ID: number) => any;
}

const Toasts: React.FC<ToastsProps> = ({ toasts, removeToast }) => {
  return (
    <div>
      {toasts.map((toast: ToastOpts) => (
        <IonToast
          key={toast.ID}
          isOpen={true}
          color={toastColor(toast.type)}
          duration={toast?.duration ?? toastDuration(toast.type)}
          message={toast.message}
          onDidDismiss={() => removeToast(toast.ID)}
          position="top"
          buttons={[
            {
              side: 'start',
              role: 'cancel',
              icon: closeCircleOutline,
              handler: () => {
                removeToast(toast.ID);
              },
            },
          ]}
        />
      ))}
    </div>
  );
};

function toastDuration(toastType: ToastType): number {
  switch (toastType) {
    case 'error':
      return TOAST_TIMEOUT_FAILURE;
    case 'success':
      return TOAST_TIMEOUT_SUCCESS;
    case 'warning':
      return TOAST_TIMEOUT_FAILURE;
    default:
      return toastDuration('success');
  }
}

function toastColor(toastType: ToastType): string {
  switch (toastType) {
    case 'error':
      return 'danger';
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    default:
      return toastColor('success');
  }
}

export default Toasts;
