import { Decimal } from 'decimal.js';
import type {
  AddressInterface,
  ChangeAddressFromAssetGetter,
  CoinSelectionResult,
  CoinSelector,
  RecipientInterface,
  BlindingKeyGetter,
} from 'ldk';
import { fetchTxHex, greedyCoinSelector, isUnblindedOutput } from 'ldk';
import type { Dispatch } from 'redux';
import type { NetworkString, UnblindedOutput } from 'tdex-sdk';
import { getAsset, getSats } from 'tdex-sdk';

import type { BalanceInterface } from '../redux/actionTypes/walletActionTypes';
import { lockUtxo } from '../redux/actions/walletActions';

import { throwErrorHandler } from './coinSelection';
import type { AssetConfig, LbtcDenomination } from './constants';
import { defaultPrecision, LBTC_ASSET, LBTC_TICKER, LCAD_ASSET, USDT_ASSET } from './constants';
import type { TxDisplayInterface } from './types';

export function toSatoshi(val: string, precision = defaultPrecision, unit: LbtcDenomination = 'L-BTC'): Decimal {
  return new Decimal(val).mul(Decimal.pow(10, new Decimal(precision).minus(unitToExponent(unit))));
}

export function fromSatoshi(val: string, precision = defaultPrecision, unit: LbtcDenomination = 'L-BTC'): Decimal {
  return new Decimal(val).div(Decimal.pow(10, new Decimal(precision).minus(unitToExponent(unit))));
}

export function fromSatoshiFixed(val: string, precision?: number, fixed?: number, unit?: LbtcDenomination): string {
  return fromSatoshi(val, precision, unit)
    .toNumber()
    .toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: fixed || unitToFixedDigits(unit),
      useGrouping: false,
    });
}

export function fromUnitToLbtc(lbtcValue: Decimal, unit?: LbtcDenomination): Decimal {
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

// Convert from Lbtc value to desired unit, taking into account asset precision
export function fromLbtcToUnit(lbtcValue: Decimal, unit?: LbtcDenomination, precision = defaultPrecision): Decimal {
  switch (unit) {
    case 'L-BTC':
      return lbtcValue;
    case 'L-mBTC':
      return lbtcValue.mul(Decimal.pow(10, new Decimal(precision).minus(5)));
    case 'L-bits':
      return lbtcValue.mul(Decimal.pow(10, new Decimal(precision).minus(2)));
    case 'L-sats':
      return lbtcValue.mul(Decimal.pow(10, new Decimal(precision)));
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

export function formatDate(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function groupByAsset(xs: any[]): any {
  return xs.reduce(function (rv, x) {
    (rv[getAsset(x)] = rv[getAsset(x)] || []).push(x);
    return rv;
  }, {});
}

export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Use esplora server to fetchTxHex
 * @param txid
 * @param explorerLiquidAPI
 */
export async function waitForTx(txid: string, explorerLiquidAPI: string): Promise<void> {
  let go = true;
  while (go) {
    try {
      await fetchTxHex(txid, explorerLiquidAPI);
      go = false;
    } catch (_) {
      await sleep(800);
    }
  }
}

export async function sleep(ms: number): Promise<any> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// compute balances value from a set of utxos
export function balancesFromUtxos(
  utxos: UnblindedOutput[],
  assets: Record<string, AssetConfig>,
  network: NetworkString
): BalanceInterface[] {
  const balances: BalanceInterface[] = [];
  const utxosGroupedByAsset: Record<string, UnblindedOutput[]> = groupByAsset(utxos);
  for (const asset of Object.keys(utxosGroupedByAsset)) {
    const utxosForAsset = utxosGroupedByAsset[asset];
    const amount = sumUtxos(utxosForAsset);
    const coinGeckoID = assets[asset]?.coinGeckoID;
    balances.push({
      assetHash: asset,
      amount,
      ticker: assets[asset]?.ticker || asset.slice(0, 4).toUpperCase(),
      coinGeckoID,
      precision: assets[asset]?.precision ?? defaultPrecision,
      name: assets[asset]?.name ?? 'Unknown',
    });
  }

  return balances;
}

function sumUtxos(utxos: UnblindedOutput[]): number {
  let sum = 0;
  for (const utxo of utxos) {
    if (isUnblindedOutput(utxo) && getSats(utxo)) {
      sum += getSats(utxo);
    }
  }
  return sum;
}

/**
 * Returns a custom coinSelector
 * @param dispatch if defined, will lock the selected utxos.
 */
export function customCoinSelector(dispatch?: Dispatch): CoinSelector {
  const greedy = greedyCoinSelector();
  if (!dispatch) return greedy;
  return (errorHandler = throwErrorHandler) =>
    (
      unspents: UnblindedOutput[],
      outputs: RecipientInterface[],
      changeGetter: ChangeAddressFromAssetGetter
    ): CoinSelectionResult => {
      const result = greedy(errorHandler)(unspents, outputs, changeGetter);
      for (const utxo of result.selectedUtxos) {
        dispatch(lockUtxo(utxo.txid, utxo.vout));
      }
      return result;
    };
}

export function isLbtc(asset: string, network: NetworkString): boolean {
  return asset === LBTC_ASSET[network]?.assetHash;
}

export function isLbtcTicker(ticker: string): boolean {
  return ticker === LBTC_TICKER['liquid'] || ticker === LBTC_TICKER['testnet'];
}

export function isUsdt(asset: string, network: NetworkString): boolean {
  return asset === USDT_ASSET[network].assetHash;
}

export function isLcad(asset: string, network: NetworkString): boolean {
  return asset === LCAD_ASSET[network].assetHash;
}

/**
 * function can be used with sort()
 */
export function compareTxDisplayInterfaceByDate(a: TxDisplayInterface, b: TxDisplayInterface): number {
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
    isChange: parseInt(derivationPathSplitted[derivationPathSplitted.length - 2]) !== 0,
  };
}

export function blindingKeyGetterFactory(
  scriptsToAddressInterface: Record<string, AddressInterface>
): BlindingKeyGetter {
  return (script: string) => {
    try {
      return scriptsToAddressInterface[script]?.blindingPrivateKey;
    } catch (_) {
      return undefined;
    }
  };
}
