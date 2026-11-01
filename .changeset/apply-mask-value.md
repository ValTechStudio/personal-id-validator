---
'@valtechstudio/personal-id-validator': minor
---

**Breaking:** simpler API.

- `format` and `formatPartial` are merged into `applyMask(value, { separator? })`, which masks full or partial values and drops anything past the document's length. `FormatOptions` is now `MaskOptions`.
- Valid results return `{ valid: true, value }` instead of `{ valid: true, compact }`.
- `allowSeparators` is removed: `validate` always accepts spaces, dots and dashes. Send `result.value` where an API needs the compact form.

The README now documents the root entry and `DocumentType` once, with a separate page per country (`src/hn/README.md`).
