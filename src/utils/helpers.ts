import { Assets, defaultPrecision } from './constants';
import { TxDisplayInterface, TxTypeEnum } from './types';

export const getEdgeAsset = (asset_id: string) => {
  return Object.values(Assets).find((item: any) => item.assetHash === asset_id);
};

export const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export function fromSatoshi(x: number, y?: number, fixed?: number): string {
  return (x / Math.pow(10, y || defaultPrecision)).toFixed(fixed || 2);
}

export function formatPriceString(price: string | number): string {
  const decimals = (Number(price) % 1).toFixed(2);
  const intReverseArr = Math.trunc(Number(price))
    .toString()
    .split('')
    .reverse();
  return (
    intReverseArr.reduce((res: string, ch: string, i: number): string => {
      const isEvenThree = Number(i + 1) % 3;
      return isEvenThree === 0 && i < intReverseArr.length - 1
        ? `.${ch}${res}`
        : `${ch}${res}`;
    }, '') + `,${decimals.replace('0.', '')}`
  );
}

export function getDataFromTx(
  vin: Array<any>,
  vout: Array<any>
): Partial<TxDisplayInterface> {
  let amount = 0,
    asset = '',
    type,
    sign;
  vin.forEach((item) => {
    if (item.prevout.asset && item.prevout.script) {
      type = TxTypeEnum.Withdraw;
      asset = item.prevout.asset;
      amount = item.prevout.value;
      sign = '-';
    }
  });
  vout.forEach((item) => {
    if (item.asset && item.script) {
      type = TxTypeEnum.Deposit;
      asset = item.asset;
      amount = item.value;
      sign = '+';
    }
  });
  return {
    amount,
    asset,
    type,
    sign,
  };
}

export const getCoinsEquivalent = (
  asset: any,
  coinsRates: any,
  amount: any,
  currency: string
) => {
  return coinsRates[asset.ticker.toLowerCase()]
    ? (
        Number(amount) * coinsRates[asset.ticker.toLowerCase()].rate[currency]
      ).toFixed(2)
    : false;
};
