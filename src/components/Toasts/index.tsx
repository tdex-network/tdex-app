import type { Gesture, ToastButton, GestureDetail } from '@ionic/react';
import { createGesture, IonToast, CreateAnimation } from '@ionic/react';
import type { CreateAnimationProps } from '@ionic/react/dist/types/components/CreateAnimation';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import { setModalClaimPegin } from '../../redux/actions/btcActions';
import type { ToastOpts, ToastType } from '../../redux/reducers/toastReducer';
import { TOAST_TIMEOUT_FAILURE, TOAST_TIMEOUT_SUCCESS } from '../../utils/constants';

interface ToastsProps {
  toasts: ToastOpts[];
  removeToast: (ID: number) => any;
  removeAllToast: () => void;
  removeToastByType: (type: ToastType) => void;
}

const Toasts: React.FC<ToastsProps> = ({ toasts, removeToast, removeToastByType }) => {
  const dispatch = useDispatch();
  const [progressStart, setProgressStart] = useState<CreateAnimationProps['progressStart']>();
  const [progressEnd, setProgressEnd] = useState<CreateAnimationProps['progressEnd']>();
  const [onFinish, setOnFinish] = useState<CreateAnimationProps['onFinish']>();
  const INITIAL_CLAIM_TOAST_POSITION = -73;
  let gesture: Gesture;
  let started = false;
  let toastEl: any;

  const animationRef = useCallback((node: React.RefObject<CreateAnimation>['current']) => {
    setTimeout(() => {
      if (node !== null) {
        toastEl = Array.from(node.nodes.values())[0];
        if (toastEl?.classList.contains('claim')) {
          toastEl.style.transform = `translateY(${INITIAL_CLAIM_TOAST_POSITION}px)`;
          gesture = createGesture({
            el: toastEl,
            gestureName: 'swipe-toast',
            threshold: 0,
            onMove: (ev) => onMove(ev),
            onEnd: (ev) => onEnd(ev),
          });
          gesture.enable(true);
        }
      }
    }, 100);
  }, []);

  const onMove = (ev: GestureDetail) => {
    if (!started) {
      setProgressStart({ forceLinearEasing: true });
      started = true;
    }
    if (ev.startY < ev.currentY) {
      toastEl.style.transform = `translateY(${ev.deltaY + INITIAL_CLAIM_TOAST_POSITION}px)`;
    }
  };

  const onEnd = (ev: GestureDetail) => {
    if (!started) return;
    setOnFinish({
      callback: () => {
        gesture.enable(true);
        setProgressStart(undefined);
        setProgressEnd(undefined);
      },
      opts: { oneTimeCallback: true },
    });
    if (ev.deltaY > 60) {
      removeToastByType('claim-pegin');
    } else {
      toastEl.style.transform = `translateY(${INITIAL_CLAIM_TOAST_POSITION}px)`;
    }
  };

  const buttons = (toast: ToastOpts): (string | ToastButton)[] | undefined => {
    if (toast.type === 'claim-pegin') {
      return [
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
        <CreateAnimation
          key={toast.ID}
          ref={toast.type === 'claim-pegin' ? animationRef : undefined}
          play={true}
          progressStart={progressStart}
          progressEnd={progressEnd}
          onFinish={onFinish}
        >
          <IonToast
            isOpen={true}
            color={toastColor(toast.type)}
            duration={toast?.duration ?? toastDuration(toast.type)}
            message={toast.message}
            onDidDismiss={() => removeToast(toast.ID)}
            position={toast?.position ?? 'top'}
            cssClass={toast?.cssClass}
            buttons={buttons(toast)}
          />
        </CreateAnimation>
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
