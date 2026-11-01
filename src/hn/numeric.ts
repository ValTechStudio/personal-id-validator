import { fail } from '../messages'
import type { MaskOptions, ValidateOptions, ValidationResult } from '../types'
import { checkTerritory, checkYear } from './municipalities'

// Shared by DNI and RTN, which both start with DDMM-YYYY-NNNNN.
export const compactNumeric = (value: string) => value.replace(/[\s.-]/g, '')

export function validateNumeric(
  value: string,
  length: number,
  options?: ValidateOptions,
): ValidationResult {
  const compact = compactNumeric(value)
  if (!/^\d*$/.test(compact)) return fail('INVALID_FORMAT', options)
  if (compact.length !== length) return fail('INVALID_LENGTH', options)
  const error =
    checkTerritory(compact) ?? checkYear(Number(compact.slice(4, 8)))
  return error ? fail(error, options) : { valid: true, value: compact }
}

/** Inserts the separator after positions 4 and 8 (and 13 for RTN) as digits arrive. */
export function maskDigits(
  value: string,
  length: number,
  options?: MaskOptions,
): string {
  const digits = value.replace(/\D/g, '').slice(0, length)
  return [
    digits.slice(0, 4),
    digits.slice(4, 8),
    digits.slice(8, 13),
    digits.slice(13),
  ]
    .filter(Boolean)
    .join(options?.separator ?? '-')
}
