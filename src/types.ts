export type ValidationError =
  | 'INVALID_FORMAT'
  | 'INVALID_LENGTH'
  | 'INVALID_DEPARTMENT'
  | 'INVALID_MUNICIPALITY'
  | 'INVALID_YEAR'
  | 'UNSUPPORTED_DOCUMENT_TYPE'

export type Locale = 'es' | 'en'

export type ValidationResult =
  | { valid: true; compact: string }
  | {
      valid: false
      error: ValidationError
      /** Only set when `locale` was passed. */
      message?: string
    }

export interface ValidateOptions {
  /** `false` rejects values with spaces, dots or dashes (`INVALID_FORMAT`). Default `true`. */
  allowSeparators?: boolean
  /** Adds a `message` in this language to failed results. */
  locale?: Locale
}

export interface FormatOptions {
  /** Separator between groups. Default `'-'`. Ignored by alphanumeric documents. */
  separator?: string
}

export interface DocumentType {
  country: string
  /** Stable identifier, e.g. `DNI`. */
  code: string
  name: { es: string; en: string }
  appliesTo: 'person' | 'company' | 'both'
  /**
   * `structural`: every part of the number is checked against official rules.
   * `loose`: no official format is published, so only characters and length are checked.
   */
  validation: 'structural' | 'loose'
  /** Official sources for the rules. */
  sources: { label: string; url: string }[]
  /** A formatted, made-up example. */
  example: string
  placeholder: string
  /** Max length of the formatted value (default separator), for an input's `maxLength`. */
  maxLength: number
  /** Pattern for input-mask libraries such as IMask or Maskito: `0` is a digit. Only for numeric documents. */
  mask?: string
  /** Strips separators and spaces: the value to store and compare. */
  compact(value: string): string
  /** Canonical display form. Returns the compact value when it can't be formatted. */
  format(value: string, options?: FormatOptions): string
  /**
   * Formats a partial value. It only transforms strings: wiring it to a live
   * input also needs caret handling (or a mask library fed with `mask`).
   */
  formatPartial(value: string, options?: FormatOptions): string
  validate(value: string, options?: ValidateOptions): ValidationResult
}
