export type ValidationError =
  | 'INVALID_FORMAT'
  | 'INVALID_LENGTH'
  | 'INVALID_DEPARTMENT'
  | 'INVALID_MUNICIPALITY'
  | 'INVALID_YEAR'

export type ValidationResult =
  { valid: true; compact: string } | { valid: false; error: ValidationError }

export interface DocumentType {
  country: string
  /** Stable identifier, e.g. `DNI`. */
  code: string
  name: { es: string; en: string }
  appliesTo: 'person' | 'company' | 'both'
  /** A formatted, made-up example. */
  example: string
  placeholder: string
  /** Max length of the formatted value, for an input's `maxLength`. */
  maxLength: number
  /** Strips separators and spaces: the value to store and compare. */
  compact(value: string): string
  /** Canonical display form. Returns the compact value when it can't be formatted. */
  format(value: string): string
  /** Formats as the user types, for an input's `onChange`. */
  formatPartial(value: string): string
  validate(value: string): ValidationResult
}
