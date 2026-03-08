/**
 * Currency utility functions
 * Handles currency symbol conversion and formatting
 */

import { Currency } from '../types/teacher.types';

/**
 * Get currency symbol from currency code
 */
export function getCurrencySymbol(currency?: Currency): string {
  if (!currency) return 'ر.س';
  
  switch (currency.toUpperCase()) {
    case 'SAR':
      return 'ر.س';
    case 'USD':
      return '$';
    case 'EGP':
      return 'ج.م';
    default:
      return 'ر.س';
  }
}

/**
 * Format price with currency
 */
export function formatPrice(price: number, currency?: Currency): string {
  const symbol = getCurrencySymbol(currency);
  return `${price} ${symbol}`;
}
