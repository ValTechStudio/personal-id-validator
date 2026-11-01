import * as hn from './hn'
import { fail } from './messages'
import type { DocumentType, ValidateOptions, ValidationResult } from './types'

export type {
  DocumentType,
  FormatOptions,
  Locale,
  ValidateOptions,
  ValidationError,
  ValidationResult,
} from './types'
export { messages } from './messages'
export { hn }

// The library targets ES2020 without DOM/Node typings.
declare const console: { warn(...data: unknown[]): void }

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

const warned = new Set<string>()

/**
 * Validates `value` as the given document type. Unsupported types return
 * `UNSUPPORTED_DOCUMENT_TYPE` and log one `console.warn` per country/code.
 */
export function validateDocument(
  country: string,
  code: string,
  value: string,
  options?: ValidateOptions,
): ValidationResult {
  const type = getDocumentType(country, code)
  if (type) return type.validate(value, options)
  const key = `${country}:${code}`.toUpperCase()
  if (!warned.has(key)) {
    warned.add(key)
    const supported = Object.entries(countries)
      .flatMap(([c, types]) => types.map((t) => `${c}:${t.code}`))
      .join(', ')
    console.warn(
      `[personal-id-validator] Unsupported document type "${key}". Supported: ${supported}.`,
    )
  }
  return fail('UNSUPPORTED_DOCUMENT_TYPE', options)
}
