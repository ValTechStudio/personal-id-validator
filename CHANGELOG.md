# @valtechstudio/personal-id-validator

## 0.2.0

### Minor Changes

- 0eab324: Add `validateDocument(country, code, value, options?)`: unsupported types return `UNSUPPORTED_DOCUMENT_TYPE` and log one `console.warn` per type instead of returning `undefined`.
  
  Add options: `allowSeparators` and `locale` (adds a `message` to failed results) for `validate`/`validateDocument`, and `separator` for `format`/`formatPartial`.
  
  Add metadata to every document type: `validation` (`structural` or `loose`; passport and residence card are `loose` because no official number format is published), `sources` (official references for each rule) and `mask` (pattern for input-mask libraries on DNI and RTN).
  
  Document that `formatPartial` only transforms strings; live inputs need caret handling or a mask library.
