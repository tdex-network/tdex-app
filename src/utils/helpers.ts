import { fetchTxHex } from 'ldk';
import { tickerFromAssetHash } from '../redux/reducers/walletReducer';
import { Assets, defaultPrecision } from './constants';

export const getEdgeAsset = (asset_id: string) => {
  return Object.values(Assets).find((item: any) => item.assetHash === asset_id);
};
export const createColorFromHash = (id: string): string => {
  let hash = 0;
  if (id.length === 0) throw Error('id length must be > 0');
  const ticker = tickerFromAssetHash(id);
  for (let i = 0; i < ticker.length; i++) {
    hash = ticker.charCodeAt(i) + ((hash << 5) - hash);
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
  return Number(fromSatoshi(x, y).toFixed(fixed || 2)).toLocaleString(
    undefined,
    { minimumFractionDigits: 2, maximumFractionDigits: fixed || 2 }
  );
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

export function groupBy(xs: Array<any>, key: string) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
}

export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Util function to check the validity of string amount
 * @param amount the string to check
 */
export function validAmountString(amount?: string): boolean {
  if (!amount) return false;
  return amountGuard(amount);
}

function amountGuard(amount: string): boolean {
  // TODO handle precision & max amount for altcoins ?
  const regexp = new RegExp('^\\d{0,8}(\\.\\d{0,8})?$');
  return regexp.test(amount);
}

/**
 * Use esplora server to fetchTxHex
 * @param txid
 * @param explorerURL
 */
export async function waitForTx(txid: string, explorerURL: string) {
  let go = true;
  while (go) {
    try {
      await fetchTxHex(txid, explorerURL);
      go = false;
    } catch (_) {
      await sleep(800);
      continue;
    }
  }
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
