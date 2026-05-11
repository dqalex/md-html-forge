import '@/builtin/bootstrap-data-only';
import { FORGE_COMPONENTS, FORGE_SAMPLES } from '@/builtin/components/forge-registry';
import { forgeRegistry } from '@/builtin/compiler/registry';
import type { ComponentDef } from '@/builtin/types';

/**
 * Generate agent-friendly plain-text site docs.
 * Shared by /llms.txt (route handler) and /docs/agent (browser page).
 *
 * Supports bilingual output via `lang` parameter.
 */

type Lang = 'zh' | 'en';

function formatComponent(c: ComponentDef, lang: Lang): string {
  const lines: string[] = [];
  lines.push(`### ${c.id} · ${c.name}`);
  if (c.description) lines.push(c.description);
  if (c.tags?.length) lines.push(`tags: ${c.tags.join(', ')}`);
  lines.push(`category: ${c.category}${c.isLayout ? (lang === 'zh' ? ' (布局容器)' : ' (layout container)') : ''}`);
  if (c.variants?.length) {
    lines.push('');
    lines.push(lang === 'zh' ? '**变体**：' : '**Variants**:');
    for (const v of c.variants) {
      const isDefault = v === c.defaultVariant ? (lang === 'zh' ? ' *(默认)*' : ' *(default)*') : '';
      const desc = c.variantDescriptions?.[v] ? ` — ${c.variantDescriptions[v]}` : '';
      lines.push(`- \`${v}\`${isDefault}${desc}`);
    }
  }
  const slotEntries = Object.entries(c.slots);
  if (slotEntries.length) {
    lines.push('');
    lines.push(lang === 'zh' ? '**Slots**：' : '**Slots**:');
    for (const [name, def] of slotEntries) {
      const parts: string[] = [`type=${def.type}`];
      if (def.bind) parts.push(`bind=${def.bind}`);
      lines.push(`- \`${name}\` (${parts.join(', ')}) — ${def.label}${def.description ? `. ${def.description}` : ''}`);
    }
  }
  if (c.keySlots?.length) {
    lines.push('');
    const keySlotsLabel = lang === 'zh' ? '**关键 slot**（决策要点）' : '**Key slots** (decision-maker focus)';
    lines.push(`${keySlotsLabel}: ${c.keySlots.map((s) => `\`${s}\``).join(', ')}`);
  }
  if (c.whenToUse?.length) {
    lines.push('');
    lines.push(lang === 'zh' ? '**何时用**：' : '**When to use**:');
    for (const s of c.whenToUse) lines.push(`- ${s}`);
  }
  if (c.whenNot?.length) {
    lines.push('');
    lines.push(lang === 'zh' ? '**何时别用**：' : '**When NOT to use**:');
    for (const s of c.whenNot) lines.push(`- ${s}`);
  }
  const sample = FORGE_SAMPLES[c.id];
  if (sample) {
    lines.push('');
    lines.push(lang === 'zh' ? '**示例 markdown**：' : '**Sample markdown**:');
    lines.push('```markdown');
    lines.push(sample.trim());
    lines.push('```');
  }
  return lines.join('\n');
}

