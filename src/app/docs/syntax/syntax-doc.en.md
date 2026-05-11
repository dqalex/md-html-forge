<!-- @page narrow -->
<!-- @compose: header, meta-pills, lead, metric, panel, callout, code-block, comparison, chip, table, timeline, collapse-section, checklist, faq-item, footer -->
<!-- @theme editorial -->


<!-- @use header -->

# Forge Syntax Specification

## Markdown → Templated HTML Contract

<!-- @slot:eyebrow -->docs · engine · syntax<!-- @/slot -->
<!-- @slot:date -->2026-05-11 · Synced with current codebase<!-- @/slot -->


<!-- @use meta-pills -->

<!-- @slot:pills -->
forge · directive
@compose · required
@use · segment
@slot · component
@theme · segment
@layout · segment
@compose-group / @item · loop
<!-- @/slot -->


<!-- @use lead variant=tldr -->

> Forge layers 7 directives on top of native Markdown — all written inside HTML comments. The file remains valid Markdown in any editor; under the forge engine it compiles into component-templated HTML. This very document is written in forge syntax.


<!-- @use metric variant=band -->

<!-- @slot:metricValue -->
18
4
3
11
<!-- @/slot -->

<!-- @slot:metricLabel -->
Built-in components
Themes × Variants
Render modes
Directives
<!-- @/slot -->

<!-- @slot:metricDelta -->
.forge.md atomic components
editorial / dark × slots
compose · template · editorial
page / compose / theme / layout / use / slot / item
<!-- @/slot -->


<!-- @use callout variant=note -->

<!-- @slot:calloutTitle -->Design Principle<!-- @/slot -->

**All forge extensions live inside HTML comments** — a bare file opens as valid MD in any editor. Content is always native Markdown; directives only control how components / variants / themes / segments are organized.


<!-- @use panel variant=snippet -->

<!-- @slot:panelTitle -->Minimal Runnable Document<!-- @/slot -->

```markdown
<!-- @page narrow -->
<!-- @compose: header, body, footer -->
<!-- @theme editorial -->

<!-- @use header -->

# My First Document

## Subtitle (optional, goes into subtitle slot)

<!-- @use body -->

## Background

This is body text, supporting **bold**, `code`, [links](https://example.com).

- Point 1
- Point 2

<!-- @use footer -->

<!-- @slot:footer -->forge · 2026<!-- @/slot -->
```


<!-- @use chip variant=legend -->

<!-- @slot:legendItems -->
step|@page / @compose · Document-level declarations
ok|@use · Component instance start
ok|@slot · Explicit slot fill
gate|@theme / @layout · Segment switch
bad|@compose-group / @item · Loop layout
<!-- @/slot -->


<!-- @use table variant=standard -->

<!-- @slot:tableHeading -->7 Directives Cheat Sheet<!-- @/slot -->

| Directive | Purpose | Scope | Occurrences |
|---|---|---|---|
| `@page` | Page width / band / font size | Document-level | At most 1 |
| `@compose` | List of components used in this doc (**required**) | Document-level | At most 1 |
| `@theme` | Switch theme | Segment-level (until next declaration) | Any |
| `@layout` | Switch layout container for current segment | Segment-level | Any |
| `@use` | Start a component instance (can take `variant=`) | Segment-level | Any |
| `@slot:name` | Explicitly fill a slot | Inside component | Any |
| `@compose-group` / `@item` | Loop layout (N same-structure sub-items) | Segment-level | Any |


<!-- @use comparison variant=ba -->

<!-- @slot:baBefore -->
**Native Markdown table** — preferred. Just write `| col | col |`, and `table variant=standard` absorbs it via the `tableContent` slot.

```md
<!-- @use table variant=standard -->

| PR | Title | Author |
|---|---|---|
| #1234 | Fix login retries | Alice |
```
<!-- @/slot -->

<!-- @slot:baAfter -->
**Structured data** — `risk` / `impact` / `flag` variants. Each row uses `|` as field separator, written into the `tableData` slot. Mount JS renders custom visuals.

```md
<!-- @use table variant=risk -->

<!-- @slot:tableData -->
Race condition on sync append|high|Dedupe on server id
Stale unread counts|med|Broadcast read-upserts
<!-- @/slot -->
```
<!-- @/slot -->


