# md-html-forge · docs

The engine reference. For product overview / getting started, see the repo [README](../README.md).

## Structure

```
docs/
├── engine/                               Long-lived reference
│   ├── syntax.md                         Full directive spec (@compose / @use / @slot / @theme ...)
│   ├── architecture.md                   Compiler pipeline (lexer → parser → resolver → emitter)
│   ├── component-api.md                  Component authoring API
│   ├── theme-api.md                      Theme authoring API (incl. surfaceSunken / borderSubtle)
│   ├── design-tokens.md                  Design token catalog
│   └── extensibility.md                  Extension points
│
├── tech-debt/                            Tracked limitations / unimplemented items
│   ├── README.md
│   ├── unimplemented-components.md
│   └── compiler-known-limitations.md
│
└── archive/                              Historical docs (migration / prompts / early product planning)
    ├── migration/                        HTML → forge component migration (completed)
    ├── prompts/                          Task dispatch prompts (mostly done/obsolete)
    └── product/                          Early positioning / direction docs
```

## Quick index

| I want to… | Read |
|---|---|
| Write a document in forge syntax | [`engine/syntax.md`](./engine/syntax.md) |
| Understand the compiler | [`engine/architecture.md`](./engine/architecture.md) |
| Author a new component | [`engine/component-api.md`](./engine/component-api.md) + [`engine/design-tokens.md`](./engine/design-tokens.md) |
| Author a new theme | [`engine/theme-api.md`](./engine/theme-api.md) |
| Know what's not implemented yet | [`tech-debt/unimplemented-components.md`](./tech-debt/unimplemented-components.md) |
| Know the compiler's known limits | [`tech-debt/compiler-known-limitations.md`](./tech-debt/compiler-known-limitations.md) |

## Live references (auto-generated, always up-to-date)

The dev server also exposes:

- `/llms.txt` — plain text spec (llmstxt.org) · for pasting into LLM chats
- `/api/catalog.json` — structured JSON · for MCP / retrieval
- `/docs/agent` — browsable, with copy/download buttons
- `/docs/syntax` — forge renders its own syntax doc (dogfooded)
- `/docs/slots` — cheatsheet + component selection cards

These always reflect what the code actually does. Prefer them over static `.md`
whenever you need the current truth.

## Verification

```bash
npm run typecheck          # TypeScript (incremental)
npm run audit:templates    # Compile all 21 built-in templates, scan for render issues
```

Audit output lands in `/tmp/forge-audit/`. Run it after any compiler change.

## Implicit conventions (don't break these)

1. **Backward compat on component id** — once shipped, never rename (would break user `@compose`).
2. **No hardcoded colors** — always `var(--xxx)` tokens.
3. **Everything `@use`d must be `@compose`d first** — the component registry is explicit.
4. **Extra `@compose` entries pollute output** — we fallback-instantiate missing components.
5. **Component CSS must live under `.comp-<id>`** — no cross-component bleed.
