import type {
  Locale,
  ValidateOptions,
  ValidationError,
  ValidationResult,
} from './types'

export const messages: Record<Locale, Record<ValidationError, string>> = {
  es: {
    INVALID_FORMAT: 'Contiene caracteres no permitidos.',
    INVALID_LENGTH: 'La cantidad de caracteres no es correcta.',
    INVALID_DEPARTMENT: 'El código de departamento no existe.',
    INVALID_MUNICIPALITY: 'El código de municipio no existe.',
    INVALID_YEAR: 'El año no es válido.',
    UNSUPPORTED_DOCUMENT_TYPE: 'Este tipo de documento no está soportado.',
  },
  en: {
    INVALID_FORMAT: 'Contains characters that are not allowed.',
    INVALID_LENGTH: 'The number of characters is not correct.',
    INVALID_DEPARTMENT: 'The department code does not exist.',
    INVALID_MUNICIPALITY: 'The municipality code does not exist.',
    INVALID_YEAR: 'The year is not valid.',
    UNSUPPORTED_DOCUMENT_TYPE: 'This document type is not supported.',
  },
}

export function fail(
  error: ValidationError,
  options?: ValidateOptions,
): ValidationResult {
  return options?.locale
    ? { valid: false, error, message: messages[options.locale][error] }
    : { valid: false, error }
}

export const hasSeparators = (value: string) => /[\s.-]/.test(value)