<!-- @use comparison variant=options -->

<!-- @slot:optionTitle -->Should you use explicit `@slot:` or rely on native MD auto-binding?<!-- @/slot -->

<!-- @slot:optionContext -->
Both are supported and can be mixed within the same `@use`. Recommendation: **prefer native MD when possible** (better readability in bare files), and fall back to explicit slots for complex scenarios.
<!-- @/slot -->

<!-- @slot:optionItems -->
A · Native MD auto-binding — lists / tables / code blocks / headings auto-bind via slot rules
B · `@slot:name` explicit — precise control, supports complex multi-block content
C · Mixed — explicit slots take priority, remaining blocks auto-bind
<!-- @/slot -->


<!-- @use panel variant=snippet -->

<!-- @slot:panelTitle -->Supported bind types<!-- @/slot -->

```yaml
h1 / h2 / h3   : Heading
blockquote     : > Quote block
ul / ol / list : Unordered / ordered / any list
code           : ``` Code block
table          : | ... | Table
paragraph      : Regular paragraph
content        : Fallback — absorbs all remaining blocks in segment (supports multiple content slots
                 assigned in declaration order; last content slot absorbs everything left)
```


<!-- @use panel variant=snippet -->

<!-- @slot:panelTitle -->Auto-binding inside @item blocks (after 2026-05-11)<!-- @/slot -->

```md
<!-- @compose-group: layout-grid-2 -->

<!-- @item card variant=decision -->
## Title inside item             ← auto-binds to cardTitle
Body paragraph here.              ← auto-binds to cardBody (content fallback)
<!-- @/item -->

<!-- @item card variant=decision -->
<!-- @slot:cardTitle -->Explicit slot still takes priority<!-- @/slot -->
Mixed writing works too.
<!-- @/item -->

<!-- @/compose-group -->
```

`@item` supports three assignment modes, priority from high to low:
1. Explicit `@slot:xxx` blocks
2. `variant=xxx` and other `key="value"` attributes passed directly to slots
3. Bare Markdown blocks auto-bind via child component's `bind` rules


<!-- @use code-block variant=diff -->

<!-- @slot:diffContent -->
@@ 2026-05-11 release notes @@
+ Bare MD inside @item blocks auto-binds via child component bind (F2)
+ @item supports variant=xxx passthrough to child component (F4)
+ A component can declare multiple bind:content slots, assigned in order (F1)
+ Binding does not break after @theme / @layout segment switch (F6)
+ .forge.md new ## JS block + window.forge.runtime (F8)
- Old docs saying "@item blocks don't support md-binding" are obsolete
- Old docs saying "item variant is treated as slot value" are obsolete
<!-- @/slot -->


<!-- @use timeline -->

<!-- @slot:timelineHeading -->Compile Pipeline (4 Stages)<!-- @/slot -->

<!-- @slot:timelineEntry -->
## Parser · Lexical / Syntax Splitting

Splits markdown by `@compose` / `@use` / `@slot` / `@item` / `@compose-group` into a segment → component → slot tree. `@theme` / `@layout` change the current segment's render context but don't interrupt subsequent `@use` MD block capture (cross-segment binding is fixed).
<!-- @/slot -->

<!-- @slot:timelineEntry -->
## MD-Binding · Native MD Binding

Each `@use`'s following native MD blocks are assigned to slots by their `bind` type:
- Round 1: Exact type match (`h2` → slot with `bind:h2`)
- Round 2: Remaining blocks assigned to multiple `bind:content` slots in declaration order
- The last `content` slot absorbs all remaining blocks
- `@item` blocks follow **the same** binding rules (since 2026-05-11)
<!-- @/slot -->

<!-- @slot:timelineEntry -->
## Resolver · Variant / Theme / Layout Resolution

Resolves `variant=` (including `@item` variant passthrough), `@theme`, `@layout`; associates components with their segment-bound theme / layout container.
<!-- @/slot -->

<!-- @slot:timelineEntry -->
## Emitter · HTML + Interaction Injection

Assembles final HTML and injects `window.forge.runtime`: event bus, `shouldJumpToSource`, clipboard utils, state persistence (survives srcdoc reloads). `.forge.md` `## JS` blocks are mounted to `window.__forgeMounts[id]`, mounted per `[data-forge-id]` elements.
<!-- @/slot -->


