import { describe, expect, it, vi } from 'vitest'
import { getDocumentType, messages, validateDocument } from '../index'
import {
  departments,
  dni,
  parseDni,
  parseRtn,
  passport,
  residence,
  rtn,
} from '.'

// tsconfig has no DOM/Node typings (see src/index.ts).
declare const console: { warn(...data: unknown[]): void }

// Fixtures are made up and use sequence 00000 so they're unlikely to be anyone's real ID.
describe('municipalities', () => {
  it('has the 18 departments and 298 municipalities of the RNP table', () => {
    expect(departments).toHaveLength(18)
    expect(departments.flatMap((d) => d.municipalities)).toHaveLength(298)
  })
})

describe('DNI', () => {
  it.each([
    '0801199000000',
    '0801-1990-00000',
    ' 0801 1990 00000 ',
    '1628-2001-00000',
  ])('accepts %j', (value) => expect(dni.validate(value).valid).toBe(true))

  it.each([
    ['', 'INVALID_LENGTH'],
    ['080119900000', 'INVALID_LENGTH'],
    ['08011990000000', 'INVALID_LENGTH'],
    ['0801-1990-0000A', 'INVALID_FORMAT'],
    ['0001199000000', 'INVALID_DEPARTMENT'],
    ['1901199000000', 'INVALID_DEPARTMENT'],
    ['0800199000000', 'INVALID_MUNICIPALITY'],
    ['0829199000000', 'INVALID_MUNICIPALITY'],
    ['1105199000000', 'INVALID_MUNICIPALITY'],
    ['0801189900000', 'INVALID_YEAR'],
    [`0801${new Date().getFullYear() + 1}00000`, 'INVALID_YEAR'],
  ])('rejects %j with %s', (value, error) => {
    expect(dni.validate(value)).toEqual({ valid: false, error })
  })

  it('applies the mask', () => {
    expect(dni.applyMask('0801199000000')).toBe('0801-1990-00000')
    expect(dni.applyMask('0801')).toBe('0801')
    expect(dni.applyMask('08011')).toBe('0801-1')
    expect(dni.applyMask('0801-1990-0')).toBe('0801-1990-0')
    expect(dni.applyMask('0801199000000999')).toBe('0801-1990-00000')
    expect(dni.applyMask('ab08')).toBe('08')
    expect(dni.applyMask(dni.example)).toBe(dni.example)
    expect(dni.example).toHaveLength(dni.maxLength)
  })

  it('parses', () => {
    expect(parseDni('0501-1985-00000')).toEqual({
      department: { code: '05', name: 'Cortés' },
      municipality: { code: '0501', name: 'San Pedro Sula' },
      year: 1985,
      sequence: '00000',
    })
    expect(parseDni('0801')).toBeUndefined()
  })
})

describe('RTN', () => {
  it('accepts 14 digits starting with a valid territory and year', () => {
    expect(rtn.validate('0801-1990-00000-1')).toEqual({
      valid: true,
      value: '08011990000001',
    })
  })

  it.each([
    ['0801199000000', 'INVALID_LENGTH'],
    ['2001199000000-1', 'INVALID_DEPARTMENT'],
    ['0899199000000-1', 'INVALID_MUNICIPALITY'],
    ['0801099000000-1', 'INVALID_YEAR'],
  ])('rejects %j with %s', (value, error) => {
    expect(rtn.validate(value)).toEqual({ valid: false, error })
  })

  it('applies the mask and parses', () => {
    expect(rtn.applyMask('0801199000000')).toBe('0801-1990-00000')
    expect(rtn.applyMask('08011990000001')).toBe('0801-1990-00000-1')
    expect(rtn.example).toHaveLength(rtn.maxLength)
    expect(parseRtn('0801-1990-00000-1')).toMatchObject({
      municipality: { code: '0801', name: 'Distrito Central' },
      checkDigit: '1',
    })
  })
})

