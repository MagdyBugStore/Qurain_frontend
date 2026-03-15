/**
 * Validation utilities
 */

import type { Benefit, SessionContentItem } from '../types';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Check if benefits array has any empty items
 */
export function hasEmptyBenefits(benefits: Benefit[]): boolean {
  return benefits.some(b => !b.title.trim() || !b.subject.trim());
}

/**
 * Check if session content array has any empty items
 */
export function hasEmptySessionContent(items: SessionContentItem[]): boolean {
  return items.some(item => !item.title.trim() || !item.subject.trim());
}

/**
 * Validate benefits before saving
 */
export function validateBenefits(benefits: Benefit[]): ValidationResult {
  if (benefits.length === 0) {
    return { isValid: false, error: 'يرجى إضافة فائدة واحدة على الأقل' };
  }

  const validBenefits = benefits.filter(b => b.title.trim() && b.subject.trim());
  if (validBenefits.length === 0 && benefits.length > 0) {
    return { isValid: false, error: 'يرجى إضافة فائدة واحدة على الأقل مع عنوان ووصف' };
  }

  if (benefits.length > 3) {
    return { isValid: false, error: 'يمكن إضافة ثلاث فوائد كحد أقصى' };
  }

  return { isValid: true };
}

/**
 * Validate session content before saving
 */
export function validateSessionContent(items: SessionContentItem[]): ValidationResult {
  if (items.length === 0) {
    return { isValid: true }; // Session content can be empty
  }

  const validItems = items.filter(item => item.title.trim() && item.subject.trim());
  if (validItems.length === 0 && items.length > 0) {
    return { isValid: false, error: 'يرجى إضافة عنصر واحد على الأقل مع عنوان ووصف' };
  }

  return { isValid: true };
}