<!-- @use callout variant=warning -->

<!-- @slot:calloutTitle -->Iron Rules for AI-Generated Templates<!-- @/slot -->

- `@compose` list **= exact set of components actually used** (no more, no less)
- All `@use <id>` values must exist in the built-in component registry
- All `@slot:<name>` values must be real slot names of that component
- Multiple instances of the same component (FAQ / timeline entries) use **multiple `@use`** — never invent `q1 / a1 / q2 / a2` fake slots
- `lead variant=lead` content uses `>` blockquote or explicit `<!-- @slot:lead -->`
- `table variant=standard` uses `tableContent`; `risk` / `impact` / `flag` use `tableData` + `|` separator
- Each component's slot naming follows the `<id><SlotName>` pattern (`card` → `cardTitle / cardBody`)


<!-- @use collapse-section -->

<!-- @slot:sectionTitle -->Common Mistake · Fabricated Slot Names<!-- @/slot -->
<!-- @slot:sectionWhere -->See compiler-known-limitations.md<!-- @/slot -->

<!-- @slot:sectionBody -->
**❌ Wrong**:

```md
<!-- @use faq-item -->
<!-- @slot:q1 -->Question 1<!-- @/slot -->
<!-- @slot:a1 -->Answer 1<!-- @/slot -->
<!-- @slot:q2 -->Question 2<!-- @/slot -->
```

`faq-item` only has `faqQ / faqA` slots — `q1/a1/q2` are fabricated.

**✅ Correct** (multiple instances = multiple `@use`):

```md
<!-- @use faq-item -->
<!-- @slot:faqQ -->Question 1<!-- @/slot -->
<!-- @slot:faqA -->Answer 1<!-- @/slot -->

<!-- @use faq-item -->
<!-- @slot:faqQ -->Question 2<!-- @/slot -->
<!-- @slot:faqA -->Answer 2<!-- @/slot -->
```
<!-- @/slot -->


<!-- @use collapse-section -->

<!-- @slot:sectionTitle -->Common Mistake · `bind` Mismatch Causes Content Loss<!-- @/slot -->
<!-- @slot:sectionWhere -->md-binding rules<!-- @/slot -->

<!-- @slot:sectionBody -->
If a slot declares `bind: h2` and you only write `# Level-1 Heading` (h1) after `@use`, this MD block **will not** enter the slot (bind mismatch → treated as free-text → fallback rendering).

Fix:
1. Switch to explicit `@slot:name` block (recommended, most reliable)
2. Or change the MD level to match the bind declaration
3. Or ensure the component has a `bind: content` slot as fallback

To see a component's slot / bind declarations, read the source: `src/builtin/components/<category>/<id>.forge.md` → `## Slots` section.
<!-- @/slot -->


<!-- @use collapse-section -->

<!-- @slot:sectionTitle -->Common Mistake · Declaring Unused Components in `@compose`<!-- @/slot -->
<!-- @slot:sectionWhere -->Compiler diagnostics will flag this<!-- @/slot -->

<!-- @slot:sectionBody -->
```md
<!-- @compose: header, lead, panel, code-block, footer -->
```

If only `header / lead / panel / footer` are actually used, the extra `code-block` gets auto-instantiated as an empty component at the bottom of the page. `npm run audit:templates` reports this as `unused-declaration`.

**Rule**: The `@compose` list must **exactly match** the actually `@use`d components (no more, no less).
<!-- @/slot -->


<!-- @use panel variant=snippet -->

