// Batch E: playground 系 (02, 09, 10, 18, 20)

import { makeTemplate } from '../make-template';

export const BATCH_E_TEMPLATES = [
  makeTemplate({
    id: 'he-02-visual-designs',
    name: '视觉方案探索',
    description: '四种视觉方向的实时对比：极简、插画、趣味、引导式',
    emoji: '🎨',
    icon: 'Palette',
    color: 'var(--color-clay-100)',
    group: 'playground',
    componentIds: ['header', 'panel', 'layout-grid-2', 'card', 'comparison', 'footer'],
    docTitle: 'Empty state — four visual directions',
    starterMarkdown: `<!-- @page wide -->
<!-- @compose: header, panel, layout-grid-2, card, comparison, footer -->
<!-- @theme editorial -->

<!-- ─── header ─── -->
<!-- @use header -->

# Four visual directions for the "no tasks yet" state

<!-- @slot:eyebrow -->Exploration · Empty states<!-- @/slot -->

<!-- ─── prompt panel ─── -->
<!-- @use panel variant=prompt -->

<!-- @slot:panelTitle -->Prompt<!-- @/slot -->

<!-- @slot:panelBody -->
Explore four visual directions for our empty-state component. Render each live so we can compare tone, density, and how well they hold up on light and dark surfaces.
<!-- @/slot -->

<!-- ─── artboard grid ─── -->
<!-- @use layout-grid-2 -->

<!-- @compose-group: layout-grid-2 -->

<!-- @item card -->
<!-- @slot:cardTitle -->A — Minimal<!-- @/slot -->
<!-- @slot:cardBody -->
### No tasks yet

When you create a task it will show up here.

\`[New task]\`

_Pure typography, single quiet action. Reads as calm and confident; assumes the surrounding UI already carries enough personality._
<!-- @/slot -->
<!-- @/item -->

<!-- @item card -->
<!-- @slot:cardTitle -->B — Illustrated<!-- @/slot -->
<!-- @slot:cardBody -->
<svg width="120" height="90" viewBox="0 0 120 90" aria-hidden="true">
  <rect x="14" y="20" width="72" height="54" rx="8" fill="#FAF9F5" stroke="#D1CFC5" stroke-width="1.5"/>
  <rect x="34" y="10" width="72" height="54" rx="8" fill="#E3DACC"/>
  <line x1="46" y1="26" x2="92" y2="26" stroke="#141413" stroke-width="2" stroke-linecap="round"/>
  <line x1="46" y1="38" x2="80" y2="38" stroke="#141413" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
  <circle cx="98" cy="60" r="12" fill="#D97757"/>
  <path d="M98 55 v10 M93 60 h10" stroke="white" stroke-width="2" stroke-linecap="round"/>
</svg>

### Start your first list

Group related work and watch progress roll up automatically.

\`[Create a task]\`

_A small geometric spot illustration anchors the eye and explains the object model (lists contain tasks) without a wall of copy._
<!-- @/slot -->
<!-- @/item -->

<!-- @item card -->
<!-- @slot:cardTitle -->C — Playful<!-- @/slot -->
<!-- @slot:cardBody -->
### Nothing on your plate

Enjoy the quiet, or add something to get moving.

_A gently bobbing stack adds life to an otherwise static screen. Motion is subtle enough to loop indefinitely without drawing complaints._
<!-- @/slot -->
<!-- @/item -->

<!-- @item card -->
<!-- @slot:cardTitle -->D — Instructional<!-- @/slot -->
<!-- @slot:cardBody -->
### Set up this project

1. **Create your first task** — Give it a name and an owner.
2. **Add a due date** — Birchline will surface it on the timeline.
3. **Invite a teammate** — Shared projects stay in sync automatically.

_Treats the empty state as onboarding. Higher density, but every line is actionable — best when the user is new to the product, not just the view._
<!-- @/slot -->
<!-- @/item -->

<!-- @/compose-group -->

<!-- ─── comparison (light/dark toggle) ─── -->
<!-- @use comparison variant=options -->

<!-- @slot:optionTitle -->Background<!-- @/slot -->
<!-- @slot:optionItems -->
Light — ivory surface, slate text
Dark — slate surface, ivory text
<!-- @/slot -->

<!-- ─── footer ─── -->
<!-- @use footer -->

<!-- @slot:footer -->Birchline · Design Exploration<!-- @/slot -->`,
    missingComponents: ['theme-toggle', 'animation-stage'],
  }),

  makeTemplate({
    id: 'he-09-slide-deck',
    name: '幻灯片演示',
    description: '全屏滑动演示：标题页 + 交付列表 + 进度 + 指标 + 决策 + 下周计划',
    emoji: '📽️',
    icon: 'Monitor',
    color: '#E0E7FF',
    group: 'playground',
    componentIds: ['header', 'highlights', 'progress', 'metric', 'callout', 'body', 'footer'],
    docTitle: 'Platform Eng — Week of Mar 10',
    starterMarkdown: `<!-- @page xwide -->
<!-- @compose: header, highlights, progress, metric, callout, body, footer -->
<!-- @theme editorial -->

<!-- ─── Title slide ─── -->
<!-- @use header -->

# Platform Eng · Week of Mar 10

## What shipped, what's moving, and one decision we need from the room before the Birchline 2.4 cut

<!-- @slot:eyebrow -->Weekly team update<!-- @/slot -->

<!-- ─── Slide: Shipped this week ─── -->
<!-- @use highlights -->

## Shipped this week — three things out the door

- **Bulk task import.** CSV and JSON uploads now land straight into a board with column mapping — no more paste-and-pray. \`#4211\`
- **Webhook retries v2.** Exponential backoff with jitter; dead-letter queue surfaces in the workspace admin panel. \`#4188 #4203\`
- **Postgres 16 migration.** All read replicas cut over Tuesday night; zero customer-facing downtime, ~9% faster aggregate queries. \`#4179\`

<!-- ─── Slide: In progress ─── -->
<!-- @use progress variant=bars -->

<!-- @slot:barsHeading -->In progress — carrying into next week<!-- @/slot -->

<!-- @slot:barsItems -->
Recurring tasks engine|70|Scheduler & RRULE parsing done; timezone edge cases remain
Audit log export|35|Streaming NDJSON behind a flag; wiring S3 destination picker
<!-- @/slot -->

<!-- ─── Slide: Metrics ─── -->
<!-- @use metric variant=band -->

<!-- @slot:metricValue -->
184 ms
0.21%
8 days
<!-- @/slot -->

<!-- @slot:metricLabel -->
API p95 latency
Background job error rate
p95 latency trend
<!-- @/slot -->

<!-- @slot:metricDelta -->
↓ 12% wk/wk
↓ 0.08pp
trailing window
<!-- @/slot -->

<!-- ─── Slide: Decision needed ─── -->
<!-- @use callout variant=concept -->

<!-- @slot:calloutTitle -->Decision needed — one call to make<!-- @/slot -->

<!-- @slot:calloutBody -->
Do we ship recurring tasks behind a workspace flag in **2.4**, or hold one more week for the timezone fixes?

- **A — Flag it, ship Friday.** Design partners get it Friday but two code paths for ~2 weeks.
- **B — Hold for 2.5.** Single code path but slips the partner promise.
<!-- @/slot -->

<!-- ─── Slide: Next week ─── -->
<!-- @use body -->

<!-- @slot:body -->
## Next week — on deck

- Finish recurring tasks — timezone matrix tests, then dogfood on the internal ops board.
- Audit log export to private beta — three workspaces lined up.
- Start scoping rate-limit headers for the public API; RFC draft by Thursday.

_Questions → drop them in the platform channel or grab anyone after standup._
<!-- @/slot -->

<!-- ─── footer ─── -->
<!-- @use footer -->

<!-- @slot:footer -->Birchline · Platform Eng · Week of Mar 10<!-- @/slot -->`,
    missingComponents: ['slide-deck', 'sparkline-chart'],
  }),

  makeTemplate({
    id: 'he-10-svg-illustrations',
    name: 'SVG 插图集',
    description: '三幅手绘风格 SVG 插图：队列、重试退避、扇出/扇入，带下载按钮',
    emoji: '🖼️',
    icon: 'Image',
    color: 'var(--color-ivory-200)',
    group: 'playground',
    componentIds: ['header', 'illustration', 'panel', 'footer'],
    docTitle: 'Background jobs — header illustrations',
    starterMarkdown: `<!-- @page wide -->
<!-- @compose: header, illustration, panel, footer -->
<!-- @theme editorial -->

<!-- ─── header ─── -->
<!-- @use header -->

# Background jobs — header illustrations

<!-- @slot:eyebrow -->Illustrations · Birchline docs<!-- @/slot -->

Three 720×320 hand-drawn SVGs for the Birchline docs section on background jobs. Flat fills, 1.5–2px strokes, palette-locked. Each exports standalone via the button below it.

<!-- @slot:subtitle -->720 × 320 · inline SVG · no external assets<!-- @/slot -->

<!-- ─── illustration A: Queue ─── -->
<!-- @use illustration variant=frame -->

<!-- @slot:frameTitle -->Queue<!-- @/slot -->
<!-- @slot:frameSub -->For "How jobs are picked up" — intro page header.<!-- @/slot -->
<!-- @slot:frameSvg -->
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="320" viewBox="0 0 720 320">
  <rect width="720" height="320" fill="#FAF9F5"/>
  <text x="60" y="96" font-family="system-ui, sans-serif" font-size="12" fill="#87867F">queue</text>
  <g>
    <rect x="60"  y="110" width="70" height="100" rx="10" fill="#F0EEE6" stroke="#3D3D3A" stroke-width="1.5"/>
    <text x="95"  y="164" text-anchor="middle" font-family="ui-monospace, monospace" font-size="11" fill="#3D3D3A">job 5</text>
    <rect x="140" y="110" width="70" height="100" rx="10" fill="#F0EEE6" stroke="#3D3D3A" stroke-width="1.5"/>
    <text x="175" y="164" text-anchor="middle" font-family="ui-monospace, monospace" font-size="11" fill="#3D3D3A">job 4</text>
    <rect x="220" y="110" width="70" height="100" rx="10" fill="#F0EEE6" stroke="#3D3D3A" stroke-width="1.5"/>
    <text x="255" y="164" text-anchor="middle" font-family="ui-monospace, monospace" font-size="11" fill="#3D3D3A">job 3</text>
    <rect x="300" y="110" width="70" height="100" rx="10" fill="#F0EEE6" stroke="#3D3D3A" stroke-width="1.5"/>
    <text x="335" y="164" text-anchor="middle" font-family="ui-monospace, monospace" font-size="11" fill="#3D3D3A">job 2</text>
    <rect x="380" y="110" width="70" height="100" rx="10" fill="#D97757" stroke="#141413" stroke-width="2"/>
    <text x="415" y="164" text-anchor="middle" font-family="ui-monospace, monospace" font-size="11" fill="#FAF9F5">job 1</text>
  </g>
  <line x1="458" y1="160" x2="522" y2="160" stroke="#87867F" stroke-width="1.5" marker-end="url(#arrow)"/>
  <rect x="530" y="90" width="130" height="140" rx="10" fill="#E3DACC" stroke="#141413" stroke-width="2"/>
  <text x="595" y="156" text-anchor="middle" font-family="ui-monospace, monospace" font-size="11" fill="#141413">worker</text>
  <text x="595" y="172" text-anchor="middle" font-family="ui-monospace, monospace" font-size="11" fill="#87867F">pool=4</text>
  <text x="415" y="234" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#87867F">next to run</text>
  <text x="60"  y="258" font-family="system-ui, sans-serif" font-size="12" fill="#87867F">Jobs are pulled FIFO; the worker leases one at a time.</text>
</svg>
<!-- @/slot -->

<!-- ─── illustration B: Retry with backoff ─── -->
<!-- @use illustration variant=frame -->

<!-- @slot:frameTitle -->Retry with backoff<!-- @/slot -->
<!-- @slot:frameSub -->For "Handling failures" — retry policy header.<!-- @/slot -->
<!-- @slot:frameSvg -->
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="320" viewBox="0 0 720 320">
  <rect width="720" height="320" fill="#FAF9F5"/>
  <line x1="60" y1="190" x2="660" y2="190" stroke="#D1CFC5" stroke-width="1.5"/>
  <text x="60" y="214" font-family="system-ui, sans-serif" font-size="12" fill="#87867F">t = 0</text>
  <text x="660" y="214" text-anchor="end" font-family="system-ui, sans-serif" font-size="12" fill="#87867F">time →</text>
  <circle cx="100" cy="190" r="8" fill="#FAF9F5" stroke="#D97757" stroke-width="2"/>
  <line x1="96" y1="186" x2="104" y2="194" stroke="#D97757" stroke-width="1.5"/>
  <line x1="104" y1="186" x2="96" y2="194" stroke="#D97757" stroke-width="1.5"/>
  <text x="100" y="222" text-anchor="middle" font-family="ui-monospace, monospace" font-size="11" fill="#3D3D3A">try 1</text>
  <circle cx="170" cy="190" r="8" fill="#FAF9F5" stroke="#D97757" stroke-width="2"/>
  <line x1="166" y1="186" x2="174" y2="194" stroke="#D97757" stroke-width="1.5"/>
  <line x1="174" y1="186" x2="166" y2="194" stroke="#D97757" stroke-width="1.5"/>
  <text x="170" y="222" text-anchor="middle" font-family="ui-monospace, monospace" font-size="11" fill="#3D3D3A">try 2</text>
  <circle cx="310" cy="190" r="8" fill="#FAF9F5" stroke="#D97757" stroke-width="2"/>
  <line x1="306" y1="186" x2="314" y2="194" stroke="#D97757" stroke-width="1.5"/>
  <line x1="314" y1="186" x2="306" y2="194" stroke="#D97757" stroke-width="1.5"/>
  <text x="310" y="222" text-anchor="middle" font-family="ui-monospace, monospace" font-size="11" fill="#3D3D3A">try 3</text>
  <circle cx="590" cy="190" r="9" fill="#788C5D" stroke="#141413" stroke-width="1.5"/>
  <path d="M585,190 L589,194 L596,185" fill="none" stroke="#FAF9F5" stroke-width="1.5" stroke-linecap="round"/>
  <text x="590" y="222" text-anchor="middle" font-family="ui-monospace, monospace" font-size="11" fill="#3D3D3A">try 4</text>
  <path d="M 100 182 Q 135 130 170 182" fill="none" stroke="#87867F" stroke-width="1.5" stroke-dasharray="4 4"/>
  <text x="135" y="124" text-anchor="middle" font-family="ui-monospace, monospace" font-size="11" fill="#87867F">+1s</text>
  <path d="M 170 182 Q 240 110 310 182" fill="none" stroke="#87867F" stroke-width="1.5" stroke-dasharray="4 4"/>
  <text x="240" y="104" text-anchor="middle" font-family="ui-monospace, monospace" font-size="11" fill="#87867F">+2s</text>
  <path d="M 310 182 Q 450 80 590 182" fill="none" stroke="#87867F" stroke-width="1.5" stroke-dasharray="4 4"/>
  <text x="450" y="74" text-anchor="middle" font-family="ui-monospace, monospace" font-size="11" fill="#87867F">+4s</text>
  <text x="60" y="262" font-family="system-ui, sans-serif" font-size="12" fill="#87867F">Each failure waits twice as long before re-queuing; jitter not pictured.</text>
</svg>
<!-- @/slot -->

<!-- ─── illustration C: Fan-out / fan-in ─── -->
<!-- @use illustration variant=frame -->

<!-- @slot:frameTitle -->Fan-out / fan-in<!-- @/slot -->
<!-- @slot:frameSub -->For "Batch and parallel work" — fan-out pattern header.<!-- @/slot -->
<!-- @slot:frameSvg -->
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="320" viewBox="0 0 720 320">
  <rect width="720" height="320" fill="#FAF9F5"/>
  <rect x="60" y="128" width="110" height="64" rx="10" fill="#E3DACC" stroke="#141413" stroke-width="2"/>
  <text x="115" y="158" text-anchor="middle" font-family="ui-monospace, monospace" font-size="11" fill="#141413">enqueue</text>
  <text x="115" y="172" text-anchor="middle" font-family="ui-monospace, monospace" font-size="11" fill="#87867F">batch()</text>
  <line x1="170" y1="160" x2="296" y2="64"  stroke="#87867F" stroke-width="1.5" marker-end="url(#arrow)"/>
  <line x1="170" y1="160" x2="296" y2="128" stroke="#87867F" stroke-width="1.5" marker-end="url(#arrow)"/>
  <line x1="170" y1="160" x2="296" y2="192" stroke="#87867F" stroke-width="1.5" marker-end="url(#arrow)"/>
  <line x1="170" y1="160" x2="296" y2="256" stroke="#87867F" stroke-width="1.5" marker-end="url(#arrow)"/>
  <rect x="300" y="44"  width="120" height="40" rx="10" fill="#F0EEE6" stroke="#3D3D3A" stroke-width="1.5"/>
  <text x="360" y="69"  text-anchor="middle" font-family="ui-monospace, monospace" font-size="11" fill="#3D3D3A">shard 0</text>
  <rect x="300" y="108" width="120" height="40" rx="10" fill="#F0EEE6" stroke="#3D3D3A" stroke-width="1.5"/>
  <text x="360" y="133" text-anchor="middle" font-family="ui-monospace, monospace" font-size="11" fill="#3D3D3A">shard 1</text>
  <rect x="300" y="172" width="120" height="40" rx="10" fill="#F0EEE6" stroke="#3D3D3A" stroke-width="1.5"/>
  <text x="360" y="197" text-anchor="middle" font-family="ui-monospace, monospace" font-size="11" fill="#3D3D3A">shard 2</text>
  <rect x="300" y="236" width="120" height="40" rx="10" fill="#F0EEE6" stroke="#3D3D3A" stroke-width="1.5"/>
  <text x="360" y="261" text-anchor="middle" font-family="ui-monospace, monospace" font-size="11" fill="#3D3D3A">shard 3</text>
  <line x1="420" y1="64"  x2="546" y2="160" stroke="#87867F" stroke-width="1.5" marker-end="url(#arrow)"/>
  <line x1="420" y1="128" x2="546" y2="160" stroke="#87867F" stroke-width="1.5" marker-end="url(#arrow)"/>
  <line x1="420" y1="192" x2="546" y2="160" stroke="#87867F" stroke-width="1.5" marker-end="url(#arrow)"/>
  <line x1="420" y1="256" x2="546" y2="160" stroke="#87867F" stroke-width="1.5" marker-end="url(#arrow)"/>
  <rect x="550" y="128" width="110" height="64" rx="10" fill="#788C5D" stroke="#141413" stroke-width="2"/>
  <text x="605" y="158" text-anchor="middle" font-family="ui-monospace, monospace" font-size="11" fill="#FAF9F5">merge</text>
  <text x="605" y="172" text-anchor="middle" font-family="ui-monospace, monospace" font-size="11" fill="#E3DACC">await all</text>
  <text x="232" y="42"  font-family="system-ui, sans-serif" font-size="12" fill="#87867F">fan-out</text>
  <text x="486" y="42"  text-anchor="end" font-family="system-ui, sans-serif" font-size="12" fill="#87867F">fan-in</text>
  <text x="60"  y="300" font-family="system-ui, sans-serif" font-size="12" fill="#87867F">Parent job spawns N children, then blocks on a completion barrier.</text>
</svg>
<!-- @/slot -->

<!-- ─── palette & rules panel ─── -->
<!-- @use panel variant=snippet -->

### Palette & rules

| Color | Hex | Usage |
|---|---|---|
| ivory | #FAF9F5 | Background |
| slate | #141413 | Primary text, 2px strokes |
| clay | #D97757 | Accent, "the thing in focus" |
| olive | #788C5D | Success / done |
| oat | #E3DACC | Secondary fill |
| gray-150 | #F0EEE6 | Neutral fill |
| gray-300 | #D1CFC5 | Dividers, 1.5px strokes |
| gray-500 | #87867F | Annotations, labels |

- Strokes are 1.5px for neutral boxes, 2px for emphasised containers.
- All rectangles use rx="10"; no drop shadows or gradients.
- Labels inside boxes are 11px mono; annotations outside are 12px sans, gray-500.
- Each SVG carries its own <style> block so the download stands alone.

<!-- ─── footer ─── -->
<!-- @use footer -->

<!-- @slot:footer -->Birchline · Docs · Background Jobs<!-- @/slot -->`,
    missingComponents: ['svg-download-button'],
  }),

  makeTemplate({
    id: 'he-18-editor-triage-board',
    name: '编辑器看板',
    description: '四列拖拽看板：Now / Next / Later / Cut，带筛选、统计和导出',
    emoji: '📌',
    icon: 'KanbanSquare',
    color: 'var(--color-clay-100)',
    group: 'playground',
    componentIds: ['header', 'chip', 'layout-grid-4', 'card', 'footer'],
    docTitle: 'Birchline — Cycle 14 triage',
    starterMarkdown: `<!-- @page wide -->
<!-- @compose: header, chip, layout-grid-4, card, footer -->
<!-- @theme editorial -->

<!-- ─── header ─── -->
<!-- @use header -->

# Cycle 14 triage

## Birchline / editor / triage

<!-- @slot:subtitle -->Twenty-four open Linear tickets, pre-sorted into a best guess. Drag them across Now / Next / Later / Cut until the cut feels right, then copy the result back into the planning doc as markdown.<!-- @/slot -->

<!-- ─── stats row ─── -->
<!-- @use chip variant=risk -->
<!-- @slot:riskLabel -->5 now · 7 next · 8 later · 4 cut<!-- @/slot -->
<!-- @slot:riskLevel -->safe<!-- @/slot -->

<!-- ─── kanban board: 4 columns ─── -->
<!-- @use layout-grid-4 -->

<!-- @slot:heading -->Triage board — drag tickets between columns<!-- @/slot -->

<!-- @compose-group: layout-grid-4 -->

<!-- @item card -->
<!-- @slot:cardTitle -->Now · 5 · 12 pts<!-- @/slot -->
<!-- @slot:cardBody -->
- \`BIR-241\` **bug · M** — Fix sync conflict toast firing twice on reconnect · _AK_
- \`BIR-238\` **bug · L** — Comments lost when editing offline then reloading · _JM_
- \`BIR-252\` **bug · M** — Billing webhook 500s on annual → monthly downgrade · _RS_
<!-- @/slot -->
<!-- @/item -->

<!-- @item card -->
<!-- @slot:cardTitle -->Next · 7 · 16 pts<!-- @/slot -->
<!-- @slot:cardBody -->
- \`BIR-244\` **feat · M** — Inline @-mention picker in doc comments · _JM_
- \`BIR-231\` **feat · S** — Bulk-archive completed projects from the sidebar · _EL_
<!-- @/slot -->
<!-- @/item -->

<!-- @item card -->
<!-- @slot:cardTitle -->Later · 8 · 14 pts<!-- @/slot -->
<!-- @slot:cardBody -->
- \`BIR-213\` **chore · M** — Dark mode pass on settings + billing pages · _EL_
<!-- @/slot -->
<!-- @/item -->

<!-- @item card -->
<!-- @slot:cardTitle -->Cut · 4 · 9 pts<!-- @/slot -->
<!-- @slot:cardBody -->
- \`BIR-198\` **feat · M** — Custom emoji reactions on comments · _EL_
<!-- @/slot -->
<!-- @/item -->

<!-- @/compose-group -->

<!-- ─── footer ─── -->
<!-- @use footer -->

<!-- @slot:footer -->Birchline · Editor · Triage Board<!-- @/slot -->`,
    missingComponents: ['drag-drop-kanban', 'tag-filter'],
  }),

  makeTemplate({
    id: 'he-20-editor-prompt-tuner',
    name: '提示词调优器',
    description: '双栏实时编辑：左侧模板编辑器 + 右侧三样本预览，支持插槽高亮',
    emoji: '🎛️',
    icon: 'SlidersHorizontal',
    color: '#E0E7FF',
    group: 'playground',
    componentIds: ['header', 'panel', 'layout-grid-2', 'card', 'footer'],
    docTitle: 'Birchline — Support reply prompt tuner',
    starterMarkdown: `<!-- @page wide -->
<!-- @compose: header, panel, layout-grid-2, card, footer -->
<!-- @theme editorial -->

<!-- ─── header ─── -->
<!-- @use header -->

# Support reply draft prompt

## Birchline / editor / prompt-tuner

<!-- @slot:subtitle -->Edit the system prompt on the left and watch three real sample tickets re-render the filled template on the right, live as you type. When it reads well across all three moods, copy the template out.<!-- @/slot -->

<!-- ─── prompt template panel ─── -->
<!-- @use panel variant=prompt -->

<!-- @slot:panelTitle -->Template · slots use {{double_brace}} syntax<!-- @/slot -->

<!-- @slot:panelBody -->
\`\`\`
You are a support agent for Birchline, a project workspace for small teams.

A customer named {{customer_name}} on the {{plan_tier}} plan wrote in about:
"{{ticket_subject}}"

Their message:
{{ticket_body}}

Write a reply that is {{tone}}, no more than 120 words, and ends with a single concrete next step.
Never promise a refund without escalating. Sign off as "The Birchline team."
\`\`\`

**Slots:** \`{{customer_name}}\` \`{{plan_tier}}\` \`{{ticket_subject}}\` \`{{ticket_body}}\` \`{{tone}}\`
<!-- @/slot -->

<!-- ─── live preview — 3 sample tickets ─── -->
<!-- @use layout-grid-2 -->

<!-- @slot:heading -->Live preview · 3 sample tickets<!-- @/slot -->

<!-- @compose-group: layout-grid-2 -->

<!-- @item card -->
<!-- @slot:cardTitle -->Sample 1 — Priya N. (Free)<!-- @/slot -->
<!-- @slot:cardBody -->
You are a support agent for Birchline, a project workspace for small teams.

A customer named **Priya N.** on the **Free** plan wrote in about: _"Where did my board go?"_

Their message:

> Hi — I made a board yesterday called "Spring launch" with my coworker and today I can't find it anywhere. I'm new to Birchline and I'm not sure if I deleted it by accident or if I'm just looking in the wrong place. Can you help?

Write a reply that is **warm and patient**, no more than 120 words, and ends with a single concrete next step.
<!-- @/slot -->
<!-- @/item -->

<!-- @item card -->
<!-- @slot:cardTitle -->Sample 2 — Marcus D. (Team)<!-- @/slot -->
<!-- @slot:cardBody -->
You are a support agent for Birchline, a project workspace for small teams.

A customer named **Marcus D.** on the **Team** plan wrote in about: _"Sync keeps dropping comments"_

Their message:

> This is the third time this week. I leave comments on cards from my laptop, switch to my phone on the train, and they're gone. My team thinks I'm ignoring them. We pay for 14 seats and this is genuinely making us look bad to a client.

Write a reply that is **direct and apologetic**, no more than 120 words, and ends with a single concrete next step.
<!-- @/slot -->
<!-- @/item -->

<!-- @/compose-group -->

<!-- ─── footer ─── -->
<!-- @use footer -->

<!-- @slot:footer -->Highlighted slots fill from each sample's ticket fields. Anything underlined in dashed clay isn't a known field and will pass through unfilled.<!-- @/slot -->`,
    missingComponents: ['live-template-editor', 'slot-highlighter'],
  }),
];
