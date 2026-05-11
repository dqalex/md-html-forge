<p align="center">
  <img src="./public/brand/logo-horizontal.svg" alt="md-html-forge · markdown → html" width="340" />
</p>

<p align="center">
  <b>Feed Markdown into a carefully designed component library; get HTML that reads like a book, not a webpage.</b>
</p>

<p align="center">
  <a href="./README.zh.md">🇨🇳 中文</a> ·
  <a href="https://github.com/dqalex/md-html-forge">GitHub</a> ·
  <a href="./docs/">Docs</a>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-15-black.svg" alt="Next.js 15" /></a>
  <a href="https://typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-blue.svg" alt="TypeScript" /></a>
</p>

---

## What it is

**md-html-forge** is a browser-side **Markdown → Styled HTML** editor.

You write plain Markdown on the left; forge pipes it through a curated
component library and renders beautiful, production-ready HTML on the right.
The editor and preview share a single source of truth — the Markdown file —
and every forge directive is a plain HTML comment, so the document stays
readable even without the tooling.

### Features

| | |
|---|---|
| 🎨 **Component-driven rendering** | 30+ built-in components (`header` / `table` / `timeline` / `metric` / `callout` / ...) that cover engineering reports, PR reviews, incident retros, and more |
| ✍️ **Markdown stays Markdown** | Every forge directive is an HTML comment. Open the file in any plain editor — it's still a readable `.md` |
| 🤖 **AI-friendly** | Structured components save 50–80% tokens vs prose-style HTML. AI output pastes straight in; users tweak from there |
| 🎯 **Brand consistency** | Save colors / fonts / spacing tokens as a Brand Pack — every future doc ships with the same look |
| 📦 **One-click export** | Standalone HTML (zero runtime deps) or PNG — drop into email, Notion, Lark, or embed anywhere |
| 🔄 **Two-way sync** | Checkbox clicks write back to the Markdown; clicking an element jumps the editor to the source line |
| 💾 **Local-first Brand Packs** | Everything lives in `localStorage`. No account, no server |

---

## Why this project exists

I've been carrying the same hunch for a long time: **for dense information
delivered to humans, HTML beats Markdown**. It has higher information density,
richer structure, better affordances for interaction — and the typographic
polish simply doesn't fit into `# heading` and `- bullet`.

That conviction led me down this road twice already:

