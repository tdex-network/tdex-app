import { Decimal } from 'decimal.js';
import type {
  AddressInterface,
  ChangeAddressFromAssetGetter,
  CoinSelectionResult,
  CoinSelector,
  RecipientInterface,
  UtxoInterface,
} from 'ldk';
import {
  estimateTxSize,
  fetchTxHex,
  greedyCoinSelector,
  isBlindedUtxo,
} from 'ldk';
import type { Dispatch } from 'redux';

import type { BalanceInterface } from '../redux/actionTypes/walletActionTypes';
import { lockUtxo } from '../redux/actions/walletActions';

import type { AssetConfig, LbtcDenomination } from './constants';
import {
  defaultPrecision,
  getColor,
  getMainAsset,
  LBTC_ASSET,
} from './constants';
import type { TxDisplayInterface } from './types';

export const createColorFromHash = (id: string): string => {
  let hash = 0;
  if (id.length === 0) throw Error('id length must be > 0');
  const color = getColor(id);
  if (color) return color;
  const ticker = tickerFromAssetHash(id);
  for (let i = 0; i < ticker.length; i++) {
    hash = ticker.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 70%, 50%)`;
};

export function toSatoshi(
  val: string,
  precision = defaultPrecision,
  unit: LbtcDenomination = 'L-BTC',
): Decimal {
  return new Decimal(val).mul(
    Decimal.pow(10, new Decimal(precision).minus(unitToExponent(unit))),
  );
}

export function fromSatoshi(
  val: string,
  precision = defaultPrecision,
  unit: LbtcDenomination = 'L-BTC',
): Decimal {
  const v = new Decimal(val).div(Decimal.pow(10, precision));
  return formatLBTCwithUnit(v, unit);
}

export function fromSatoshiFixed(
  val: string,
  precision?: number,
  fixed?: number,
  unit?: LbtcDenomination,
): string {
  return formatLBTCwithUnit(fromSatoshi(val, precision), unit)
    .toNumber()
    .toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: fixed || unitToFixedDigits(unit),
      useGrouping: false,
    });
}

export function toLBTCwithUnit(
  lbtcValue: Decimal,
  unit?: LbtcDenomination,
): Decimal {
  switch (unit) {
    case 'L-BTC':
      return lbtcValue;
    case 'L-mBTC':
      return lbtcValue.div(Decimal.pow(10, 3));
    case 'L-bits':
      return lbtcValue.div(Decimal.pow(10, 6));
    case 'L-sats':
      return lbtcValue.div(Decimal.pow(10, 8));
    default:
      return lbtcValue;
  }
}

export function formatLBTCwithUnit(
  lbtcValue: Decimal,
  unit?: LbtcDenomination,
): Decimal {
  switch (unit) {
    case 'L-BTC':
      return lbtcValue;
    case 'L-mBTC':
      return lbtcValue.mul(Decimal.pow(10, 3));
    case 'L-bits':
      return lbtcValue.mul(Decimal.pow(10, 6));
    case 'L-sats':
      return lbtcValue.mul(Decimal.pow(10, 8));
    default:
      return lbtcValue;
  }
}

export function unitToFixedDigits(unit?: string): number {
  if (!unit) return 2;
  switch (unit) {
    case 'L-BTC':
      return 8;
    case 'L-mBTC':
      return 5;
    case 'L-bits':
      return 2;
    case 'L-sats':
      return 0;
    default:
      return 2;
  }
}

export function unitToExponent(unit: LbtcDenomination): number {
  switch (unit) {
    case 'L-BTC':
      return 0;
    case 'L-mBTC':
      return 3;
    case 'L-bits':
      return 6;
    case 'L-sats':
      return 8;
    default:
      return 0;
  }
}

export function formatDate(date: any): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function groupBy(xs: any[], key: string): any {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
}

export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Use esplora server to fetchTxHex
 * @param txid
 * @param explorerURL
 */
export async function waitForTx(
  txid: string,
  explorerURL: string,
): Promise<void> {
  let go = true;
  while (go) {
    try {
      await fetchTxHex(txid, explorerURL);
      go = false;
    } catch (_) {
      await sleep(800);
    }
  }
}

export async function sleep(ms: number): Promise<any> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// compute balances value from a set of utxos
export function balancesFromUtxos(
  utxos: UtxoInterface[],
  assets: Record<string, AssetConfig>,
): BalanceInterface[] {
  const balances: BalanceInterface[] = [];
  const utxosGroupedByAsset: Record<string, UtxoInterface[]> = groupBy(
    utxos,
    'asset',
  );

  for (const asset of Object.keys(utxosGroupedByAsset)) {
    const utxosForAsset = utxosGroupedByAsset[asset];
    const amount = sumUtxos(utxosForAsset);

    const coinGeckoID = getMainAsset(asset)?.coinGeckoID;
    balances.push({
      asset,
      amount,
      ticker: assets[asset]?.ticker || tickerFromAssetHash(asset),
      coinGeckoID,
      precision: assets[asset]?.precision ?? defaultPrecision,
      name: assets[asset]?.name,
    });
  }

  return balances;
}

function sumUtxos(utxos: UtxoInterface[]): number {
  let sum = 0;
  for (const utxo of utxos) {
    if (!isBlindedUtxo(utxo) && utxo.value) {
      sum += utxo.value;
    }
  }
  return sum;
}

export function tickerFromAssetHash(assetHash?: string): string {
  if (!assetHash) return '';
  const mainAsset = getMainAsset(assetHash);
  if (mainAsset) return mainAsset.ticker;
  return assetHash.slice(0, 4).toUpperCase();
}

export function nameFromAssetHash(assetHash?: string): string | undefined {
  if (!assetHash) return '';
  const mainAsset = getMainAsset(assetHash);
  if (mainAsset) return mainAsset.name;
}

/**
 * Returns a custom coinSelector
 * @param dispatch if defined, will lock the selected utxos.
 */
export function customCoinSelector(dispatch?: Dispatch): CoinSelector {
  const greedy = greedyCoinSelector();
  if (!dispatch) return greedy;
  return (
    unspents: UtxoInterface[],
    outputs: RecipientInterface[],
    changeGetter: ChangeAddressFromAssetGetter,
  ): CoinSelectionResult => {
    const result = greedy(unspents, outputs, changeGetter);
    for (const utxo of result.selectedUtxos) {
      dispatch(lockUtxo(utxo.txid, utxo.vout));
    }
    return result;
  };
}

export function getAssetHashLBTC(): string {
  return LBTC_ASSET.assetHash;
}

export function isLbtc(asset: string): boolean {
  return asset === getAssetHashLBTC();
}

/**
 * Estimate the number of LBTC sats to pay fees
 * @param setOfUtxos spendable unspents coins
 * @param recipients a set of recipients/outputs describing the transaction
 * @param satsPerByte
 */
export function estimateFeeAmount(
  setOfUtxos: UtxoInterface[],
  recipients: RecipientInterface[],
  satsPerByte = 0.1,
): number {
  const address = 'doesntmatteraddress';
  const { selectedUtxos, changeOutputs } = customCoinSelector()(
    setOfUtxos,
    [
      ...recipients,
      {
        address,
        asset: getAssetHashLBTC(),
        value: 300,
      },
    ],
    () => address,
  );
  return Math.ceil(
    estimateTxSize(selectedUtxos.length, changeOutputs.length + 1) *
      satsPerByte,
  );
}

/**
 * function can be used with sort()
 */
export function compareTxDisplayInterfaceByDate(
  a: TxDisplayInterface,
  b: TxDisplayInterface,
): number {
  return b.blockTime?.diff(a.blockTime) || 0;
}

export function getIndexAndIsChangeFromAddress(addr: AddressInterface): {
  index: number;
  isChange: boolean;
} {
  if (!addr.derivationPath) {
    throw new Error('need derivation path to be defined');
  }
  const derivationPathSplitted = addr.derivationPath.split('/');
  return {
    index: parseInt(derivationPathSplitted[derivationPathSplitted.length - 1]),
    isChange:
      parseInt(derivationPathSplitted[derivationPathSplitted.length - 2]) !== 0,
  };
}
