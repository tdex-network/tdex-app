import type { Dispatch } from 'react';

const MAX_DECIMAL_DIGITS = 8;

/**
 * Sanitize input amount
 * @param eventDetailValue string
 * @param setAmount Dispatch<string>
 * @returns sanitizedValue string
 */
export function sanitizeInputAmount(
  eventDetailValue: string,
  setAmount: Dispatch<string>,
): string {
  // If value is one of those cases, provoke re-rendering with sanitized value
  if (
    // First comma is always replaced by dot. Reset if user types a second comma
    (eventDetailValue.includes('.') && eventDetailValue.includes(',')) ||
    // No more than MAX_DECIMAL_DIGITS digits
    eventDetailValue.split(/[,.]/, 2)[1]?.length > MAX_DECIMAL_DIGITS ||
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
    // Remove non numeric chars or period
    .replace(/[^0-9.]/g, '');
  // Prefix single dot
  if (sanitizedValue === '.') sanitizedValue = '0.';
  // Remove last dot. Remove all if consecutive
  if ((sanitizedValue.match(/\./g) || []).length > 1) {
    sanitizedValue = sanitizedValue.replace(/\.$/, '');
  }
  // No more than MAX_DECIMAL_DIGITS decimal digits
  if (eventDetailValue.split(/[,.]/, 2)[1]?.length > MAX_DECIMAL_DIGITS) {
    sanitizedValue = Number(eventDetailValue).toFixed(MAX_DECIMAL_DIGITS);
  }
  return sanitizedValue === '' ? '0' : sanitizedValue;
}
