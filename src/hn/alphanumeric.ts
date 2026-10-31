import type { DocumentType } from '../types'

const compact = (value: string) => value.replace(/[\s.-]/g, '').toUpperCase()

// Passport and residence card: no published national format, only a length cap.
export function alphanumeric(
  maxLength: number,
): Pick<
  DocumentType,
  'compact' | 'format' | 'formatPartial' | 'validate' | 'maxLength'
> {
  return {
    maxLength,
    compact,
    format: compact,
    formatPartial: (value) => compact(value).slice(0, maxLength),
    validate: (value) => {
      const c = compact(value)
      if (!/^[A-Z0-9]*$/.test(c))
        return { valid: false, error: 'INVALID_FORMAT' }
      if (c.length < 1 || c.length > maxLength)
        return { valid: false, error: 'INVALID_LENGTH' }
      return { valid: true, compact: c }
    },
  }
}
