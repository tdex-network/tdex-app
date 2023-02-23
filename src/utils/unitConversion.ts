import { Decimal } from 'decimal.js';

import type { LbtcUnit } from './constants';
import { defaultPrecision } from './constants';

export function toSatoshi(val: number, precision = defaultPrecision, unit: LbtcUnit = 'L-BTC'): number {
  return new Decimal(val).mul(Decimal.pow(10, new Decimal(precision).minus(unitToExponent(unit)))).toNumber();
}

export function fromSatoshi(val: number, precision = defaultPrecision, unit: LbtcUnit = 'L-BTC'): number {
  return new Decimal(val).div(Decimal.pow(10, new Decimal(precision).minus(unitToExponent(unit)))).toNumber();
}

export function fromSatoshiFixed(val: number, precision?: number, fixed?: number, unit?: LbtcUnit): string {
  return fromSatoshi(val, precision, unit).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: fixed || unitToFixedDigits(unit),
    useGrouping: false,
  });
}

export function fromUnitToLbtc(lbtcValue: number, unit?: LbtcUnit): number {
  switch (unit) {
    case 'L-BTC':
      return lbtcValue;
    case 'L-mBTC':
      return new Decimal(lbtcValue).div(Decimal.pow(10, 3)).toNumber();
    case 'L-bits':
      return new Decimal(lbtcValue).div(Decimal.pow(10, 6)).toNumber();
    case 'L-sats':
      return new Decimal(lbtcValue).div(Decimal.pow(10, 8)).toNumber();
    default:
      return lbtcValue;
  }
}

// Convert from Lbtc value to desired unit, taking into account asset precision
export function fromLbtcToUnit(lbtcValue: number, unit?: LbtcUnit, precision = defaultPrecision): number {
  switch (unit) {
    case 'L-BTC':
      return lbtcValue;
    case 'L-mBTC':
      return new Decimal(lbtcValue).mul(Decimal.pow(10, new Decimal(precision).minus(5))).toNumber();
    case 'L-bits':
      return new Decimal(lbtcValue).mul(Decimal.pow(10, new Decimal(precision).minus(2))).toNumber();
    case 'L-sats':
      return new Decimal(lbtcValue).mul(Decimal.pow(10, new Decimal(precision))).toNumber();
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

export function unitToExponent(unit: LbtcUnit): number {
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
