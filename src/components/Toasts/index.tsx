import type { ToastButton } from '@ionic/react';
import { IonToast } from '@ionic/react';
import { closeCircleOutline } from 'ionicons/icons';
import React from 'react';
import { useDispatch } from 'react-redux';

import { setModalClaimPegin } from '../../redux/actions/btcActions';
import type { ToastOpts, ToastType } from '../../redux/reducers/toastReducer';
import { TOAST_TIMEOUT_FAILURE, TOAST_TIMEOUT_SUCCESS } from '../../utils/constants';

interface ToastsProps {
  toasts: ToastOpts[];
  removeToast: (ID: number) => any;
}

const Toasts: React.FC<ToastsProps> = ({ toasts, removeToast }) => {
  const dispatch = useDispatch();

  const buttons = (toast: ToastOpts): (string | ToastButton)[] | undefined => {
    if (toast.type === 'claim-pegin') {
      return [
        // {
        //   side: 'start',
        //   role: 'cancel',
        //   icon: closeCircleOutline,
        // },
        {
          side: 'end',
          role: 'claim',
          text: 'CLAIM NOW',
          handler: () => {
            dispatch(setModalClaimPegin({ isOpen: true }));
          },
        },
      ];
    } else {
      return undefined;
    }
  };

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
          position={toast?.position ?? 'top'}
          cssClass={toast?.cssClass}
          buttons={buttons(toast)}
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
