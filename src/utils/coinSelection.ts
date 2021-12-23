import type { CoinSelectorErrorFn } from 'tdex-sdk';

export const throwErrorHandler: CoinSelectorErrorFn = (asset: string, need: number, has: number) => {
  throw new Error(`not enough funds to fill ${need}sats of ${asset} (available: ${has})`);
};
