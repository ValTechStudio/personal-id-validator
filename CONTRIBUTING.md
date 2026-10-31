# Contributing

Thanks for helping! Issues and pull requests are welcome in Spanish or English.

## Setup

```sh
npm install
npm test          # vitest
npm run lint      # eslint
npm run typecheck # tsc
npm run build     # tsup → dist/
```

## Adding a country

1. Create `src/<iso-country-code>/` (lowercase, e.g. `src/gt/`), with one file per document type that exports a `DocumentType` (see `src/types.ts` and `src/hn/dni.ts`).
2. Export the types and a `documentTypes` array from `src/<cc>/index.ts`.
3. Register the country in `countries` in `src/index.ts`, add the entry to `tsup.config.ts`, and add a `./<cc>` subpath to `exports` in `package.json`.
4. Add tests next to the code (`src/<cc>/<cc>.test.ts`) covering valid, malformed and edge cases.
5. Cite the official source for every rule in a comment, and in the README table.
6. Run `npx changeset` and describe the change.

## Rules

- **Never commit real people's ID numbers**, in tests, docs or issues. Use made-up values (this repo uses sequence `00000`).
- No runtime dependencies.
- Only validate what an official source documents. If a rule is unknown (e.g. a check digit), accept the value and say so in the README.
- Return error codes, not messages. Add new codes to `ValidationError` and to both languages in `src/messages.ts`.

## Versioning

[Semantic Versioning](https://semver.org) via [Changesets](https://github.com/changesets/changesets). While on `0.x`, making validation stricter is a minor change. From `1.0`, it's a major one, because it can reject values that were accepted before.
