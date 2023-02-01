import { useState } from 'react';

export const useMnemonic = (
  initialMnemonic: string[] = Array(12).fill('')
): [string[], (word: string, index: number) => void] => {
  const [mnemonic, setMnemonic] = useState<string[]>(initialMnemonic);
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
