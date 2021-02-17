import { BalanceInterface } from '../redux/actionTypes/walletActionTypes';
import { Assets, defaultPrecision } from './constants';
import { TxDisplayInterface, TxTypeEnum } from './types';
import { address as liquidAddress, networks } from 'liquidjs-lib';
import { network } from '../redux/config';

export const getEdgeAsset = (asset_id: string) => {
  return Object.values(Assets).find((item: any) => item.assetHash === asset_id);
};
export const createColorFromHash = (id: string): string => {
  let hash = 0;
  if (id.length === 0) throw Error('id length must be > 0');
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 70%, 50%)`;
};

export function toSatoshi(x: number, y?: number): number {
  return Math.floor(x * Math.pow(10, y || defaultPrecision));
}

export function fromSatoshi(x: number, y?: number): number {
  return x / Math.pow(10, y || defaultPrecision);
}

export function fromSatoshiFixed(
  x: number,
  y?: number,
  fixed?: number
): string {
  return fromSatoshi(x, y).toFixed(fixed || 2);
}

export function formatAmount(amount: number) {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });
}

export function formatDate(date: any) {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
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
    address = '',
    type: any,
    sign: any,
    vinAmount: any,
    voutAmount: any,
    fee: any;
  const assets: any = new Set();

  vin.forEach((item) => {
    if (item.prevout.asset && item.prevout.script) {
      assets.add(item.prevout.asset);
    }
  });

  vout.forEach((item, idx) => {
    if (item.asset && item.script) {
      assets.add(item.asset);
    } else if (item.asset && !item.script) {
      fee = item.asset;
    }
  });
  if (fee && assets.size > 1 && assets.has(fee)) {
    assets.delete(fee);
  }

  vin.forEach((item) => {
    if (
      item.prevout.asset &&
      item.prevout.script &&
      assets.has(item.prevout.asset)
    ) {
      assets.add(item.prevout.asset);
      type = TxTypeEnum.Withdraw;
      asset = item.prevout.asset;
      address = liquidAddress.fromOutputScript(
        Buffer.from(item.prevout.script, 'hex'),
        (networks as any)[network.chain]
      );
      vinAmount = vinAmount
        ? Number(vinAmount) + Number(item.prevout.value)
        : item.prevout.value;
      sign = '-';
    }
  });
  vout.forEach((item) => {
    if (item.asset && item.script && assets.has(item.asset)) {
      if (item.asset === asset || !asset) {
        type = type ?? TxTypeEnum.Deposit;
        asset = item.asset;
        address = liquidAddress.fromOutputScript(
          Buffer.from(item.script, 'hex'),
          (networks as any)[network.chain]
        );
        voutAmount = voutAmount
          ? Number(voutAmount) + Number(item.value)
          : item.value;
        sign = sign ?? '+';
      }
    }
  });
  amount = vinAmount
    ? voutAmount
      ? vinAmount - voutAmount
      : vinAmount
    : voutAmount;
  return {
    amount,
    asset,
    address,
    type,
    sign,
  };
}

export function groupBy(xs: Array<any>, key: string) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
}
