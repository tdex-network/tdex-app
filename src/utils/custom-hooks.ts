import { ChangeEvent, useState } from 'react';

export const useMnemonic = (initialMnemonic: any = Array(12).fill('')) => {
  const [mnemonic, setMnemonic] = useState(initialMnemonic);
  const setMnemonicWord = (
    event: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const mnemonicCopy = [...mnemonic];
    mnemonicCopy[index] = event.target.value;
    setMnemonic(mnemonicCopy);
  };
  return [mnemonic, setMnemonicWord];
};