export function generateAgentDocs(lang: Lang = 'zh'): string {
  const allComponents = forgeRegistry.getAllComponents();
  const forgeMdIds = new Set(FORGE_COMPONENTS.map((c) => c.id));

  const components = FORGE_COMPONENTS.slice().sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.id.localeCompare(b.id);
  });
  const layouts = allComponents
    .filter((c) => c.isLayout)
    .sort((a, b) => a.id.localeCompare(b.id));
  const legacy = allComponents
    .filter((c) => !c.isLayout && !forgeMdIds.has(c.id))
    .sort((a, b) => a.id.localeCompare(b.id));
  const themes = forgeRegistry.getAllThemes();

  if (lang === 'en') {
    return generateAgentDocsEn(components, layouts, legacy, themes);
  }

  // Chinese version (original)
  return `# md-html-forge

> Markdown → 组件化 HTML。文档源始终是合法 Markdown，所有扩展走 \`<!-- @xxx -->\` 注释。
> 这份文档是给 AI（Claude / ChatGPT / Cursor / Copilot 等）准备的"契约文档"，动态生成，
> 反映当前代码实际能力；无多余 HTML/样式，便于复制到上下文窗口或 embedding。

## 如何用 forge 写一份文档

最小可运行文档：

\`\`\`markdown
<!-- @page narrow -->
<!-- @compose: header, body, footer -->
<!-- @theme editorial -->

<!-- @use header -->

# 标题

## 副标题

<!-- @use body -->

## 章节

正文内容，支持 **加粗**、\`代码\`、[链接](https://example.com)、列表。

<!-- @use footer -->

<!-- @slot:footer -->版权 2026<!-- @/slot -->
\`\`\`

三条铁律：
1. **@compose 必须列出所有要用的组件 id**（不多不少，多余会被兜底成空组件）
2. **每个 slot 名必须是目标组件真实存在的字段**（不能虚构）
3. **同组件多实例用多次 @use**，不要写 \`q1 / a1 / q2 / a2\` 这种编号

## 指令全集（7 个）

- **@page** — 文档级页面配置（页宽 / band 样式）。\`<!-- @page narrow -->\`。至多 1 次。
- **@compose** — 列出文档用到的所有组件 id（**必填**）。\`<!-- @compose: header, lead, footer -->\`。至多 1 次。
- **@theme** — 切当前段主题，段级生效（直到下次 @theme）。\`<!-- @theme dark -->\`。
- **@layout** — 切当前段布局容器。\`<!-- @layout grid-3 -->\`。
- **@use** — 开一个组件实例，可带 \`variant=\`。后续原生 MD 块按该组件 slots 的 bind 自动绑定。\`<!-- @use metric variant=band -->\`。
- **@slot:\\<name\\>** — 显式填 slot 内容。\`<!-- @slot:calloutTitle -->文字<!-- @/slot -->\`。优先级最高。
- **@compose-group / @item** — 循环布局（一个布局容器内 N 个同结构子项）。@item 支持 (1) 显式 @slot 块 (2) 属性式 \`key="value"\` (3) 裸 MD 按子组件 bind 自动绑定。variant 会透传。

## 原生 MD 自动绑定

每个组件的 slot 可声明 \`bind\` 类型；@use 之后的原生 MD 块按声明顺序匹配：

| bind | 匹配 |
| --- | --- |
| h1 / h2 / h3 | 对应标题 |
| blockquote | \`>\` 引用块 |
| ul / ol / list | 无序 / 有序 / 任意列表 |
| code | \`\`\`\` 代码块 |
| table | \`|\` 分隔表格 |
| paragraph | 普通段落 |
| content | 兜底，吃剩余所有块；支持多个 content slot 按声明顺序分配（最后一个吃掉余量） |

规则：第一轮按具体 bind 类型匹配；第二轮剩余块按声明顺序进 content slot。显式 @slot 永远优先。

## 主题（${themes.length} 个）

${themes.map((t) => `- **${t.id}**${t.name ? ` · ${t.name}` : ''}${t.description ? ` — ${t.description}` : ''}${t.bandStyle ? ` · bandStyle=${t.bandStyle}` : ''}`).join('\n')}

## 布局容器（${layouts.length} 个，用 @compose-group 或 @layout）

${layouts.map((l) => `- **${l.id}** · ${l.name}${l.description ? ` — ${l.description}` : ''}`).join('\n')}

## 组件（${components.length} 个）

${components.map((c) => formatComponent(c, 'zh')).join('\n\n---\n\n')}

${legacy.length ? `## 其它组件（${legacy.length} 个，老式 TS，未来会迁移到 .forge.md）

