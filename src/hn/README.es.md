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

[English](https://github.com/ValTechStudio/personal-id-validator/blob/main/src/hn/README.md) · [Volver a la documentación principal](https://github.com/ValTechStudio/personal-id-validator/blob/main/README.es.md)

Cada documento es un [`DocumentType`](https://github.com/ValTechStudio/personal-id-validator/blob/main/README.es.md#documenttype): `validate`, `applyMask`, `compact` y los campos de datos funcionan igual en todos los países. Esta página cubre lo propio de Honduras.

## Exportaciones

| Exportación     | Tipo                               | Descripción                                                      |
| --------------- | ---------------------------------- | ---------------------------------------------------------------- |
| `dni`           | `DocumentType`                     | Documento Nacional de Identidad                                  |
| `rtn`           | `DocumentType`                     | Registro Tributario Nacional                                     |
| `passport`      | `DocumentType`                     | Pasaporte                                                        |
| `residence`     | `DocumentType`                     | Carné de residente (INM)                                         |
| `documentTypes` | `DocumentType[]`                   | Los cuatro anteriores, por ejemplo para un selector de documento |
| `parseDni`      | `(value) => DniParts \| undefined` | Decodifica un DNI válido                                         |
| `parseRtn`      | `(value) => RtnParts \| undefined` | Decodifica un RTN válido                                         |
| `departments`   | `{ name, municipalities }[]`       | La tabla del RNP: 18 departamentos y 298 municipios              |

Tipos: `DniParts`, `RtnParts`, `Territory`.

## Documentos

| `code`            | Exportación | `validation` | Máscara             | `maxLength` | Errores que puede devolver                                                                       |
| ----------------- | ----------- | ------------ | ------------------- | ----------- | ------------------------------------------------------------------------------------------------ |
| `DNI`             | `dni`       | `structural` | `0000-0000-00000`   | 15          | `INVALID_FORMAT`, `INVALID_LENGTH`, `INVALID_DEPARTMENT`, `INVALID_MUNICIPALITY`, `INVALID_YEAR` |
| `RTN`             | `rtn`       | `structural` | `0000-0000-00000-0` | 17          | los mismos que el DNI                                                                            |
| `PASAPORTE`       | `passport`  | `loose`      | ninguna             | 9           | `INVALID_FORMAT`, `INVALID_LENGTH`                                                               |
| `CARNE_RESIDENTE` | `residence` | `loose`      | ninguna             | 20          | `INVALID_FORMAT`, `INVALID_LENGTH`                                                               |

### DNI

13 dígitos, `DDMM-AAAA-NNNNN`:

- El departamento `DD` y el municipio `MM` deben existir en la [tabla de códigos del RNP](https://web.archive.org/web/2018/http://www.rnp.hn/wp-content/uploads/2011/02/Cuadro-de-C%C3%83%C2%B3digos-de-Departamento-y-Municipios.pdf).
- `AAAA` es el año de inscripción del nacimiento (casi siempre, no siempre, el año de nacimiento), entre 1900 y el año actual.
- `NNNNN` es un correlativo. No hay dígito verificador público, así que la validación es estructural.

```ts
dni.validate('0801-1990-00000') // { valid: true, value: '0801199000000' }
dni.validate('0899199000000') // { valid: false, error: 'INVALID_MUNICIPALITY' }
dni.applyMask('080119') // '0801-19'
dni.applyMask('0801199000000', { separator: ' ' }) // '0801 1990 00000'
```

### RTN

14 dígitos, `DDMM-AAAA-NNNNN-D`. Según el [SAR](https://www.sar.gob.hn/registro-tributario-nacional-rtn/), el RTN de una persona es su DNI más un dígito, así que los primeros 13 siguen las reglas del DNI. El último es un dígito verificador cuyo algoritmo el SAR no ha publicado, así que no se verifica.

```ts
rtn.validate('0801-1990-00000-1') // { valid: true, value: '08011990000001' }
rtn.applyMask('08011990000001') // '0801-1990-00000-1'
```

### Pasaporte y carné de residente

No hay un formato oficial publicado ([OACI Doc 9303](https://www.icao.int/publications/doc-series/doc-9303) para el pasaporte, [Portal de Trámites](https://tramites.diger.gob.hn/landingPage/DetalleTramite/293) para el carné), así que solo se revisan caracteres y longitud: de 1 a 9 letras o dígitos para el pasaporte (el límite de OACI para el número de documento) y de 1 a 20 para el carné. Ambos son `validation: 'loose'`; tu interfaz debería decir que la validación es limitada en vez de llamar "válido" al número.

`applyMask` pasa a mayúsculas, quita separadores y corta lo que sobra; ignora `separator`.

```ts
passport.validate(' a 000-0000 ') // { valid: true, value: 'A0000000' }
residence.validate('A/1') // { valid: false, error: 'INVALID_FORMAT' }
```

## Decodificar

`parseDni(value)` y `parseRtn(value)` decodifican un número válido y devuelven `undefined` si no lo es.

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

| Campo          | `DniParts` | `RtnParts` | Descripción                                    |
| -------------- | ---------- | ---------- | ---------------------------------------------- |
| `department`   | ✓          | ✓          | `{ code: 'DD', name }`                         |
| `municipality` | ✓          | ✓          | `{ code: 'DDMM', name }`                       |
| `year`         | ✓          | ✓          | Año de inscripción                             |
| `sequence`     | ✓          | ✓          | El correlativo de 5 dígitos                    |
| `checkDigit`   |            | ✓          | Último dígito (no se verifica, ver RTN arriba) |

## `departments`

La tabla del RNP, en orden de código. El código de un municipio es el código de su departamento más su posición (desde 1): `departments[7].municipalities[0]` es `0801`, Distrito Central.

```ts
departments.map((d, i) => ({
  code: String(i + 1).padStart(2, '0'),
  name: d.name,
}))
```

## Limitaciones

- El DNI no tiene dígito verificador público, así que la validación es estructural.
- El último dígito del RTN no se verifica hasta confirmar el algoritmo del SAR.
- Los ejemplos de pasaporte y carné de residente son ilustrativos.
