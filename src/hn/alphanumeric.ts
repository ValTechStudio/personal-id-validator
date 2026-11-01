import { fail, hasSeparators } from '../messages'
import type { DocumentType } from '../types'

const compact = (value: string) => value.replace(/[\s.-]/g, '').toUpperCase()

// Passport and residence card: no published national format, only a length cap.
export function alphanumeric(
  maxLength: number,
): Pick<
  DocumentType,
  | 'validation'
  | 'compact'
  | 'format'
  | 'formatPartial'
  | 'validate'
  | 'maxLength'
> {
  return {
    validation: 'loose',
    maxLength,
    compact,
    format: compact,
    formatPartial: (value) => compact(value).slice(0, maxLength),
    validate: (value, options) => {
      if (options?.allowSeparators === false && hasSeparators(value))
        return fail('INVALID_FORMAT', options)
      const c = compact(value)
      if (!/^[A-Z0-9]*$/.test(c)) return fail('INVALID_FORMAT', options)
      if (c.length < 1 || c.length > maxLength)
        return fail('INVALID_LENGTH', options)
      return { valid: true, compact: c }
    },
  }
}
