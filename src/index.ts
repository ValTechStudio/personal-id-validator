import * as hn from './hn'
import type { DocumentType } from './types'

export type { DocumentType, ValidationError, ValidationResult } from './types'
export { messages } from './messages'
export { hn }

const countries: Record<string, readonly DocumentType[]> = {
  HN: hn.documentTypes,
}

/** Looks up a document type, e.g. `getDocumentType('HN', 'DNI')`. `undefined` when unsupported. */
export function getDocumentType(
  country: string,
  code: string,
): DocumentType | undefined {
  return countries[country.toUpperCase()]?.find(
    (t) => t.code === code.toUpperCase(),
  )
}
