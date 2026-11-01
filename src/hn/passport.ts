import type { DocumentType } from '../types'
import { alphanumeric } from './alphanumeric'
import { ICAO_9303 } from './sources'

// ponytail: loose check (1-9 letters/digits, the ICAO MRZ limit); Honduras hasn't published the number format.
/** Honduran passport. */
export const passport: DocumentType = {
  country: 'HN',
  code: 'PASAPORTE',
  name: { es: 'Pasaporte', en: 'Passport' },
  appliesTo: 'person',
  sources: [ICAO_9303],
  example: 'A0000000',
  placeholder: 'A0000000',
  ...alphanumeric(9),
}
