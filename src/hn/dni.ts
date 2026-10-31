import type { DocumentType } from '../types'
import { territory, type Territory } from './municipalities'
import { compactNumeric, formatDigits, validateNumeric } from './numeric'

const validate = (value: string) => validateNumeric(value, 13)

export interface DniParts extends Territory {
  /** Year the birth was registered (usually, not always, the birth year). */
  year: number
  sequence: string
}

/** Decodes a valid DNI; returns `undefined` for an invalid one. */
export function parse(value: string): DniParts | undefined {
  const result = validate(value)
  if (!result.valid) return undefined
  const c = result.compact
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
  example: '0801-1990-00000',
  placeholder: '0000-0000-00000',
  maxLength: 15,
  compact: compactNumeric,
  format: (value) => {
    const c = compactNumeric(value)
    return /^\d{13}$/.test(c) ? formatDigits(c, 13) : c
  },
  formatPartial: (value) => formatDigits(value, 13),
  validate,
}
