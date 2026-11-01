# @valtechstudio/personal-id-validator

[![npm](https://img.shields.io/npm/v/@valtechstudio/personal-id-validator)](https://www.npmjs.com/package/@valtechstudio/personal-id-validator)
[![npm downloads](https://img.shields.io/npm/dm/@valtechstudio/personal-id-validator)](https://www.npmjs.com/package/@valtechstudio/personal-id-validator)
[![bundle size](https://img.shields.io/bundlejs/size/@valtechstudio/personal-id-validator)](https://bundlejs.com/?q=@valtechstudio/personal-id-validator)
[![types](https://img.shields.io/npm/types/@valtechstudio/personal-id-validator)](./src/types.ts)
[![CI](https://github.com/ValTechStudio/personal-id-validator/actions/workflows/ci.yml/badge.svg)](https://github.com/ValTechStudio/personal-id-validator/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/@valtechstudio/personal-id-validator)](./LICENSE)

Validate, mask and parse Latin American personal ID documents. Honduras first: **DNI, RTN, passport and residence card**. Zero dependencies, TypeScript, works in the browser and Node (ESM and CommonJS).

**[Live demo](https://valtechstudio.com/open-source/@valtechstudio/personal-id-validator)** · [Español](./README.es.md)

```sh
npm install @valtechstudio/personal-id-validator
```

## Quick start

```ts
import { dni } from '@valtechstudio/personal-id-validator/hn'

const result = dni.validate('0801-1990-00000')
// { valid: true, value: '0801199000000' }  → store and compare result.value

dni.applyMask('0801199000000') // '0801-1990-00000' → display this
```

## Entry points

The package has a **root entry** with the country-independent API, and one **entry per country** with its document types and country-specific helpers.

| Import                                      | What's in it                                                                           |
| ------------------------------------------- | -------------------------------------------------------------------------------------- |
| `@valtechstudio/personal-id-validator`      | `validateDocument`, `getDocumentType`, `messages`, and the shared types (below)        |
| `@valtechstudio/personal-id-validator/<cc>` | That country's document types (each one a [`DocumentType`](#documenttype)) and helpers |

### Countries

| Code | Country  | Import                                    | Documents                                    | Docs                                                                                                                                                                                           |
| ---- | -------- | ----------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HN` | Honduras | `@valtechstudio/personal-id-validator/hn` | `DNI`, `RTN`, `PASAPORTE`, `CARNE_RESIDENTE` | [English](https://github.com/ValTechStudio/personal-id-validator/blob/main/src/hn/README.md) · [Español](https://github.com/ValTechStudio/personal-id-validator/blob/main/src/hn/README.es.md) |

## Root API

### `validateDocument(country, code, value, options?)`

Validates `value` as the document type `country:code` (both case-insensitive). Use it when the type comes from data, e.g. a database row. Returns a [`ValidationResult`](#validationresult).

Unsupported types don't throw: they return `UNSUPPORTED_DOCUMENT_TYPE` and log one `console.warn` per unknown type, listing the supported ones.

```ts
import { validateDocument } from '@valtechstudio/personal-id-validator'

validateDocument('HN', 'RTN', '0801-1990-00000-1')
// { valid: true, value: '08011990000001' }

validateDocument('HN', 'DNI', '0899199000000', { locale: 'en' })
// { valid: false, error: 'INVALID_MUNICIPALITY', message: 'The municipality code does not exist.' }

validateDocument('GT', 'CUI', '1234')
// { valid: false, error: 'UNSUPPORTED_DOCUMENT_TYPE' } + console.warn
```

### `getDocumentType(country, code)`

Returns the [`DocumentType`](#documenttype) for `country:code`, or `undefined` when unsupported. Use it to build forms from data (label, placeholder, `maxLength`, mask).

```ts
const type = getDocumentType('HN', 'DNI')
type?.placeholder // '0000-0000-00000'
type?.applyMask('080119') // '0801-19'
```

### `messages`

`messages[locale][error]`: the error texts in `'es'` and `'en'`, for when you show your own copy or translate the code yourself.

## `DocumentType`

Every document type, from any country, has the same shape. Validation is the same call whether you import the type directly or use `validateDocument`.

| Member                       | Type                               | Description                                                                                                        |
| ---------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `validate(value, options?)`  | `ValidationResult`                 | Accepts spaces, dots and dashes; `result.value` is the normalized value                                            |
| `applyMask(value, options?)` | `string`                           | Display form of a full or partial value: inserts separators, uppercases, drops anything past the document's length |
| `compact(value)`             | `string`                           | Strips separators and spaces, without validating                                                                   |
| `country`                    | `string`                           | ISO country code, e.g. `'HN'`                                                                                      |
| `code`                       | `string`                           | Stable identifier, e.g. `'DNI'`                                                                                    |
| `name`                       | `{ es: string; en: string }`       | Human name                                                                                                         |
| `appliesTo`                  | `'person' \| 'company' \| 'both'`  | Who holds this document                                                                                            |
| `validation`                 | `'structural' \| 'loose'`          | `loose`: no official format is published, only characters and length are checked. Say so in your UI.               |
| `sources`                    | `{ label: string; url: string }[]` | Official references for the rules                                                                                  |
| `example`                    | `string`                           | A masked, made-up example                                                                                          |
| `placeholder`                | `string`                           | For an input's `placeholder`                                                                                       |
| `maxLength`                  | `number`                           | Length of the masked value with the default separator, for an input's `maxLength`                                  |
| `mask`                       | `string \| undefined`              | Pattern for input-mask libraries (`0` = digit). Only numeric documents.                                            |

### Options

| Option      | Used by                        | Default | Effect                                                                         |
| ----------- | ------------------------------ | ------- | ------------------------------------------------------------------------------ |
| `locale`    | `validate`, `validateDocument` | none    | `'es'` or `'en'`: failed results also include a `message`                      |
| `separator` | `applyMask`                    | `'-'`   | Separator between groups, e.g. `' '` or `''`. Alphanumeric documents ignore it |

### `ValidationResult`

```ts
type ValidationResult =
  | { valid: true; value: string } // normalized: no separators, uppercase
  | { valid: false; error: ValidationError; message?: string } // message only with `locale`
```

`value` never depends on the input's separators, so the same document always stores as the same string. To display it, use `applyMask(result.value)`.

### Error codes

| Code                        | English                                   | Español                                   |
| --------------------------- | ----------------------------------------- | ----------------------------------------- |
| `INVALID_FORMAT`            | Contains characters that are not allowed. | Contiene caracteres no permitidos.        |
| `INVALID_LENGTH`            | The number of characters is not correct.  | La cantidad de caracteres no es correcta. |
| `INVALID_DEPARTMENT`        | The department code does not exist.       | El código de departamento no existe.      |
| `INVALID_MUNICIPALITY`      | The municipality code does not exist.     | El código de municipio no existe.         |
| `INVALID_YEAR`              | The year is not valid.                    | El año no es válido.                      |
| `UNSUPPORTED_DOCUMENT_TYPE` | This document type is not supported.      | Este tipo de documento no está soportado. |

Which codes a document can return is listed in its country's docs.

## Recipes

### Input masks

`applyMask` only transforms strings. If you write its result back into a controlled input, the browser moves the caret to the end, so either restore the caret yourself (the [demo](https://valtechstudio.com/open-source/@valtechstudio/personal-id-validator) does) or feed `mask` to an input-mask library such as [Maskito](https://maskito.dev) or [IMask](https://imask.js.org):

```tsx
;<input placeholder={dni.placeholder} maxLength={dni.maxLength} />
dni.mask // '0000-0000-00000'
```

### With Zod / react-hook-form

```ts
z.string().refine((v) => dni.validate(v).valid, 'DNI inválido')
```

## Limitations

- **A valid format does not mean the document exists.** Checking that requires the official registries, which this library doesn't call.
- Country-specific limitations (unpublished check digits, loose formats) are listed in each country's docs.

Found a real document that's rejected? [Open an issue](https://github.com/ValTechStudio/personal-id-validator/issues) (never post the real number).

## Roadmap

- More Central American countries: Guatemala (CUI, NIT), El Salvador (DUI, NIT), Nicaragua (cédula), Costa Rica, Panamá.
- RTN check digit, once the algorithm is confirmed.
- Stricter passport and residence card rules if official formats are published.

Want one of these sooner? Open an issue or a pull request.

## Contributing

New countries and document types are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT © [Val Tech Studio](https://valtechstudio.com)
