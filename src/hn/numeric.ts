import { fail, hasSeparators } from '../messages'
import type { FormatOptions, ValidateOptions, ValidationResult } from '../types'
import { checkTerritory, checkYear } from './municipalities'

// Shared by DNI and RTN, which both start with DDMM-YYYY-NNNNN.
export const compactNumeric = (value: string) => value.replace(/[\s.-]/g, '')

export function validateNumeric(
  value: string,
  length: number,
  options?: ValidateOptions,
): ValidationResult {
  if (options?.allowSeparators === false && hasSeparators(value))
    return fail('INVALID_FORMAT', options)
  const compact = compactNumeric(value)
  if (!/^\d*$/.test(compact)) return fail('INVALID_FORMAT', options)
  if (compact.length !== length) return fail('INVALID_LENGTH', options)
  const error =
    checkTerritory(compact) ?? checkYear(Number(compact.slice(4, 8)))
  return error ? fail(error, options) : { valid: true, compact }
}

/** Inserts the separator after positions 4 and 8 (and 13 for RTN) as digits arrive. */
export function formatDigits(
  value: string,
  length: number,
  options?: FormatOptions,
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

export function formatComplete(
  value: string,
  length: number,
  options?: FormatOptions,
): string {
  const c = compactNumeric(value)
  return new RegExp(`^\\d{${length}}$`).test(c)
    ? formatDigits(c, length, options)
    : c
}
