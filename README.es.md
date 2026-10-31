# @valtechstudio/personal-id-validator

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
dni.formatPartial('080119') // '0801-19'         → máscara del input, en onChange

parseDni('0501-1985-00000')
// { department: { code: '05', name: 'Cortés' },
//   municipality: { code: '0501', name: 'San Pedro Sula' }, year: 1985, sequence: '00000' }
```

Para elegir el tipo en tiempo de ejecución (por ejemplo, desde la base de datos):

```ts
import { getDocumentType, messages } from '@valtechstudio/personal-id-validator'

const type = getDocumentType('HN', 'RTN') // undefined si no está soportado
const result = type?.validate(input)
if (result && !result.valid) showError(messages.es[result.error])
```

Con Zod / react-hook-form:

```ts
z.string().refine((v) => dni.validate(v).valid, 'DNI inválido')
```

Cada tipo de documento incluye datos para formularios: `name` (`es`/`en`), `appliesTo` (`person` | `company` | `both`), `example`, `placeholder` y `maxLength`.

## Documentos soportados (Honduras)

| Código            | Documento                       | Regla                                                                                       |
| ----------------- | ------------------------------- | ------------------------------------------------------------------------------------------- |
| `DNI`             | Documento Nacional de Identidad | 13 dígitos `DDMM-AAAA-NNNNN`: departamento y municipio reales (tabla del RNP), año 1900–hoy |
| `RTN`             | Registro Tributario Nacional    | 14 dígitos, los primeros 13 con las reglas del DNI, más 1 dígito (sin verificar, ver abajo) |
| `PASAPORTE`       | Pasaporte                       | 1–9 letras o dígitos (límite de OACI Doc 9303)                                              |
| `CARNE_RESIDENTE` | Carné de residente (INM)        | 1–20 letras o dígitos (validación flexible: no hay formato oficial publicado)               |

Códigos de error: `INVALID_FORMAT`, `INVALID_LENGTH`, `INVALID_DEPARTMENT`, `INVALID_MUNICIPALITY`, `INVALID_YEAR`. Los textos en español e inglés están en `messages`; usa los tuyos si prefieres otra redacción.

## Limitaciones

- **Un formato válido no significa que el documento exista.** Eso solo lo confirman los registros oficiales (RNP, SAR), que esta librería no consulta.
- El DNI no tiene dígito verificador público, así que la validación es estructural.
- El último dígito del RTN es verificador, pero el SAR no ha publicado el algoritmo. Se acepta tal cual hasta confirmarlo.
- El pasaporte y el carné de residente no tienen un formato nacional publicado. Sus ejemplos son ilustrativos.
- Los códigos de municipio vienen de la [tabla de códigos de departamento y municipio](https://web.archive.org/web/2018/http://www.rnp.hn/wp-content/uploads/2011/02/Cuadro-de-C%C3%83%C2%B3digos-de-Departamento-y-Municipios.pdf) del RNP (298 municipios).

¿Un documento real es rechazado? [Abre un issue](https://github.com/ValTechStudio/personal-id-validator/issues) (nunca publiques el número real).

## Contribuir

Se aceptan nuevos países y tipos de documento. Lee [CONTRIBUTING.md](./CONTRIBUTING.md).

## Licencia

MIT © [Val Tech Studio](https://valtechstudio.com)
