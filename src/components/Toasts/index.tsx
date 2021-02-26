import React from 'react';
import { IonToast } from '@ionic/react';
import { ToastOpts, ToastType } from '../../redux/reducers/toastReducer';
import { closeCircleOutline } from 'ionicons/icons';

interface ToastsProps {
  toasts: ToastOpts[];
  removeToast: (ID: number) => any;
}

const Toasts: React.FC<ToastsProps> = ({ toasts, removeToast }) => {
  return (
    <div>
      {toasts.map((toast: ToastOpts) => (
        <IonToast
          isOpen={true}
          color={toastColor(toast.type)}
          duration={toastDuration(toast.type)}
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
      return 2000;
    case 'success':
      return 800;
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
    default:
      return toastColor('success');
  }
}

export default Toasts;
