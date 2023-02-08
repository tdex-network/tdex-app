import { Decimal } from 'decimal.js';

import type { ScriptDetails, Outpoint, TxHeuristic } from '../store/walletStore';

import type { LbtcDenomination, NetworkString } from './constants';
import { defaultPrecision, LBTC_ASSET, LBTC_TICKER, LCAD_ASSET, USDT_ASSET } from './constants';

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

export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export async function sleep(ms: number): Promise<any> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
export function compareTxDate(a: TxHeuristic, b: TxHeuristic): number {
  return b.blockTime?.diff(a.blockTime) || 0;
}

export function getIndexAndIsChangeFromAddress(addr: ScriptDetails): {
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

export function outpointToString(outpoint: Outpoint): string {
  return `${outpoint.txid}:${outpoint.vout}`;
}

const emptyNonce: Buffer = Buffer.from('0x00', 'hex');

function bufferNotEmptyOrNull(buffer?: Buffer): boolean {
  return buffer != null && buffer.length > 0;
}

export function isConfidentialOutput({ rangeProof, surjectionProof, nonce }: any): boolean {
  return bufferNotEmptyOrNull(rangeProof) && bufferNotEmptyOrNull(surjectionProof) && nonce !== emptyNonce;
}
