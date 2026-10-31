import type { ValidationResult } from '../types'
import { checkTerritory, checkYear } from './municipalities'

// Shared by DNI and RTN, which both start with DDMM-YYYY-NNNNN.
export const compactNumeric = (value: string) => value.replace(/[\s.-]/g, '')

export function validateNumeric(
  value: string,
  length: number,
): ValidationResult {
  const compact = compactNumeric(value)
  if (!/^\d*$/.test(compact)) return { valid: false, error: 'INVALID_FORMAT' }
  if (compact.length !== length)
    return { valid: false, error: 'INVALID_LENGTH' }
  const error =
    checkTerritory(compact) ?? checkYear(Number(compact.slice(4, 8)))
  return error ? { valid: false, error } : { valid: true, compact }
}

/** Inserts dashes after positions 4 and 8 (and 13 for RTN) as digits arrive. */
export function formatDigits(value: string, length: number): string {
  const digits = value.replace(/\D/g, '').slice(0, length)
  return [
    digits.slice(0, 4),
    digits.slice(4, 8),
    digits.slice(8, 13),
    digits.slice(13),
  ]
    .filter(Boolean)
    .join('-')
}
