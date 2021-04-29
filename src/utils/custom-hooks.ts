import { useRef, useState } from 'react';

export const useMnemonic = (
  initialMnemonic: string[] = Array(12).fill('')
): [string[], (word: string, index: number) => void] => {
  const [mnemonic, setMnemonic] = useState(initialMnemonic);
  const setMnemonicWord = (word: string, index: number) => {
    const mnemonicCopy = [...mnemonic];
    // Check if string has multiple words
    const wordsArray = word.split(' ').slice(0, 12);
    if (wordsArray.length > 1) {
      wordsArray.forEach((w, i) => {
        mnemonicCopy[i] = w.trim().toLowerCase();
      });
    } else {
      mnemonicCopy[index] = word.trim().toLowerCase();
    }
    setMnemonic(mnemonicCopy);
  };
  return [mnemonic, setMnemonicWord];
};

export const useFocus = (
  numberOfInputs: number,
  onEnd?: () => void
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