describe('passport and residence card', () => {
  it('normalizes case and separators', () => {
    expect(passport.validate(' a 000-0000 ')).toEqual({
      valid: true,
      value: 'A0000000',
    })
    expect(residence.applyMask('ab-12')).toBe('AB12')
  })

  it('enforces length and characters', () => {
    expect(passport.validate('A00000000')).toMatchObject({ valid: true })
    expect(passport.validate('A000000000')).toEqual({
      valid: false,
      error: 'INVALID_LENGTH',
    })
    expect(passport.validate('')).toEqual({
      valid: false,
      error: 'INVALID_LENGTH',
    })
    expect(residence.validate('A/1')).toEqual({
      valid: false,
      error: 'INVALID_FORMAT',
    })
    expect(residence.validate('A'.repeat(21))).toEqual({
      valid: false,
      error: 'INVALID_LENGTH',
    })
  })
})

describe('getDocumentType', () => {
  it('finds types case-insensitively and returns undefined otherwise', () => {
    expect(getDocumentType('hn', 'dni')).toBe(dni)
    expect(getDocumentType('HN', 'PASAPORTE')).toBe(passport)
    expect(getDocumentType('HN', 'OTRO')).toBeUndefined()
    expect(getDocumentType('GT', 'DNI')).toBeUndefined()
  })

  it('has a message for every error in both languages', () => {
    expect(Object.keys(messages.es)).toEqual(Object.keys(messages.en))
  })
})

describe('options', () => {
  it('locale adds a message to failures only', () => {
    expect(dni.validate('0899199000000', { locale: 'en' })).toEqual({
      valid: false,
      error: 'INVALID_MUNICIPALITY',
      message: messages.en.INVALID_MUNICIPALITY,
    })
    expect(dni.validate('0801199000000', { locale: 'es' })).not.toHaveProperty(
      'message',
    )
  })

  it('separator changes applyMask', () => {
    expect(dni.applyMask('0801199000000', { separator: ' ' })).toBe(
      '0801 1990 00000',
    )
    expect(rtn.applyMask('08011990000001', { separator: '' })).toBe(
      '08011990000001',
    )
    expect(dni.applyMask('080119', { separator: '.' })).toBe('0801.19')
    expect(dni.applyMask('0801 19', { separator: ' ' })).toBe('0801 19')
    expect(passport.applyMask('a-1', { separator: ' ' })).toBe('A1')
  })
})

describe('metadata', () => {
  it('marks structural vs loose validation, with sources', () => {
    expect([dni, rtn].map((t) => t.validation)).toEqual([
      'structural',
      'structural',
    ])
    expect([passport, residence].map((t) => t.validation)).toEqual([
      'loose',
      'loose',
    ])
    for (const t of [dni, rtn, passport, residence]) {
      expect(t.sources.length).toBeGreaterThan(0)
      for (const s of t.sources) expect(s.url).toMatch(/^https:\/\//)
    }
  })

  it('has masks for numeric documents that match their examples', () => {
    expect(dni.mask?.replace(/0/g, '9')).toBe(dni.example.replace(/\d/g, '9'))
    expect(rtn.mask?.replace(/0/g, '9')).toBe(rtn.example.replace(/\d/g, '9'))
    expect(passport.mask).toBeUndefined()
  })
})

describe('validateDocument', () => {
  it('validates supported types like the type itself', () => {
    expect(validateDocument('hn', 'dni', '0801-1990-00000')).toEqual(
      dni.validate('0801-1990-00000'),
    )
    expect(validateDocument('HN', 'RTN', '1', { locale: 'es' })).toMatchObject({
      error: 'INVALID_LENGTH',
      message: messages.es.INVALID_LENGTH,
    })
  })

  it('returns UNSUPPORTED_DOCUMENT_TYPE and warns once per type', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(validateDocument('GT', 'CUI', '123')).toEqual({
      valid: false,
      error: 'UNSUPPORTED_DOCUMENT_TYPE',
    })
    validateDocument('gt', 'cui', '456')
    validateDocument('HN', 'OTRO', '1', { locale: 'en' })
    expect(warn).toHaveBeenCalledTimes(2)
    expect(warn.mock.calls[0]?.[0]).toContain('GT:CUI')
    warn.mockRestore()
  })
})
