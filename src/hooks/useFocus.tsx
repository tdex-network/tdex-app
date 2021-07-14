import type React from 'react';
import { useRef } from 'react';

export const useFocus = (
  numberOfInputs: number,
  onEnd?: () => void,
): [React.RefObject<HTMLIonInputElement>[], (i: number) => void] => {
  const refs: React.RefObject<HTMLIonInputElement>[] = [];
  for (let i = 0; i < numberOfInputs; i++) {
    refs[i] = useRef(null);
  }
  const setFocus = (i: number) => {
    if (onEnd && i === numberOfInputs) onEnd();
    if (refs[i]) {
      refs[i].current?.setFocus();
    }
  };
  return [refs, setFocus];
};
