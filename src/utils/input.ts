import type { Dispatch } from 'react';

import type { LbtcUnit } from './constants';
import { unitToFixedDigits } from './unitConversion';

/**
 * Sanitize input amount
 * @param eventDetailValue string
 * @param setAmount
 * @param unit
 * @returns sanitizedValue string
 */
export function sanitizeInputAmount(
  eventDetailValue: string,
  setAmount: Dispatch<string>,
  unit: LbtcUnit = 'L-BTC'
): string {
  // If value is one of those cases, provoke re-rendering with sanitized value
  if (
    // First comma is always replaced by dot. Reset if user types a second comma
    (eventDetailValue.includes('.') && eventDetailValue.includes(',')) ||
    // No more than max decimal digits for respective unit
    eventDetailValue.split(/[,.]/, 2)[1]?.length > unitToFixedDigits(unit) ||
    // If not numbers or dot
    /[^0-9.]/.test(eventDetailValue) ||
    // No more than one dot
    /(\..*){2,}/.test(eventDetailValue)
  ) {
    setAmount('');
  }
  // Sanitize value
  let sanitizedValue = eventDetailValue
    // Replace comma by dot
    .replace(',', '.')
    // Remove non-numeric chars or period
    .replace(/[^0-9.]/g, '');
  // Prefix single dot
  if (sanitizedValue === '.') sanitizedValue = '0.';
  // Remove last dot. Remove all if consecutive
  if ((sanitizedValue.match(/\./g) || []).length > 1) {
    sanitizedValue = sanitizedValue.replace(/\.$/, '');
  }
  // No more than max decimal digits for respective unit
  if (eventDetailValue.split(/[,.]/, 2)[1]?.length > unitToFixedDigits(unit)) {
    sanitizedValue = Number(eventDetailValue).toFixed(unitToFixedDigits(unit));
  }
  return sanitizedValue === '' ? '0' : sanitizedValue;
}
