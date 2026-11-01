# @valtechstudio/personal-id-validator

[![npm](https://img.shields.io/npm/v/@valtechstudio/personal-id-validator)](https://www.npmjs.com/package/@valtechstudio/personal-id-validator)
[![CI](https://github.com/ValTechStudio/personal-id-validator/actions/workflows/ci.yml/badge.svg)](https://github.com/ValTechStudio/personal-id-validator/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/@valtechstudio/personal-id-validator)](./LICENSE)

Valida, formatea y decodifica documentos de identidad de Latinoamérica. Primero Honduras: **DNI, RTN, pasaporte y carné de residente**. Sin dependencias, en TypeScript, funciona en el navegador y en Node (ESM y CommonJS).

**[Demo en vivo](https://valtechstudio.com/open-source/@valtechstudio/personal-id-validator)** · [English](./README.md)

```sh
npm install @valtechstudio/personal-id-validator
```

## Uso

```ts
import { dni, parseDni } from '@valtechstudio/personal-id-validator/hn'

dni.validate('0801-1990-00000') // { valid: true, compact: '0801199000000' }
dni.validate('0899199000000') // { valid: false, error: 'INVALID_MUNICIPALITY' }

dni.compact('0801-1990-00000') // '0801199000000'  → guarda y compara este valor
dni.format('0801199000000') // '0801-1990-00000' → muestra este

parseDni('0501-1985-00000')
// { department: { code: '05', name: 'Cortés' },
//   municipality: { code: '0501', name: 'San Pedro Sula' }, year: 1985, sequence: '00000' }
```

### Elegir el tipo en tiempo de ejecución

Si el tipo viene de datos (por ejemplo, de la base de datos), usa `validateDocument`. Los tipos no soportados devuelven un error en vez de lanzar una excepción, y escriben un `console.warn` por cada tipo desconocido para que lo notes al desarrollar:

```ts
import { validateDocument } from '@valtechstudio/personal-id-validator'

validateDocument('HN', 'RTN', '0801-1990-00000-1', { locale: 'es' })
// { valid: true, compact: '08011990000001' }

validateDocument('GT', 'CUI', '1234')
// { valid: false, error: 'UNSUPPORTED_DOCUMENT_TYPE' } + console.warn
```

`getDocumentType(country, code)` devuelve el tipo de documento (datos y funciones) o `undefined`.

### Opciones

| Función                        | Opción            | Por defecto | Efecto                                                                                                |
| ------------------------------ | ----------------- | ----------- | ----------------------------------------------------------------------------------------------------- |
| `validate`, `validateDocument` | `allowSeparators` | `true`      | `false` rechaza espacios, puntos y guiones (`INVALID_FORMAT`), para APIs que exigen el valor compacto |
| `validate`, `validateDocument` | `locale`          | ninguno     | `'es'` o `'en'`: los resultados con error incluyen también un `message`                               |
| `format`, `formatPartial`      | `separator`       | `'-'`       | Separador entre grupos, por ejemplo `' '` o `''`. Pasaporte y carné de residente lo ignoran           |

```ts
dni.format('0801199000000', { separator: ' ' }) // '0801 1990 00000'
dni.validate('0801-1990-00000', { allowSeparators: false }) // { valid: false, error: 'INVALID_FORMAT' }
```

### Máscaras en inputs

`formatPartial(value)` formatea un valor incompleto (`'080119'` → `'0801-19'`). Solo transforma textos. Si escribes su resultado de vuelta en un input controlado, el navegador mueve el cursor al final, así que restaura el cursor tú mismo o usa una librería de máscaras con el patrón `mask` (`0` = dígito), como [Maskito](https://maskito.dev) o [IMask](https://imask.js.org):

```ts
dni.mask // '0000-0000-00000'
rtn.mask // '0000-0000-00000-0'
```

### Con Zod / react-hook-form

```ts
z.string().refine((v) => dni.validate(v).valid, 'DNI inválido')
```

Cada tipo de documento incluye datos para formularios: `name` (`es`/`en`), `appliesTo` (`person` | `company` | `both`), `validation` (`structural` | `loose`), `sources`, `example`, `placeholder`, `maxLength` y `mask`.

## Documentos soportados (Honduras)

| Código            | Documento                       | Validación  | Regla                                                                                     | Fuente                                                                                                                                                       |
| ----------------- | ------------------------------- | ----------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `DNI`             | Documento Nacional de Identidad | estructural | 13 dígitos `DDMM-AAAA-NNNNN`: departamento y municipio reales, año 1900–hoy               | [Tabla del RNP](https://web.archive.org/web/2018/http://www.rnp.hn/wp-content/uploads/2011/02/Cuadro-de-C%C3%83%C2%B3digos-de-Departamento-y-Municipios.pdf) |
| `RTN`             | Registro Tributario Nacional    | estructural | 14 dígitos: el RTN de una persona es su DNI más 1 dígito; el último dígito no se verifica | [SAR](https://www.sar.gob.hn/registro-tributario-nacional-rtn/), RNP                                                                                         |
| `PASAPORTE`       | Pasaporte                       | flexible    | 1–9 letras o dígitos (límite de OACI para el número de documento)                         | [OACI Doc 9303](https://www.icao.int/publications/doc-series/doc-9303)                                                                                       |
| `CARNE_RESIDENTE` | Carné de residente (INM)        | flexible    | 1–20 letras o dígitos                                                                     | [Portal de Trámites](https://tramites.diger.gob.hn/landingPage/DetalleTramite/293)                                                                           |

**Flexible** (`loose`) significa que no hay un formato oficial publicado, así que solo se revisan los caracteres y la longitud. Una interfaz debería decirlo en vez de afirmar que el número es "válido".

Códigos de error: `INVALID_FORMAT`, `INVALID_LENGTH`, `INVALID_DEPARTMENT`, `INVALID_MUNICIPALITY`, `INVALID_YEAR`, `UNSUPPORTED_DOCUMENT_TYPE`. Los textos en español e inglés están en `messages`.

## Limitaciones

- **Un formato válido no significa que el documento exista.** Eso solo lo confirman los registros oficiales (RNP, SAR), que esta librería no consulta.
- El DNI no tiene dígito verificador público, así que la validación es estructural.
- El último dígito del RTN es verificador, pero el SAR no ha publicado el algoritmo. Se acepta tal cual hasta confirmarlo.
- El pasaporte y el carné de residente no tienen un formato nacional publicado. Sus ejemplos son ilustrativos.

¿Un documento real es rechazado? [Abre un issue](https://github.com/ValTechStudio/personal-id-validator/issues) (nunca publiques el número real).

## Hoja de ruta

- Más países de Centroamérica: Guatemala (CUI, NIT), El Salvador (DUI, NIT), Nicaragua (cédula), Costa Rica, Panamá.
- Dígito verificador del RTN, cuando se confirme el algoritmo.
- Reglas más estrictas para pasaporte y carné de residente si se publican formatos oficiales.

¿Quieres alguno antes? Abre un issue o un pull request.

## Contribuir

Se aceptan nuevos países y tipos de documento. Lee [CONTRIBUTING.md](./CONTRIBUTING.md).

## Licencia

MIT © [Val Tech Studio](https://valtechstudio.com)