${legacy.map((c) => `- **${c.id}** (${c.category}) · ${c.name}${c.description ? ` — ${c.description}` : ''}${c.variants?.length ? ` · variants: ${c.variants.join(', ')}` : ''}`).join('\n')}
` : ''}

## 组件交互 API

带 \`## JS\` 块的 .forge.md 组件，在预览页会被挂载为交互组件：

\`\`\`js
export function mount(el, api) {
  // el → 组件根 DOM（带 data-forge-id）
  // api → { el, runtime, emit, on, state }

  el.querySelector('.btn').addEventListener('click', (e) => {
    e.stopPropagation();                            // 必须：避免冒泡触发"定位到源码"
    api.runtime.copy(btn.dataset.text);              // 剪贴板
    api.state.set('clicked', true);                  // 跨 srcdoc 重载保留
    api.emit('my-event', { foo: 1 });                // 向宿主发事件
  });
}
\`\`\`

内置能力：
- \`api.runtime.copy(text)\` · 剪贴板复制
- \`api.runtime.shouldJumpToSource(target)\` · 统一的跳转决策
- \`api.runtime.on / off / emit(type, payload)\` · 同 iframe 内事件总线
- \`api.state.get / set(key, value)\` · 组件级状态，自动加 \`c:<id>:<variant>:\` 前缀，跨 srcdoc 重载保留
- 原生 \`<details>\` 的 open 状态自动持久化（\`key = "details:" + DOM index\`）
- markdown 列表 \`- [x]\` / \`- [ ]\` 自动变 checkbox，勾选回写源 MD

## 常见错误

### 虚构 slot 名

错：\`<!-- @slot:q1 -->\` / \`<!-- @slot:a1 -->\`（\`faq-item\` 只有 \`faqQ\` / \`faqA\`）

对：多条 FAQ 用多次 \`<!-- @use faq-item -->\`，每次只填两个真实 slot。

### @compose 声明了没用的组件

错：\`<!-- @compose: header, lead, code-block, footer -->\`（实际没用到 code-block）

对：\`@compose\` 列表必须精确匹配实际 \`@use\` 集合；多余会被兜底成空组件挂页面底部。

### bind 不匹配导致内容丢失

错：\`<!-- @use highlights -->\\n\\n# 一级标题\`（highlights 的 heading slot bind:h2，不会收 h1）

对：用 h2，或显式 \`<!-- @slot:highlightsHeading -->...<!-- @/slot -->\`。

### table variant 选错 slot

- \`standard\` → 用 \`tableContent\` + 原生 Markdown 表
- \`risk / impact / flag\` → 用 \`tableData\` + \`|\` 分隔每行

### metric band 三 slot 行数必须一致

\`metricValue / metricLabel / metricDelta\` 三个 slot 按行对齐成 N 列。行数不等会错位。

## 编译流水线（4 阶段）

1. **Parser** — 按 \`@compose\` / \`@use\` / \`@slot\` / \`@item\` / \`@compose-group\` 切成 segment → component → slot 树。\`@theme\` / \`@layout\` 改当前段的渲染上下文，不打断后续 \`@use\` 的 MD 块捕获（跨段绑定已修）。
2. **MD-Binding** — 原生 MD 块按 slot 的 bind 分配：第一轮精确类型、第二轮剩余块按顺序进 content slot（多 content slot 也支持）。\`@item\` 块内走同一套规则（2026-05-11 起）。
3. **Resolver** — 解析 variant / 主题 / 布局；@item 的 variant 会透传到子组件。
4. **Emitter** — 组装最终 HTML + 注入 \`window.forge.runtime\`；\`.forge.md\` 的 \`## JS\` 挂 \`window.__forgeMounts[id]\`，按 \`[data-forge-id]\` mount。

## 更多资源

- **人类可读的完整文档**：/docs/syntax （forge 自渲染，与组件能力实时同步）
- **速查 + 选型指南**：/docs/slots （每组件一张预览卡 + whenToUse / whenNot）
- **程序化消费**：/api/catalog.json （全量 JSON，便于 embedding / MCP）
- **深度契约**：docs/engine/syntax.md（1400+ 行，给 AI agent 细节查阅）
- **组件源码**：src/builtin/components/<category>/<id>.forge.md
- **生成时间**：${new Date().toISOString()}
`;
}

