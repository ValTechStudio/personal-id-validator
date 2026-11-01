# @valtechstudio/personal-id-validator

[![npm](https://img.shields.io/npm/v/@valtechstudio/personal-id-validator)](https://www.npmjs.com/package/@valtechstudio/personal-id-validator)
[![npm downloads](https://img.shields.io/npm/dm/@valtechstudio/personal-id-validator)](https://www.npmjs.com/package/@valtechstudio/personal-id-validator)
[![bundle size](https://img.shields.io/bundlejs/size/@valtechstudio/personal-id-validator)](https://bundlejs.com/?q=@valtechstudio/personal-id-validator)
[![types](https://img.shields.io/npm/types/@valtechstudio/personal-id-validator)](./src/types.ts)
[![CI](https://github.com/ValTechStudio/personal-id-validator/actions/workflows/ci.yml/badge.svg)](https://github.com/ValTechStudio/personal-id-validator/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/@valtechstudio/personal-id-validator)](./LICENSE)

Validate, format and parse Latin American personal ID documents. Honduras first: **DNI, RTN, passport and residence card**. Zero dependencies, TypeScript, works in the browser and Node (ESM and CommonJS).

**[Live demo](https://valtechstudio.com/open-source/@valtechstudio/personal-id-validator)** · [Español](./README.es.md)

```sh
npm install @valtechstudio/personal-id-validator
```

## Usage

```ts
import { dni, parseDni } from '@valtechstudio/personal-id-validator/hn'

dni.validate('0801-1990-00000') // { valid: true, compact: '0801199000000' }
dni.validate('0899199000000') // { valid: false, error: 'INVALID_MUNICIPALITY' }

dni.compact('0801-1990-00000') // '0801199000000'  → store and compare this
dni.format('0801199000000') // '0801-1990-00000' → display this

parseDni('0501-1985-00000')
// { department: { code: '05', name: 'Cortés' },
//   municipality: { code: '0501', name: 'San Pedro Sula' }, year: 1985, sequence: '00000' }
```

### Pick the type at runtime

When the type comes from data (e.g. a database row), use `validateDocument`. Unsupported types return an error result instead of throwing, and log one `console.warn` per unknown type so you notice during development:

```ts
import { validateDocument } from '@valtechstudio/personal-id-validator'

validateDocument('HN', 'RTN', '0801-1990-00000-1', { locale: 'es' })
// { valid: true, compact: '08011990000001' }

validateDocument('GT', 'CUI', '1234')
// { valid: false, error: 'UNSUPPORTED_DOCUMENT_TYPE' } + console.warn
```

`getDocumentType(country, code)` returns the document type (metadata and functions) or `undefined`.

### Options

| Function                       | Option            | Default | Effect                                                                                             |
| ------------------------------ | ----------------- | ------- | -------------------------------------------------------------------------------------------------- |
| `validate`, `validateDocument` | `allowSeparators` | `true`  | `false` rejects spaces, dots and dashes (`INVALID_FORMAT`), for APIs that require the compact form |
| `validate`, `validateDocument` | `locale`          | none    | `'es'` or `'en'`: failed results also include a `message`                                          |
| `format`, `formatPartial`      | `separator`       | `'-'`   | Separator between groups, e.g. `' '` or `''`. Ignored by passport and residence card               |

```ts
dni.format('0801199000000', { separator: ' ' }) // '0801 1990 00000'
dni.validate('0801-1990-00000', { allowSeparators: false }) // { valid: false, error: 'INVALID_FORMAT' }
```

### Input masks

`formatPartial(value)` formats a partial value (`'080119'` → `'0801-19'`). It only transforms strings. If you write its result back into a controlled input, the browser moves the caret to the end, so either restore the caret yourself or use an input-mask library with the `mask` pattern (`0` = digit), for example [Maskito](https://maskito.dev) or [IMask](https://imask.js.org):

```ts
dni.mask // '0000-0000-00000'
rtn.mask // '0000-0000-00000-0'
```

### With Zod / react-hook-form

```ts
z.string().refine((v) => dni.validate(v).valid, 'DNI inválido')
```

Every document type also carries metadata for forms: `name` (`es`/`en`), `appliesTo` (`person` | `company` | `both`), `validation` (`structural` | `loose`), `sources`, `example`, `placeholder`, `maxLength` and `mask`.

## Supported documents (Honduras)

| Code              | Document                        | Validation | Rule                                                                                           | Source                                                                                                                                                        |
| ----------------- | ------------------------------- | ---------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DNI`             | Documento Nacional de Identidad | structural | 13 digits `DDMM-YYYY-NNNNN`: real department + municipality, year 1900–today                   | [RNP code table](https://web.archive.org/web/2018/http://www.rnp.hn/wp-content/uploads/2011/02/Cuadro-de-C%C3%83%C2%B3digos-de-Departamento-y-Municipios.pdf) |
| `RTN`             | Registro Tributario Nacional    | structural | 14 digits: a person's RTN is their DNI plus 1 digit; the last digit isn't verified (see below) | [SAR](https://www.sar.gob.hn/registro-tributario-nacional-rtn/), RNP                                                                                          |
| `PASAPORTE`       | Passport                        | loose      | 1–9 letters or digits (ICAO limit for the document number)                                     | [ICAO Doc 9303](https://www.icao.int/publications/doc-series/doc-9303)                                                                                        |
| `CARNE_RESIDENTE` | Residence card (INM)            | loose      | 1–20 letters or digits                                                                         | [Portal de Trámites](https://tramites.diger.gob.hn/landingPage/DetalleTramite/293)                                                                            |

**Loose** means no official number format is published, so only characters and length are checked. A UI should say so instead of claiming the number is "valid".

Error codes: `INVALID_FORMAT`, `INVALID_LENGTH`, `INVALID_DEPARTMENT`, `INVALID_MUNICIPALITY`, `INVALID_YEAR`, `UNSUPPORTED_DOCUMENT_TYPE`. Spanish and English texts are in `messages`.

## Limitations

- **A valid format does not mean the document exists.** Checking that requires the official registries (RNP, SAR), which this library doesn't call.
- The DNI has no public check digit, so validation is structural.
- The RTN's last digit is a check digit whose algorithm SAR hasn't published. It's accepted as-is until it's confirmed.
- Passport and residence card numbers have no published national format. Their examples are illustrative.

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