1. **[teamclaw](https://github.com/dqalex/teamclaw)** — when building it I
   realised the reporting surface needed a real rendering pipeline (not a
   Markdown preview plugin). So I built one inside the project.
2. **A different internal project** — same problem reappeared. I was mid-way
   through iterating that rendering pipeline when…
3. I ran into Thariq Shihipar's post ["Using Claude Code: The Unreasonable
   Effectiveness of HTML"](https://simonwillison.net/2026/May/9/thariq/) (also
   the [html-effectiveness](https://github.com/ThariqS/html-effectiveness)
   repo). Different angle — his is about agent output formats — but the core
   thesis is identical: **HTML is the right target**.

That confirmed the path, but also sharpened the gap I cared about:

> For **agents**, freely generated HTML is fine — they're producing one-off
> artifacts. For **end-users** who want reliably beautiful, brand-consistent
> output over and over, the path can't be "each time an LLM hallucinates a
> fresh CSS stylesheet." It needs a **standard rendering pipeline** — a
> component library with strong defaults, that takes Markdown (or AI-produced
> Markdown) and always lands a polished HTML page.

So `md-html-forge` is that pipeline. Humans write the easy format (Markdown);
the engine guarantees the visuals. It plays well with AI but is built for the
human use case first.

---

## For AI / agents

Want an LLM (Claude / ChatGPT / Cursor / Copilot) to write forge documents for
you? Drop any of the endpoints below into your context window. **These
endpoints are generated from code, so they always reflect current component
capabilities.**

| Endpoint | Format | Best for |
|---|---|---|
| `/llms.txt` | Plain text (llmstxt.org convention) | Paste into chat · generic LLM crawlers |
| `/api/catalog.json` | Structured JSON | MCP / embeddings / programmatic retrieval |
| `/docs/agent` | Browsable page with copy/download buttons | Local reading + one-click dump to AI |
| `/docs/syntax` | Forge-rendered, human-friendly | Complete syntax doc with real previews |
| `/docs/slots` | Cheatsheet + component picker | Pick components by scenario (`whenToUse` / `whenNot`) |

One-line prompt template:

```
Read this forge syntax contract into your context: https://<your-domain>/llms.txt
Now write an "engineering weekly report" in forge markdown with header / metric band /
highlights / table (standard) / checklist / footer.
```

---

## Quick start

```bash
git clone https://github.com/dqalex/md-html-forge.git
cd md-html-forge
npm install
npm run dev          # http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000). Edit Markdown on the left,
watch the HTML preview update on the right.

### Common commands

```bash
npm run dev               # Dev server (Turbopack HMR)
npm run build             # Production build
npm run typecheck         # TypeScript check
npm run lint              # ESLint
npm run audit:templates   # Compile all 21 built-in templates, scan for render issues
```

`audit:templates` doesn't need a browser — it invokes the forge compiler in
Node, compiles every template to HTML, and scans the output for render
problems. Great for CI or regression testing after compiler changes. Output
goes to `/tmp/forge-audit/`.

---

## One-minute taste

```md
<!-- @page narrow -->
<!-- @compose: header, highlights, table, footer -->
<!-- @theme editorial -->

<!-- @use header -->

# Engineering Status — Week 11

## birchline/app @ main

<!-- @slot:eyebrow -->auto-generated<!-- @/slot -->
<!-- @slot:date -->Mar 10 – Mar 16, 2025<!-- @/slot -->

<!-- @use highlights -->

## Highlights

- **Bulk task editing shipped to 100%.** Ramped to all workspaces by Thursday.
- **Sync API p95 down 38%.** Batch auth lookup cut hot path from 410ms to 255ms.

<!-- @use table variant=standard -->

<!-- @slot:heading -->Shipped<!-- @/slot -->

| PR | Title | Author | Risk |
|---|---|---|---|
| #4871 | Bulk edit toolbar | Mira Okafor | Med |
| #4874 | Batch auth lookup | Devon Park | Med |

<!-- @use footer -->

<!-- @slot:footer -->generated Mar 16 2025 18:02<!-- @/slot -->
```

Read the full directive spec in [`docs/engine/syntax.md`](./docs/engine/syntax.md).

---

## Project layout

```
md-html-forge/
├── src/
│   ├── app/                          Next.js App Router
│   │   ├── page.tsx                  Playground entrypoint
│   │   ├── layout.tsx                Fonts + global styles
│   │   └── docs/                     Self-rendered docs (syntax / slots / agent)
│   │
│   ├── builtin/                      ⭐ forge engine
│   │   ├── compiler/                 lexer / parser / resolver / emitter
│   │   ├── components/               Built-in components (.ts + .forge.md)
│   │   ├── templates/                Built-in templates (21 scenarios)
│   │   └── themes/                   Theme definitions
│   │
│   ├── components/                   React UI shell
│   │   ├── app/AppHeader.tsx         Top nav (template picker / language toggle)
│   │   ├── markdown-editor/          CodeMirror editor + iframe preview + global theme picker
│   │   ├── component-library/        Component browser
│   │   ├── html-preview/             Brand Pack / Theme editor / AI component builder modals
│   │   └── ui/                       Base UI (Button / Dialog / Popover)
│   │
│   └── lib/markdown-slots/           MD ↔ HTML sync utilities
│
├── public/brand/                     Logo kit (SVG)
├── docs/
│   ├── engine/                       API reference (long-lived)
│   ├── tech-debt/                    Tracked limitations
│   └── archive/                      Historical design & migration docs
└── scripts/compile-templates/        Template audit script
```

---

## Built-in components

### Document structure

| Component | Purpose |
|---|---|
| `header` | Title area (title / subtitle / author / date / badges) |
| `meta-pills` | Status pills (incident retro staple) |
| `lead` | Summary / TL;DR / phase notes (`lead` / `tldr` / `phase` variants) |
| `body` | Generic prose container; accepts any MD content |
| `footer` | Page-level meta footer |

### Data

| Component | Purpose |
|---|---|
| `metric` | KPI card (`band` / `hero` / `slide` variants) |
| `table` | Data table (`standard` / `risk` / `impact` / `flag` variants) |
| `progress` | Progress bars / rollout phases |
| `timeline` | Timeline (`standard` / `milestones` / `incident` variants) |
| `pr-summary` | PR header (author / branch / diff stats) |

### Content blocks

| Component | Purpose |
|---|---|
| `highlights` | Bullet highlights with separator title |
| `actions` | Action list / TODO carry |
| `checklist` | Checkable list (two-way synced to MD) |
| `callout` | Callout box (`concept` / `note` / `questions` / `recommendation` variants) |
| `panel` | Info panel (`snippet` / `glossary` / `prompt` variants) |
| `code-block` | Code display (`diff` / `walkthrough` variants) |
| `collapse-section` | Collapsible region |
| `comparison` | Before/after or options comparison (`ba` / `options` / `mockup` variants) |
| `faq-item` / `qa` | Q&A blocks |
| `review-comment` | PR review comment (`blocking` / `nit` / `suggestion` variants) |

### Visuals & layout

| Component | Purpose |
|---|---|
| `chip` | Tag / badge (`risk` / `flag` / `option` / `legend` variants) |
| `illustration` | SVG illustration frame |
| `design-spec` | Design-system display (`keyframe` / `swatch` / ...) |
| `list-item`, `list-row` | Rich list rows |
| `grid-2/3/4`, `layout-flex-row`, `scroll-row` | Layout primitives |

---

## Built-in templates

The template dropdown ships 21 scenario templates, in 5 categories:

| Category | Templates |
|---|---|
| **Reports** | Engineering weekly, incident retro, feature flag inventory |
| **Planning** | Animation spec, interaction prototype, annotated flowchart, rollout plan |
| **Research / Walkthroughs** | Code walkthrough, design system reference, component variant matrix, feature explainer, concept explainer |
| **Code review** | Code approach exploration, PR review summary, PR description |
| **Playground** | Visual design exploration, slide deck, SVG illustration set, editor triage board, prompt tuner |

---

## Docs

| I want to… | Read |
|---|---|
| Learn the full syntax | [`docs/engine/syntax.md`](./docs/engine/syntax.md) |
| Understand the compiler | [`docs/engine/architecture.md`](./docs/engine/architecture.md) |
| Write a custom component | [`docs/engine/component-api.md`](./docs/engine/component-api.md) |
| Author a theme | [`docs/engine/theme-api.md`](./docs/engine/theme-api.md) |
| See design tokens | [`docs/engine/design-tokens.md`](./docs/engine/design-tokens.md) |
| Register extensions | [`docs/engine/extensibility.md`](./docs/engine/extensibility.md) |

Historical docs (migration / prompts / early product planning) are in
[`docs/archive/`](./docs/archive/).

---

## Stack

- **Next.js 15** (App Router)
- **TypeScript 5**
- **Tailwind CSS v4**
- **CodeMirror 6** (editor)
- **Lucide React** (icons)
- Zero runtime deps in the exported HTML

---

## Contributing

1. Fork & branch
2. Add your component under `src/builtin/components/`
3. Optionally add a template under `src/builtin/templates/batches/`
4. `npm run typecheck && npm run audit:templates`
5. Open a PR describing the component and its variants

---

## Credits & influences

- **[html-effectiveness](https://github.com/ThariqS/html-effectiveness)** by
  Thariq Shihipar — the spark that sharpened the "HTML as a first-class output
  format" thesis. The editorial visual language borrows from here.
- **["The Unreasonable Effectiveness of HTML"](https://simonwillison.net/2026/May/9/thariq/)** —
  the agent-side argument for HTML that confirmed I was on the right path.
- **[teamclaw](https://github.com/dqalex/teamclaw)** — where this rendering
  pipeline first took shape, before it was spun out into its own project.

---

## License

MIT © 2026 · [dqalex](https://github.com/dqalex)