function generateAgentDocsEn(
  components: ComponentDef[],
  layouts: ComponentDef[],
  legacy: ComponentDef[],
  themes: ReturnType<typeof forgeRegistry.getAllThemes>,
): string {
  return `# md-html-forge

> Markdown → component-based HTML. Source is always valid Markdown; all extensions live in \`<!-- @xxx -->\` comments.
> This document is a "contract doc" prepared for AI (Claude / ChatGPT / Cursor / Copilot etc.), dynamically generated
> to reflect the current codebase's real capabilities. No extra HTML/styles — easy to copy into context windows or embeddings.

## How to Write a Forge Document

Minimal runnable document:

\`\`\`markdown
<!-- @page narrow -->
<!-- @compose: header, body, footer -->
<!-- @theme editorial -->

<!-- @use header -->

# Title

## Subtitle

<!-- @use body -->

## Section

Body content, supporting **bold**, \`code\`, [links](https://example.com), lists.

<!-- @use footer -->

<!-- @slot:footer -->Copyright 2026<!-- @/slot -->
\`\`\`

Three iron rules:
1. **@compose must list every component id you use** (no more, no less — extras get fallback-rendered as empty components)
2. **Every slot name must be a real field of the target component** (no fabrication)
3. **Multiple instances of the same component use multiple @use** — never write \`q1 / a1 / q2 / a2\` numbering

## All Directives (7)

- **@page** — Document-level page config (width / band style). \`<!-- @page narrow -->\`. At most 1.
- **@compose** — List all component ids used in this doc (**required**). \`<!-- @compose: header, lead, footer -->\`. At most 1.
- **@theme** — Switch current segment theme; segment-level (until next @theme). \`<!-- @theme dark -->\`.
- **@layout** — Switch current segment layout container. \`<!-- @layout grid-3 -->\`.
- **@use** — Start a component instance, optionally with \`variant=\`. Following native MD blocks auto-bind to this component's slots. \`<!-- @use metric variant=band -->\`.
- **@slot:\\<name\\>** — Explicitly fill slot content. \`<!-- @slot:calloutTitle -->text<!-- @/slot -->\`. Highest priority.
- **@compose-group / @item** — Loop layout (N same-structure sub-items in one layout container). @item supports (1) explicit @slot blocks (2) attribute-style \`key="value"\` (3) bare MD auto-binding via child component's bind. Variant is passed through.

## Native MD Auto-binding

Each component slot can declare a \`bind\` type; native MD blocks after @use are matched in declaration order:

| bind | Matches |
| --- | --- |
| h1 / h2 / h3 | Corresponding heading level |
| blockquote | \`>\` quote block |
| ul / ol / list | Unordered / ordered / any list |
| code | \`\`\`\` code block |
| table | \`|\` separated table |
| paragraph | Regular paragraph |
| content | Fallback — absorbs all remaining blocks; supports multiple content slots assigned in declaration order (last one absorbs everything left) |

Rules: Round 1 matches by specific bind type; Round 2 assigns remaining blocks to content slots in order. Explicit @slot always takes priority.

## Themes (${themes.length})

${themes.map((t) => `- **${t.id}**${t.name ? ` · ${t.name}` : ''}${t.description ? ` — ${t.description}` : ''}${t.bandStyle ? ` · bandStyle=${t.bandStyle}` : ''}`).join('\n')}

## Layout Containers (${layouts.length}, use @compose-group or @layout)

${layouts.map((l) => `- **${l.id}** · ${l.name}${l.description ? ` — ${l.description}` : ''}`).join('\n')}

## Components (${components.length})

${components.map((c) => formatComponent(c, 'en')).join('\n\n---\n\n')}

${legacy.length ? `## Other Components (${legacy.length}, legacy TS, will be migrated to .forge.md)

${legacy.map((c) => `- **${c.id}** (${c.category}) · ${c.name}${c.description ? ` — ${c.description}` : ''}${c.variants?.length ? ` · variants: ${c.variants.join(', ')}` : ''}`).join('\n')}
` : ''}

## Component Interaction API

Components with a \`## JS\` block in their .forge.md are mounted as interactive components in preview:

\`\`\`js
export function mount(el, api) {
  // el → component root DOM (with data-forge-id)
  // api → { el, runtime, emit, on, state }

  el.querySelector('.btn').addEventListener('click', (e) => {
    e.stopPropagation();                            // Required: prevent bubbling from triggering "jump-to-source"
    api.runtime.copy(btn.dataset.text);              // Clipboard
    api.state.set('clicked', true);                  // Persists across srcdoc reloads
    api.emit('my-event', { foo: 1 });                // Emit event to host
  });
}
\`\`\`

Built-in capabilities:
- \`api.runtime.copy(text)\` · Clipboard copy
- \`api.runtime.shouldJumpToSource(target)\` · Unified jump-to-source decision
- \`api.runtime.on / off / emit(type, payload)\` · In-iframe event bus
- \`api.state.get / set(key, value)\` · Component-level state, auto-prefixed with \`c:<id>:<variant>:\`, survives srcdoc reloads
- Native \`<details>\` open state auto-persisted (\`key = "details:" + DOM index\`)
- Markdown list \`- [x]\` / \`- [ ]\` auto-converts to checkbox, checking writes back to source MD

## Common Mistakes

### Fabricated Slot Names

Wrong: \`<!-- @slot:q1 -->\` / \`<!-- @slot:a1 -->\` (\`faq-item\` only has \`faqQ\` / \`faqA\`)

Right: Use multiple \`<!-- @use faq-item -->\` for multiple FAQs, filling only the two real slots each time.

### Declaring Unused Components in @compose

Wrong: \`<!-- @compose: header, lead, code-block, footer -->\` (code-block not actually used)

Right: \`@compose\` list must exactly match the actual \`@use\` set; extras get fallback-rendered as empty components at the bottom.

### Bind Mismatch Causes Content Loss

Wrong: \`<!-- @use highlights -->\\n\\n# Level-1 Heading\` (highlights heading slot has bind:h2, won't accept h1)

Right: Use h2, or explicit \`<!-- @slot:highlightsHeading -->...<!-- @/slot -->\`.

### Wrong Slot for Table Variant

- \`standard\` → use \`tableContent\` + native Markdown table
- \`risk / impact / flag\` → use \`tableData\` + \`|\` separated per row

### Metric Band Three Slots Must Have Equal Row Counts

\`metricValue / metricLabel / metricDelta\` three slots align by row into N columns. Unequal row counts cause misalignment.

## Compile Pipeline (4 Stages)

1. **Parser** — Splits by \`@compose\` / \`@use\` / \`@slot\` / \`@item\` / \`@compose-group\` into segment → component → slot tree. \`@theme\` / \`@layout\` change current segment's render context, don't interrupt subsequent \`@use\` MD block capture (cross-segment binding is fixed).
2. **MD-Binding** — Native MD blocks assigned by slot bind: round 1 exact type, round 2 remaining blocks in order to content slots (multiple content slots supported). \`@item\` blocks follow the same rules (since 2026-05-11).
3. **Resolver** — Resolves variant / theme / layout; @item variant is passed through to child component.
4. **Emitter** — Assembles final HTML + injects \`window.forge.runtime\`; \`.forge.md\` \`## JS\` mounts \`window.__forgeMounts[id]\`, mounted per \`[data-forge-id]\`.

## More Resources

- **Human-readable full docs**: /docs/syntax (forge self-rendered, real-time sync with component capabilities)
- **Cheatsheet + selection guide**: /docs/slots (preview card per component + whenToUse / whenNot)
- **Programmatic consumption**: /api/catalog.json (full JSON, for embedding / MCP)
- **Deep contract**: docs/engine/syntax.md (1400+ lines, for AI agent detail lookup)
- **Component source**: src/builtin/components/<category>/<id>.forge.md
- **Generated at**: ${new Date().toISOString()}
`;
}