<!-- @slot:panelTitle -->Component Interaction (.forge.md ## JS Block)<!-- @/slot -->

```js
// Add a ## JS section in your .forge.md
export function mount(el, api) {
  // el  → component root DOM (with data-forge-id)
  // api → { el, runtime, emit, on, state }
  const btn = el.querySelector('.my-btn');
  btn.addEventListener('click', (e) => {
    e.stopPropagation();                        // Don't forget this line, otherwise jump-to-source fires
    api.runtime.copy(btn.dataset.text);          // Use runtime utils
    api.state.set('clicked', true);              // State persists across srcdoc reloads
    api.emit('my-event', { foo: 1 });            // Emit event to host
  });
}
```

Built-in capabilities:
- `api.runtime.copy(text)` · Clipboard copy
- `api.runtime.shouldJumpToSource(target)` · Jump-to-source decision
- `api.runtime.on/off/emit(type, payload)` · In-iframe event bus
- `api.state.get/set(key, value)` · Component-level state (auto-prefixed with `c:<id>:<variant>:`), survives markdown edit re-renders
- Native `<details>` `open` state auto-persisted — component authors need no extra code

Components with built-in interactions: `checklist` (checkbox writeback to MD) / `code-block` (copy, walkthrough collapse) / `comparison` (ba Tab, options radio) / `table` (standard/risk header sort, flag toggle) / `chip` (risk active, legend multi-select filter) / `collapse-section` + any `<details>` (expand state preserved).


<!-- @use checklist -->

<!-- @slot:checklistHeading -->Pre-Flight Checklist for New Templates<!-- @/slot -->

- [ ] `@compose` list = exact set of components used (no more, no less)
- [ ] Every `@use <id>` references an existing built-in component
- [ ] Every `@slot:<name>` is a real slot name of the component
- [ ] Multiple entries of the same type use multiple `@use`, not fabricated numbered slots
- [ ] `table standard` uses `tableContent` + Markdown table; `risk/impact/flag` uses `tableData` + `|` separator
- [ ] `metric band`'s three slots (`metricValue / metricLabel / metricDelta`) have equal row counts
- [ ] Run `npm run audit:templates` → 21/21 all green


<!-- @use faq-item -->

<!-- @slot:faqQ -->`@use` doesn't render the component<!-- @/slot -->

<!-- @slot:faqA -->
Check if the component id is declared in `@compose`. **Undeclared components cannot be activated by `@use`** — this is by design (enforces explicit dependencies). The compiler reports `unregistered-use` in diagnostics.
<!-- @/slot -->


<!-- @use faq-item -->

<!-- @slot:faqQ -->Content written but page is blank<!-- @/slot -->

<!-- @slot:faqA -->
Most likely a wrong slot name or `bind` mismatch. Temporarily switch to explicit `@slot:name` — if it shows up, the auto-binding failed. Go back and adjust the bind type.
<!-- @/slot -->


<!-- @use faq-item -->

<!-- @slot:faqQ -->Will two uses of the same component merge content?<!-- @/slot -->

<!-- @slot:faqA -->
No. Each `@use` creates an independent component instance. timeline / faq-item / callout etc. all rely on this mechanism for "multiple entries".
<!-- @/slot -->


<!-- @use faq-item -->

<!-- @slot:faqQ -->How to see a component's slots and variants<!-- @/slot -->

<!-- @slot:faqA -->
Read the source directly: `src/builtin/components/<category>/<id>.forge.md` — the `## Slots` section lists all slots, the `## Variants` section lists all variants. The Playground's right-side property panel also shows slot lists + one-click variant switching.
<!-- @/slot -->


<!-- @use faq-item -->

<!-- @slot:faqQ -->Click-to-jump-back-to-editor doesn't work<!-- @/slot -->

<!-- @slot:faqA -->
Two possibilities:
1. The component template is missing `data-slot="<name>"` — emitter walks up the DOM looking for `data-src-line`, without it there's no jump target
2. You clicked an interactive element (button / input / `<summary>` / `[data-no-jump]`) — this is intentional: interaction takes priority over positioning, otherwise "clicking copy also jumps" would be annoying (see `shouldJumpToSource` decision rules)
<!-- @/slot -->


<!-- @use faq-item -->

<!-- @slot:faqQ -->Does exported HTML include editor attributes / interaction scripts?<!-- @/slot -->

<!-- @slot:faqA -->
No. The toolbar "Export" uses `outputMode: 'standalone'` compilation, which strips `data-src-line` / `data-forge-id` / `data-md-checkbox` editor attributes and all runtime scripts, outputting a clean file that opens standalone in any browser.
<!-- @/slot -->


<!-- @use footer -->

<!-- @slot:footer -->
forge · docs/engine/syntax · rendered with forge itself. AI usage → `/llms.txt` · `/api/catalog.json` · `/docs/agent`. Source: `src/app/docs/syntax/` · Deep contract: `docs/engine/syntax.md` (for AI detail lookup) · Component source: `src/builtin/components/*.forge.md`
<!-- @/slot -->
