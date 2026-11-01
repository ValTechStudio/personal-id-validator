# Honduras (`HN`)

```ts
import {
  dni,
  rtn,
  passport,
  residence,
  documentTypes,
  parseDni,
  parseRtn,
  departments,
} from '@valtechstudio/personal-id-validator/hn'
```

[Español](https://github.com/ValTechStudio/personal-id-validator/blob/main/src/hn/README.es.md) · [Back to the main docs](https://github.com/ValTechStudio/personal-id-validator#readme)

Each document is a [`DocumentType`](https://github.com/ValTechStudio/personal-id-validator#documenttype): `validate`, `applyMask`, `compact` and the metadata fields work the same in every country. This page covers what's specific to Honduras.

## Exports

| Export          | Type                               | Description                                            |
| --------------- | ---------------------------------- | ------------------------------------------------------ |
| `dni`           | `DocumentType`                     | Documento Nacional de Identidad                        |
| `rtn`           | `DocumentType`                     | Registro Tributario Nacional                           |
| `passport`      | `DocumentType`                     | Passport                                               |
| `residence`     | `DocumentType`                     | Residence card (carné de residente, INM)               |
| `documentTypes` | `DocumentType[]`                   | The four above, e.g. to render a document-type picker  |
| `parseDni`      | `(value) => DniParts \| undefined` | Decodes a valid DNI                                    |
| `parseRtn`      | `(value) => RtnParts \| undefined` | Decodes a valid RTN                                    |
| `departments`   | `{ name, municipalities }[]`       | The RNP table of 18 departments and 298 municipalities |

Types: `DniParts`, `RtnParts`, `Territory`.

## Documents

| `code`            | Export      | `validation` | Mask                | `maxLength` | Errors it can return                                                                             |
| ----------------- | ----------- | ------------ | ------------------- | ----------- | ------------------------------------------------------------------------------------------------ |
| `DNI`             | `dni`       | `structural` | `0000-0000-00000`   | 15          | `INVALID_FORMAT`, `INVALID_LENGTH`, `INVALID_DEPARTMENT`, `INVALID_MUNICIPALITY`, `INVALID_YEAR` |
| `RTN`             | `rtn`       | `structural` | `0000-0000-00000-0` | 17          | same as DNI                                                                                      |
| `PASAPORTE`       | `passport`  | `loose`      | none                | 9           | `INVALID_FORMAT`, `INVALID_LENGTH`                                                               |
| `CARNE_RESIDENTE` | `residence` | `loose`      | none                | 20          | `INVALID_FORMAT`, `INVALID_LENGTH`                                                               |

### DNI

13 digits, `DDMM-YYYY-NNNNN`:

- `DD` department and `MM` municipality must exist in the [RNP code table](https://web.archive.org/web/2018/http://www.rnp.hn/wp-content/uploads/2011/02/Cuadro-de-C%C3%83%C2%B3digos-de-Departamento-y-Municipios.pdf).
- `YYYY` is the year the birth was registered (usually, not always, the birth year), between 1900 and the current year.
- `NNNNN` is a sequence number. There's no public check digit, so validation is structural.

```ts
dni.validate('0801-1990-00000') // { valid: true, value: '0801199000000' }
dni.validate('0899199000000') // { valid: false, error: 'INVALID_MUNICIPALITY' }
dni.applyMask('080119') // '0801-19'
dni.applyMask('0801199000000', { separator: ' ' }) // '0801 1990 00000'
```

### RTN

14 digits, `DDMM-YYYY-NNNNN-D`. According to [SAR](https://www.sar.gob.hn/registro-tributario-nacional-rtn/), a person's RTN is their DNI plus one digit, so the first 13 follow the DNI rules. The last digit is a check digit whose algorithm SAR hasn't published, so it isn't verified.

```ts
rtn.validate('0801-1990-00000-1') // { valid: true, value: '08011990000001' }
rtn.applyMask('08011990000001') // '0801-1990-00000-1'
```

### Passport and residence card

No official number format is published ([ICAO Doc 9303](https://www.icao.int/publications/doc-series/doc-9303) for passports, [Portal de Trámites](https://tramites.diger.gob.hn/landingPage/DetalleTramite/293) for the residence card), so only characters and length are checked: 1–9 letters or digits for the passport (the ICAO document-number limit), 1–20 for the residence card. Both are `validation: 'loose'`; your UI should say the check is limited instead of calling the number "valid".

`applyMask` uppercases, strips separators and truncates; `separator` is ignored.

```ts
passport.validate(' a 000-0000 ') // { valid: true, value: 'A0000000' }
residence.validate('A/1') // { valid: false, error: 'INVALID_FORMAT' }
```

## Parsing

`parseDni(value)` and `parseRtn(value)` decode a valid number and return `undefined` for an invalid one.

```ts
parseDni('0501-1985-00000')
// {
//   department: { code: '05', name: 'Cortés' },
//   municipality: { code: '0501', name: 'San Pedro Sula' },
//   year: 1985,
//   sequence: '00000',
// }

parseRtn('0801-1990-00000-1')
// { department: { … }, municipality: { code: '0801', name: 'Distrito Central' },
//   year: 1990, sequence: '00000', checkDigit: '1' }
```

| Field          | `DniParts` | `RtnParts` | Description                              |
| -------------- | ---------- | ---------- | ---------------------------------------- |
| `department`   | ✓          | ✓          | `{ code: 'DD', name }`                   |
| `municipality` | ✓          | ✓          | `{ code: 'DDMM', name }`                 |
| `year`         | ✓          | ✓          | Registration year                        |
| `sequence`     | ✓          | ✓          | The 5-digit sequence                     |
| `checkDigit`   |            | ✓          | Last digit (not verified, see RTN above) |

## `departments`

The RNP table, in code order. A municipality's code is its department code plus its 1-based position: `departments[7].municipalities[0]` is `0801`, Distrito Central.

```ts
departments.map((d, i) => ({
  code: String(i + 1).padStart(2, '0'),
  name: d.name,
}))
```

## Limitations

- The DNI has no public check digit, so validation is structural.
- The RTN's last digit isn't verified until SAR's algorithm is confirmed.
- Passport and residence card examples are illustrative.
