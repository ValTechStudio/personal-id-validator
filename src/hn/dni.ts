import type { DocumentType, ValidateOptions } from '../types'
import { territory, type Territory } from './municipalities'
import { compactNumeric, maskDigits, validateNumeric } from './numeric'
import { RNP_CODES } from './sources'

const validate = (value: string, options?: ValidateOptions) =>
  validateNumeric(value, 13, options)

export interface DniParts extends Territory {
  /** Year the birth was registered (usually, not always, the birth year). */
  year: number
  sequence: string
}

/** Decodes a valid DNI; returns `undefined` for an invalid one. */
export function parse(value: string): DniParts | undefined {
  const result = validate(value)
  if (!result.valid) return undefined
  const c = result.value
  return { ...territory(c), year: Number(c.slice(4, 8)), sequence: c.slice(8) }
}

/** Documento Nacional de Identidad (RNP): `DDMM-YYYY-NNNNN`. */
export const dni: DocumentType = {
  country: 'HN',
  code: 'DNI',
  name: {
    es: 'Documento Nacional de Identidad',
    en: 'National Identity Document',
  },
  appliesTo: 'person',
  validation: 'structural',
  sources: [RNP_CODES],
  example: '0801-1990-00000',
  placeholder: '0000-0000-00000',
  maxLength: 15,
  mask: '0000-0000-00000',
  compact: compactNumeric,
  applyMask: (value, options) => maskDigits(value, 13, options),
  validate,
}
