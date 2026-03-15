/**
 * Data parsing utilities for benefits and session content
 */

import type { Benefit, SessionContentItem } from '../types';

/**
 * Parse benefits from JSON string stored in teachingStyle field
 */
export function parseBenefitsFromJSON(teachingStyle: string | undefined): Benefit[] {
  if (!teachingStyle) {
    return [];
  }

  try {
    const parsed = JSON.parse(teachingStyle);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Parse session content from JSON string stored in sessionContent field
 */
export function parseSessionContentFromJSON(sessionContent: string | undefined): SessionContentItem[] {
  if (!sessionContent) {
    return [];
  }

  try {
    const parsed = JSON.parse(sessionContent);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Convert benefits array to JSON string
 */
export function stringifyBenefits(benefits: Benefit[]): string {
  return JSON.stringify(benefits);
}

/**
 * Convert session content array to JSON string
 */
export function stringifySessionContent(items: SessionContentItem[]): string {
  return JSON.stringify(items);
}
