import type { DocumentType } from '../types'
import { alphanumeric } from './alphanumeric'

// ponytail: loose check (1-20 letters/digits); the INM hasn't published the number format.
/** Carné de residente issued by the INM to foreign residents. */
export const residence: DocumentType = {
  country: 'HN',
  code: 'CARNE_RESIDENTE',
  name: { es: 'Carné de residente', en: 'Residence card' },
  appliesTo: 'person',
  example: 'A0000000',
  placeholder: 'A0000000',
  ...alphanumeric(20),
}
