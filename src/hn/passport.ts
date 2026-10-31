import type { DocumentType } from '../types'
import { alphanumeric } from './alphanumeric'

/** Honduran passport. ICAO Doc 9303 caps the document number at 9 letters/digits. */
export const passport: DocumentType = {
  country: 'HN',
  code: 'PASAPORTE',
  name: { es: 'Pasaporte', en: 'Passport' },
  appliesTo: 'person',
  example: 'A0000000',
  placeholder: 'A0000000',
  ...alphanumeric(9),
}
