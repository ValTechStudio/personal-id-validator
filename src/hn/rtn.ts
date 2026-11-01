import type { DocumentType, ValidateOptions } from '../types'
import { territory, type Territory } from './municipalities'
import {
  compactNumeric,
  formatComplete,
  formatDigits,
  validateNumeric,
} from './numeric'
import { RNP_CODES, SAR_RTN } from './sources'

// ponytail: the 14th digit isn't checked; SAR hasn't published the algorithm.
// Add an INVALID_CHECK_DIGIT error once it's confirmed against real RTNs.
const validate = (value: string, options?: ValidateOptions) =>
  validateNumeric(value, 14, options)

export interface RtnParts extends Territory {
  year: number
  sequence: string
  /** The last digit. For a person, the first 13 digits are their DNI. */
  checkDigit: string
}

/** Decodes a valid RTN; returns `undefined` for an invalid one. */
export function parse(value: string): RtnParts | undefined {
  const result = validate(value)
  if (!result.valid) return undefined
  const c = result.compact
  return {
    ...territory(c),
    year: Number(c.slice(4, 8)),
    sequence: c.slice(8, 13),
    checkDigit: c.slice(13),
  }
}

/** Registro Tributario Nacional (SAR): 14 digits, `DDMM-YYYY-NNNNN-D`. */
export const rtn: DocumentType = {
  country: 'HN',
  code: 'RTN',
  name: {
    es: 'Registro Tributario Nacional',
    en: 'National Tax Registry Number',
  },
  appliesTo: 'both',
  validation: 'structural',
  sources: [RNP_CODES, SAR_RTN],
  example: '0801-1990-00000-1',
  placeholder: '0000-0000-00000-0',
  maxLength: 17,
  mask: '0000-0000-00000-0',
  compact: compactNumeric,
  format: (value, options) => formatComplete(value, 14, options),
  formatPartial: (value, options) => formatDigits(value, 14, options),
  validate,
}
