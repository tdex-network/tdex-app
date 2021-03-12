import { useState } from 'react';

export const useMnemonic = (
  initialMnemonic: string[] = Array(12).fill('')
): [string[], (word: string, index: number) => void] => {
  const [mnemonic, setMnemonic] = useState(initialMnemonic);
  const setMnemonicWord = (word: string, index: number) => {
    const mnemonicCopy = [...mnemonic];
    mnemonicCopy[index] = word.trim().toLowerCase();
    setMnemonic(mnemonicCopy);
  };
  return [mnemonic, setMnemonicWord];
};
