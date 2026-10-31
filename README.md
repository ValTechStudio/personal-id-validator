# @valtechstudio/personal-id-validator

[![npm](https://img.shields.io/npm/v/@valtechstudio/personal-id-validator)](https://www.npmjs.com/package/@valtechstudio/personal-id-validator)
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
dni.formatPartial('080119') // '0801-19'         → input mask, call it in onChange

parseDni('0501-1985-00000')
// { department: { code: '05', name: 'Cortés' },
//   municipality: { code: '0501', name: 'San Pedro Sula' }, year: 1985, sequence: '00000' }
```

Pick the type at runtime (e.g. from a database row) with `getDocumentType`:

```ts
import { getDocumentType, messages } from '@valtechstudio/personal-id-validator'

const type = getDocumentType('HN', 'RTN') // undefined if unsupported
const result = type?.validate(input)
if (result && !result.valid) showError(messages.es[result.error])
```

With Zod / react-hook-form:

```ts
z.string().refine((v) => dni.validate(v).valid, 'DNI inválido')
```

Every document type also carries metadata for forms: `name` (`es`/`en`), `appliesTo` (`person` | `company` | `both`), `example`, `placeholder` and `maxLength`.

## Supported documents (Honduras)

| Code              | Document                        | Rule                                                                                     |
| ----------------- | ------------------------------- | ---------------------------------------------------------------------------------------- |
| `DNI`             | Documento Nacional de Identidad | 13 digits `DDMM-YYYY-NNNNN`: real department + municipality (RNP table), year 1900–today |
| `RTN`             | Registro Tributario Nacional    | 14 digits, same first 13 rules as DNI, plus 1 digit (not verified, see below)            |
| `PASAPORTE`       | Passport                        | 1–9 letters or digits (ICAO Doc 9303 limit)                                              |
| `CARNE_RESIDENTE` | Residence card (INM)            | 1–20 letters or digits (loose: no official format published)                             |

Error codes: `INVALID_FORMAT`, `INVALID_LENGTH`, `INVALID_DEPARTMENT`, `INVALID_MUNICIPALITY`, `INVALID_YEAR`. Spanish and English texts are in `messages`; use your own for other wording.

## Limitations

- **A valid format does not mean the document exists.** Checking that requires the official registries (RNP, SAR), which this library doesn't call.
- The DNI has no public check digit, so validation is structural.
- The RTN's last digit is a check digit whose algorithm SAR hasn't published. It's accepted as-is until it's confirmed.
- Passport and residence card numbers have no published national format. Their examples are illustrative.
- Municipality codes come from the RNP's [department and municipality code table](https://web.archive.org/web/2018/http://www.rnp.hn/wp-content/uploads/2011/02/Cuadro-de-C%C3%83%C2%B3digos-de-Departamento-y-Municipios.pdf) (298 municipalities).

Found a real document that's rejected? [Open an issue](https://github.com/ValTechStudio/personal-id-validator/issues) (never post the real number).

## Contributing

New countries and document types are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT © [Val Tech Studio](https://valtechstudio.com)
