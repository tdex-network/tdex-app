import type { Gesture, ToastButton, GestureDetail } from '@ionic/react';
import { createGesture, IonToast, CreateAnimation } from '@ionic/react';
import type { CreateAnimationProps } from '@ionic/react/dist/types/components/CreateAnimation';
import React, { useCallback, useRef, useState } from 'react';

import { useBitcoinStore } from '../../store/bitcoinStore';
import type { Toast, ToastType } from '../../store/toastStore';
import { useToastStore } from '../../store/toastStore';
import { TOAST_TIMEOUT_FAILURE, TOAST_TIMEOUT_SUCCESS } from '../../utils/constants';

export const Toasts: React.FC = () => {
  const setModalClaimPegin = useBitcoinStore((state) => state.setModalClaimPegin);
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);
  const removeToastByType = useToastStore((state) => state.removeToastByType);
  //
  const [progressStart, setProgressStart] = useState<CreateAnimationProps['progressStart']>();
  const [progressEnd, setProgressEnd] = useState<CreateAnimationProps['progressEnd']>();
  const [onFinish, setOnFinish] = useState<CreateAnimationProps['onFinish']>();
  const INITIAL_CLAIM_TOAST_POSITION = -73;
  const toastEl = useRef<any>(null);
  const gesture = useRef<Gesture | null>(null);
  const started = useRef<boolean>(false);

  const onMove = useCallback(
    (ev: GestureDetail) => {
      if (!started.current) {
        setProgressStart({ forceLinearEasing: true });
        started.current = true;
      }
      if (ev.startY < ev.currentY) {
        toastEl.current.style.transform = `translateY(${ev.deltaY + INITIAL_CLAIM_TOAST_POSITION}px)`;
      }
    },
    [INITIAL_CLAIM_TOAST_POSITION]
  );

  const onEnd = useCallback(
    (ev: GestureDetail) => {
      if (!started.current) return;
      setOnFinish({
        callback: () => {
          gesture.current?.enable(true);
          setProgressStart(undefined);
          setProgressEnd(undefined);
        },
        opts: { oneTimeCallback: true },
      });
      if (ev.deltaY > 60) {
        removeToastByType('claim-pegin');
      } else {
        toastEl.current.style.transform = `translateY(${INITIAL_CLAIM_TOAST_POSITION}px)`;
      }
    },
    [INITIAL_CLAIM_TOAST_POSITION, removeToastByType]
  );

  const animationRef = useCallback(
    (node: React.RefObject<CreateAnimation>['current']) => {
      setTimeout(() => {
        if (node !== null) {
          toastEl.current = Array.from(node.nodes.values())[0];
          if (toastEl.current.classList.contains('claim')) {
            toastEl.current.style.transform = `translateY(${INITIAL_CLAIM_TOAST_POSITION}px)`;
            gesture.current = createGesture({
              el: toastEl.current,
              gestureName: 'swipe-toast',
              threshold: 0,
              onMove: (ev) => onMove(ev),
              onEnd: (ev) => onEnd(ev),
            });
            gesture.current.enable(true);
          }
        }
      }, 100);
    },
    [INITIAL_CLAIM_TOAST_POSITION, onEnd, onMove]
  );

  const buttons = (toast: Toast): (string | ToastButton)[] | undefined => {
    if (toast.type === 'claim-pegin') {
      return [
        {
          side: 'end',
          role: 'claim',
          text: 'CLAIM NOW',
          handler: () => setModalClaimPegin({ isOpen: true }),
        },
      ];
    } else {
      return undefined;
    }
  };

  return (
    <div>
      {toasts.map((toast: Toast, index) => (
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
            cssClass={`${toast?.cssClass} ion-toast-${index + 1}`}
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
