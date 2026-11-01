# @valtechstudio/personal-id-validator

[![npm](https://img.shields.io/npm/v/@valtechstudio/personal-id-validator)](https://www.npmjs.com/package/@valtechstudio/personal-id-validator)
[![CI](https://github.com/ValTechStudio/personal-id-validator/actions/workflows/ci.yml/badge.svg)](https://github.com/ValTechStudio/personal-id-validator/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/@valtechstudio/personal-id-validator)](./LICENSE)

Valida, enmascara y decodifica documentos de identidad de Latinoamérica. Primero Honduras: **DNI, RTN, pasaporte y carné de residente**. Sin dependencias, en TypeScript, funciona en el navegador y en Node (ESM y CommonJS).

**[Demo en vivo](https://valtechstudio.com/open-source/@valtechstudio/personal-id-validator)** · [English](./README.md)

```sh
npm install @valtechstudio/personal-id-validator
```

## Inicio rápido

```ts
import { dni } from '@valtechstudio/personal-id-validator/hn'

const result = dni.validate('0801-1990-00000')
// { valid: true, value: '0801199000000' }  → guarda y compara result.value

dni.applyMask('0801199000000') // '0801-1990-00000' → muestra este
```

## Puntos de entrada

El paquete tiene una **entrada raíz** con la API que no depende del país, y una **entrada por país** con sus tipos de documento y funciones propias.

| Import                                      | Qué contiene                                                                                     |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `@valtechstudio/personal-id-validator`      | `validateDocument`, `getDocumentType`, `messages` y los tipos compartidos (abajo)                |
| `@valtechstudio/personal-id-validator/<cc>` | Los tipos de documento del país (cada uno es un [`DocumentType`](#documenttype)) y sus funciones |

### Países

| Código | País     | Import                                    | Documentos                                   | Documentación                                                                                                                                                                                  |
| ------ | -------- | ----------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HN`   | Honduras | `@valtechstudio/personal-id-validator/hn` | `DNI`, `RTN`, `PASAPORTE`, `CARNE_RESIDENTE` | [Español](https://github.com/ValTechStudio/personal-id-validator/blob/main/src/hn/README.es.md) · [English](https://github.com/ValTechStudio/personal-id-validator/blob/main/src/hn/README.md) |

## API raíz

### `validateDocument(country, code, value, options?)`

Valida `value` como el tipo de documento `country:code` (sin distinguir mayúsculas). Úsala cuando el tipo viene de datos, por ejemplo de la base de datos. Devuelve un [`ValidationResult`](#validationresult).

Los tipos no soportados no lanzan excepción: devuelven `UNSUPPORTED_DOCUMENT_TYPE` y escriben un `console.warn` por cada tipo desconocido, con la lista de los soportados.

```ts
import { validateDocument } from '@valtechstudio/personal-id-validator'

validateDocument('HN', 'RTN', '0801-1990-00000-1')
// { valid: true, value: '08011990000001' }

validateDocument('HN', 'DNI', '0899199000000', { locale: 'es' })
// { valid: false, error: 'INVALID_MUNICIPALITY', message: 'El código de municipio no existe.' }

validateDocument('GT', 'CUI', '1234')
// { valid: false, error: 'UNSUPPORTED_DOCUMENT_TYPE' } + console.warn
```

### `getDocumentType(country, code)`

Devuelve el [`DocumentType`](#documenttype) de `country:code`, o `undefined` si no está soportado. Sirve para armar formularios desde datos (etiqueta, placeholder, `maxLength`, máscara).

```ts
const type = getDocumentType('HN', 'DNI')
type?.placeholder // '0000-0000-00000'
type?.applyMask('080119') // '0801-19'
```

### `messages`

`messages[locale][error]`: los textos de error en `'es'` y `'en'`, por si muestras tus propios textos o traduces el código tú mismo.

## `DocumentType`

Todos los tipos de documento, de cualquier país, tienen la misma forma. Validar es la misma llamada si importas el tipo directamente o si usas `validateDocument`.

| Miembro                      | Tipo                               | Descripción                                                                                                    |
| ---------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `validate(value, options?)`  | `ValidationResult`                 | Acepta espacios, puntos y guiones; `result.value` es el valor normalizado                                      |
| `applyMask(value, options?)` | `string`                           | Forma para mostrar de un valor completo o parcial: agrega separadores, pasa a mayúsculas y corta lo que sobra  |
| `compact(value)`             | `string`                           | Quita separadores y espacios, sin validar                                                                      |
| `country`                    | `string`                           | Código ISO del país, por ejemplo `'HN'`                                                                        |
| `code`                       | `string`                           | Identificador estable, por ejemplo `'DNI'`                                                                     |
| `name`                       | `{ es: string; en: string }`       | Nombre para mostrar                                                                                            |
| `appliesTo`                  | `'person' \| 'company' \| 'both'`  | Quién tiene este documento                                                                                     |
| `validation`                 | `'structural' \| 'loose'`          | `loose`: no hay formato oficial publicado, solo se revisan caracteres y longitud. Tu interfaz debería decirlo. |
| `sources`                    | `{ label: string; url: string }[]` | Fuentes oficiales de las reglas                                                                                |
| `example`                    | `string`                           | Un ejemplo inventado, con máscara                                                                              |
| `placeholder`                | `string`                           | Para el `placeholder` de un input                                                                              |
| `maxLength`                  | `number`                           | Largo del valor con máscara y el separador por defecto, para el `maxLength` de un input                        |
| `mask`                       | `string \| undefined`              | Patrón para librerías de máscaras (`0` = dígito). Solo documentos numéricos.                                   |

### Opciones

| Opción      | Lo usa                         | Por defecto | Efecto                                                                                    |
| ----------- | ------------------------------ | ----------- | ----------------------------------------------------------------------------------------- |
| `locale`    | `validate`, `validateDocument` | ninguno     | `'es'` o `'en'`: los resultados con error incluyen también un `message`                   |
| `separator` | `applyMask`                    | `'-'`       | Separador entre grupos, por ejemplo `' '` o `''`. Los documentos alfanuméricos lo ignoran |

### `ValidationResult`

```ts
type ValidationResult =
  | { valid: true; value: string } // normalizado: sin separadores, en mayúsculas
  | { valid: false; error: ValidationError; message?: string } // message solo con `locale`
```

`value` nunca depende de los separadores que traiga el texto, así que el mismo documento siempre se guarda igual. Para mostrarlo, usa `applyMask(result.value)`.

### Códigos de error

| Código                      | Español                                   | English                                   |
| --------------------------- | ----------------------------------------- | ----------------------------------------- |
| `INVALID_FORMAT`            | Contiene caracteres no permitidos.        | Contains characters that are not allowed. |
| `INVALID_LENGTH`            | La cantidad de caracteres no es correcta. | The number of characters is not correct.  |
| `INVALID_DEPARTMENT`        | El código de departamento no existe.      | The department code does not exist.       |
| `INVALID_MUNICIPALITY`      | El código de municipio no existe.         | The municipality code does not exist.     |
| `INVALID_YEAR`              | El año no es válido.                      | The year is not valid.                    |
| `UNSUPPORTED_DOCUMENT_TYPE` | Este tipo de documento no está soportado. | This document type is not supported.      |

Qué códigos puede devolver cada documento está en la documentación de su país.

## Recetas

### Máscaras en inputs

`applyMask` solo transforma textos. Si escribes su resultado de vuelta en un input controlado, el navegador mueve el cursor al final, así que restaura el cursor tú mismo (como hace la [demo](https://valtechstudio.com/open-source/@valtechstudio/personal-id-validator)) o pasa `mask` a una librería de máscaras como [Maskito](https://maskito.dev) o [IMask](https://imask.js.org):

```tsx
;<input placeholder={dni.placeholder} maxLength={dni.maxLength} />
dni.mask // '0000-0000-00000'
```

### Con Zod / react-hook-form

```ts
z.string().refine((v) => dni.validate(v).valid, 'DNI inválido')
```

## Limitaciones

- **Un formato válido no significa que el documento exista.** Eso solo lo confirman los registros oficiales, que esta librería no consulta.
- Las limitaciones de cada país (dígitos verificadores sin publicar, formatos flexibles) están en su documentación.

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
