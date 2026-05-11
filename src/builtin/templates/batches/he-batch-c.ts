// Batch C: plan 系 (07, 08, 13, 16)

import { makeTemplate } from '../make-template';

export const BATCH_C_TEMPLATES = [
  makeTemplate({
    id: 'he-07-animation-spec',
    name: '动画规范',
    description: '微交互动画原型：缓动面板 + 关键帧时间线 + CSS 代码片段',
    emoji: '✨',
    icon: 'ClipboardList',
    color: 'var(--color-clay-100)',
    group: 'plan',
    componentIds: ['header', 'comparison', 'design-spec', 'panel', 'footer'],
    docTitle: 'Birchline · Task completed micro-interaction',
    starterMarkdown: `<!-- @page wide -->
<!-- @compose: header, comparison, design-spec, panel, footer -->
<!-- @theme editorial -->

<!-- ─── header ─── -->
<!-- @use header -->

# Task completed

## A single click should feel like a tiny win

<!-- @slot:eyebrow -->Birchline / prototype / micro-interaction<!-- @/slot -->
<!-- @slot:date --><!-- @/slot -->
<!-- @slot:author --><!-- @/slot -->

Circle fills, check draws, label strikes, a small burst, then the row quietly steps back. Click the row to play; click again to reset.

<!-- ─── comparison (easing options) ─── -->
<!-- @use comparison variant=options -->

<!-- @slot:optionTitle -->Easing<!-- @/slot -->

<!-- @slot:optionContext -->
Swaps \`--ease\` across every transition so you can feel the difference.
<!-- @/slot -->

<!-- @slot:optionItems -->
Linear — \`linear\`
Ease-out — \`cubic-bezier(.16, 1, .3, 1)\`
Spring — \`cubic-bezier(.34, 1.56, .64, 1)\`
<!-- @/slot -->

<!-- ─── design-spec (keyframes timeline) ─── -->
<!-- @use design-spec variant=keyframe -->

<!-- @slot:keyframeTitle -->Keyframes<!-- @/slot -->
<!-- @slot:keyframes -->fill|0ms|0;check|80ms|13;strike|120ms|20;confetti|200ms|33;collapse|600ms|100<!-- @/slot -->

<!-- ─── panel (CSS snippet) ─── -->
<!-- @use panel variant=snippet -->

### Copy-paste CSS

\`\`\`css
/* circle: clay flash, settle to olive with spring overshoot */
.task.done .check {
  animation: settle 380ms cubic-bezier(.34,1.56,.64,1) forwards;
}
@keyframes settle {
  0%   { transform: scale(.8);  background: #D97757; }
  55%  { transform: scale(1.18); }
  100% { transform: scale(1);   background: #788C5D; }
}

/* checkmark draws via stroke-dashoffset, 80ms delay */
.check path        { stroke-dasharray: 20; stroke-dashoffset: 20;
                     transition: stroke-dashoffset 220ms var(--ease) 80ms; }
.task.done path    { stroke-dashoffset: 0; }

/* strikethrough grows left → right */
.label::after      { width: 0; transition: width 240ms var(--ease) 120ms; }
.task.done .label::after { width: 100%; }

/* row steps back after the celebration */
.task.done         { max-height: 44px; opacity: .6;
                     transition-delay: 600ms; }
\`\`\`

<!-- ─── footer ─── -->
<!-- @slot:footer -->Birchline · Prototype<!-- @/slot -->
`,
    missingComponents: ['animation-stage'],
  }),

  makeTemplate({
    id: 'he-08-interaction-spec',
    name: '交互原型',
    description: '拖拽排序原型：侧边栏列表 + 设计注解 + 待决问题',
    emoji: '🖱️',
    icon: 'ClipboardList',
    color: 'var(--color-clay-100)',
    group: 'plan',
    componentIds: ['header', 'drag-list-item', 'illustration', 'callout', 'footer'],
    docTitle: 'Birchline · Sidebar drag-to-reorder',
    starterMarkdown: `<!-- @page wide -->
<!-- @compose: header, drag-list-item, illustration, callout, footer -->
<!-- @theme editorial -->

<!-- ─── header ─── -->
<!-- @use header -->

# Sidebar drag-to-reorder

## Throwaway HTML so we can *feel* the reorder before porting it to React

<!-- @slot:eyebrow -->Birchline / prototype / interaction<!-- @/slot -->
<!-- @slot:date --><!-- @/slot -->
<!-- @slot:author --><!-- @/slot -->

Native \`dragstart / dragover / drop\`, ~40 lines of JS, no libraries. Grab a row by the dots and move it.

<!-- ─── drag-list-item ─── -->
<!-- @use drag-list-item -->

<!-- @slot:itemLabel -->Inbox<!-- @/slot -->
<!-- @slot:itemCount -->14<!-- @/slot -->

<!-- @use drag-list-item -->

<!-- @slot:itemLabel -->Today<!-- @/slot -->
<!-- @slot:itemCount -->3<!-- @/slot -->

<!-- @use drag-list-item -->

<!-- @slot:itemLabel -->Upcoming<!-- @/slot -->
<!-- @slot:itemCount -->21<!-- @/slot -->

<!-- @use drag-list-item -->

<!-- @slot:itemLabel -->Projects<!-- @/slot -->
<!-- @slot:itemCount -->8<!-- @/slot -->

<!-- @use drag-list-item -->

<!-- @slot:itemLabel -->Archive<!-- @/slot -->
<!-- @slot:itemCount --><!-- @/slot -->

<!-- @use drag-list-item -->

<!-- @slot:itemLabel -->Trash<!-- @/slot -->
<!-- @slot:itemCount --><!-- @/slot -->

Order persists in the DOM only — refresh to reset.

<!-- ─── illustration (design notes) ─── -->
<!-- @use illustration variant=notes -->

<!-- @slot:notesTitle -->What you're feeling<!-- @/slot -->
<!-- @slot:notesLeade -->Design decisions baked into this prototype, so you can push back on them.<!-- @/slot -->
<!-- @slot:notesBody -->
- **Drop indicator snaps to the nearest gap**, not the raw cursor Y. It only moves when you cross a row's midpoint — feels more decisive, less jittery.
- **Dragged row stays in place at 35% opacity** with a 2° tilt. Keeping the ghost in the list preserves your sense of where you started; the tilt reads as "lifted."
- **Grip dots are the affordance, but the whole row is draggable.** Dots darken on hover to teach the gesture without forcing a tiny hit target.
- **No auto-scroll, no drop animation.** Left out on purpose so the core feel is easy to judge — say the word and we add them next.
<!-- @/slot -->

<!-- ─── callout (open questions) ─── -->
<!-- @use callout variant=questions -->

### Open questions

1. Should **Trash** (and maybe **Archive**) be pinned to the bottom and excluded from reordering?
2. Do we want rows to **slide** to their new slot on drop, or is the instant snap acceptable?
3. Keyboard path: is \`Alt + Arrow\` to move the focused row enough for the first ship?

<!-- ─── footer ─── -->
<!-- @slot:footer -->Birchline · Prototype<!-- @/slot -->
`,
  }),

  makeTemplate({
    id: 'he-13-flowchart',
    name: '流程图带注解',
    description: '可交互流程图：SVG 画布 + 节点详情面板 + 图例',
    emoji: '📈',
    icon: 'ClipboardList',
    color: '#E0E7FF',
    group: 'plan',
    componentIds: ['header', 'illustration', 'chip', 'panel', 'footer'],
    docTitle: 'Deploy pipeline — annotated flowchart',
    starterMarkdown: `<!-- @page wide -->
<!-- @compose: header, illustration, chip, panel, footer -->
<!-- @theme editorial -->

<!-- ─── header ─── -->
<!-- @use header -->

# What happens when you \`git push\`

## The deploy pipeline for \`birchline/web\`, drawn from \`.github/workflows/\` and the Argo manifests

<!-- @slot:eyebrow -->Illustrations & Diagrams · Flowchart<!-- @/slot -->
<!-- @slot:date --><!-- @/slot -->
<!-- @slot:author --><!-- @/slot -->

Click any step to see what runs, how long it usually takes, and where it can short-circuit.

<!-- ─── illustration (flowchart frame) ─── -->
<!-- @use illustration variant=frame -->

<!-- @slot:frameTitle -->Deploy Pipeline<!-- @/slot -->
<!-- @slot:frameSub -->git push main → CI → Tests → Build → Canary → Promote → Smoke → Done<!-- @/slot -->
<!-- @slot:frameSvg -->
<svg xmlns="http://www.w3.org/2000/svg" width="620" height="920" viewBox="0 0 620 920">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#87867F"/>
    </marker>
    <marker id="arrow-rust" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#B04A3F"/>
    </marker>
    <marker id="arrow-olive" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#788C5D"/>
    </marker>
  </defs>
  <!-- edges -->
  <path stroke="#87867F" stroke-width="1.5" fill="none" marker-end="url(#arrow)" d="M310,56 L310,92"/>
  <path stroke="#87867F" stroke-width="1.5" fill="none" marker-end="url(#arrow)" d="M310,140 L310,176"/>
  <path stroke="#87867F" stroke-width="1.5" fill="none" marker-end="url(#arrow)" d="M310,224 L310,262"/>
  <path stroke="#788C5D" stroke-width="1.5" fill="none" marker-end="url(#arrow-olive)" d="M310,326 L310,368"/>
  <text x="320" y="350" font-family="ui-monospace, monospace" font-size="10" fill="#87867F">pass</text>
  <path stroke="#B04A3F" stroke-width="1.5" fill="none" stroke-dasharray="4 4" marker-end="url(#arrow-rust)" d="M268,294 C190,294 150,294 150,212 L150,212"/>
  <text x="138" y="260" font-family="ui-monospace, monospace" font-size="10" fill="#B04A3F">fail → status</text>
  <path stroke="#87867F" stroke-width="1.5" fill="none" marker-end="url(#arrow)" d="M310,416 L310,452"/>
  <path stroke="#87867F" stroke-width="1.5" fill="none" marker-end="url(#arrow)" d="M310,500 L310,538"/>
  <path stroke="#788C5D" stroke-width="1.5" fill="none" marker-end="url(#arrow-olive)" d="M310,602 L310,644"/>
  <text x="320" y="626" font-family="ui-monospace, monospace" font-size="10" fill="#87867F">healthy</text>
  <path stroke="#B04A3F" stroke-width="1.5" fill="none" stroke-dasharray="4 4" marker-end="url(#arrow-rust)" d="M352,570 C470,570 470,690 392,720"/>
  <text x="448" y="636" font-family="ui-monospace, monospace" font-size="10" fill="#B04A3F">canary fails</text>
  <path stroke="#87867F" stroke-width="1.5" fill="none" marker-end="url(#arrow)" d="M310,692 L310,730"/>
  <path stroke="#87867F" stroke-width="1.5" fill="none" marker-end="url(#arrow)" d="M310,778 L310,816"/>
  <!-- nodes -->
  <g><rect x="230" y="12" width="160" height="44" fill="#fff" stroke="#D1CFC5" stroke-width="1.5" rx="22"/><text x="310" y="38" text-anchor="middle" font-family="ui-monospace, monospace" font-size="12" fill="#141413">git push main</text></g>
  <g><rect x="210" y="92" width="200" height="48" fill="#fff" stroke="#D1CFC5" stroke-width="1.5" rx="8"/><text x="310" y="112" text-anchor="middle" font-family="ui-monospace, monospace" font-size="12" fill="#141413">CI · lint + typecheck</text><text x="310" y="128" text-anchor="middle" font-family="ui-monospace, monospace" font-size="10" fill="#87867F">~2 min · ci.yml</text></g>
  <g><rect x="210" y="176" width="200" height="48" fill="#fff" stroke="#D1CFC5" stroke-width="1.5" rx="8"/><text x="310" y="196" text-anchor="middle" font-family="ui-monospace, monospace" font-size="12" fill="#141413">Unit + integration tests</text><text x="310" y="212" text-anchor="middle" font-family="ui-monospace, monospace" font-size="10" fill="#87867F">~6 min · 3 shards</text></g>
  <g><path d="M310,262 L352,294 L310,326 L268,294 Z" fill="#fff" stroke="#D1CFC5" stroke-width="1.5"/><text x="310" y="298" text-anchor="middle" font-family="ui-monospace, monospace" font-size="12" fill="#141413">pass?</text></g>
  <g><rect x="60" y="176" width="180" height="48" fill="rgba(176,74,63,0.10)" stroke="#B04A3F" stroke-width="1.5" rx="8"/><text x="150" y="196" text-anchor="middle" font-family="ui-monospace, monospace" font-size="12" fill="#141413">Post failure status</text><text x="150" y="212" text-anchor="middle" font-family="ui-monospace, monospace" font-size="10" fill="#87867F">slack #deploys</text></g>
  <g><rect x="210" y="368" width="200" height="48" fill="#fff" stroke="#D1CFC5" stroke-width="1.5" rx="8"/><text x="310" y="388" text-anchor="middle" font-family="ui-monospace, monospace" font-size="12" fill="#141413">Build + push image</text><text x="310" y="404" text-anchor="middle" font-family="ui-monospace, monospace" font-size="10" fill="#87867F">ghcr.io/birchline/web</text></g>
  <g><rect x="210" y="452" width="200" height="48" fill="#fff" stroke="#D1CFC5" stroke-width="1.5" rx="8"/><text x="310" y="472" text-anchor="middle" font-family="ui-monospace, monospace" font-size="12" fill="#141413">Argo canary 5%</text><text x="310" y="488" text-anchor="middle" font-family="ui-monospace, monospace" font-size="10" fill="#87867F">10 min soak</text></g>
  <g><path d="M310,538 L352,570 L310,602 L268,570 Z" fill="#fff" stroke="#D1CFC5" stroke-width="1.5"/><text x="310" y="574" text-anchor="middle" font-family="ui-monospace, monospace" font-size="12" fill="#141413">SLO ok?</text></g>
  <g><rect x="210" y="644" width="200" height="48" fill="#fff" stroke="#D1CFC5" stroke-width="1.5" rx="8"/><text x="310" y="664" text-anchor="middle" font-family="ui-monospace, monospace" font-size="12" fill="#141413">Promote 25 → 50 → 100%</text><text x="310" y="680" text-anchor="middle" font-family="ui-monospace, monospace" font-size="10" fill="#87867F">~8 min</text></g>
  <g><rect x="392" y="700" width="170" height="48" fill="rgba(176,74,63,0.10)" stroke="#B04A3F" stroke-width="1.5" rx="8"/><text x="477" y="720" text-anchor="middle" font-family="ui-monospace, monospace" font-size="12" fill="#141413">Auto-rollback</text><text x="477" y="736" text-anchor="middle" font-family="ui-monospace, monospace" font-size="10" fill="#87867F">revert image tag</text></g>
  <g><rect x="210" y="730" width="200" height="48" fill="#fff" stroke="#D1CFC5" stroke-width="1.5" rx="8"/><text x="310" y="750" text-anchor="middle" font-family="ui-monospace, monospace" font-size="12" fill="#141413">Smoke tests in prod</text><text x="310" y="766" text-anchor="middle" font-family="ui-monospace, monospace" font-size="10" fill="#87867F">playwright · 90s</text></g>
  <g><rect x="230" y="816" width="160" height="44" fill="rgba(120,140,93,0.12)" stroke="#788C5D" stroke-width="1.5" rx="22"/><text x="310" y="843" text-anchor="middle" font-family="ui-monospace, monospace" font-size="12" fill="#141413">✅ Deploy complete</text></g>
</svg>
<!-- @/slot -->

<!-- ─── chip (legend) ─── -->
<!-- @use chip variant=legend -->

<!-- @slot:legendItems -->
step|process step
gate|decision
ok|terminal success
bad|failure path
<!-- @/slot -->

<!-- ─── panel (step detail) ─── -->
<!-- @use panel variant=glossary -->

### Step details

<!-- @slot:panelData -->
git push main|trigger · 0s — A push or merge to main fires the deploy workflow. Pushes to other branches stop after CI and never reach the image build.
CI · lint + typecheck|github actions · ~2 min — Runs ESLint and tsc --noEmit in parallel. This is the only job that also runs on pull-request branches, so it stays fast on purpose.
Unit + integration tests|github actions · ~6 min · 3 shards — Vitest unit suite plus the API integration tests against an ephemeral Postgres. Sharded three ways; the slowest shard gates the pipeline.
Tests pass?|decision — Any shard failing short-circuits here. Nothing is built, and a red status is posted back to the PR and to #deploys.
Build + push image|github actions · ~4 min — Docker buildx with layer caching. Tags the image with the short SHA and pushes to GHCR. This is the first step that produces an artifact.
Argo canary 5%|argo rollouts · 10 min soak — Argo shifts 5% of traffic to the new ReplicaSet and watches the error-rate and p95 SLOs for ten minutes before deciding.
Canary healthy?|decision · analysis template — The slo-check analysis compares error rate and p95 against the previous revision. Either metric breaching for two consecutive intervals fails the gate.
Promote 25 → 50 → 100%|argo rollouts · ~8 min — Three more weight steps with a short pause between each. The same analysis runs at every step, so a late regression still aborts.
Auto-rollback|argo rollouts · ~30s — On a failed analysis Argo flips traffic back to the stable ReplicaSet and marks the rollout Degraded. A page goes to the on-call.
Smoke tests in prod|github actions · ~90s — A tiny Playwright suite hits the public URL: load the homepage, sign in with a synthetic account, create and delete one record.
Deploy complete|terminal · ~30 min total — Commit status flips to success, the rollout is marked Healthy, and the SHA is recorded as the new stable revision.
<!-- @/slot -->

<!-- ─── footer ─── -->
<!-- @slot:footer -->Birchline · Deploy Pipeline<!-- @/slot -->
`,
    missingComponents: ['flowchart-canvas'],
  }),

  makeTemplate({
    id: 'he-16-impl-plan',
    name: '实施计划',
    description: '完整实施计划：指标摘要 + 里程碑时间线 + 数据流图 + 原型对比 + 代码 + 风险表 + 待决问题',
    emoji: '📋',
    icon: 'ClipboardList',
    color: '#E0E7FF',
    group: 'plan',
    componentIds: ['header', 'metric', 'timeline', 'comparison', 'panel', 'table', 'callout', 'footer'],
    docTitle: 'Implementation plan — Comment threads on task cards',
    starterMarkdown: `<!-- @page xwide -->
<!-- @compose: header, metric, timeline, comparison, panel, table, callout, footer -->
<!-- @theme editorial -->

<!-- ─── header ─── -->
<!-- @use header -->

# Comment threads on task cards

## Create a thorough implementation plan for adding threaded comments to task cards

<!-- @slot:eyebrow -->Implementation plan · Birchline web client<!-- @/slot -->
<!-- @slot:date --><!-- @/slot -->
<!-- @slot:author --><!-- @/slot -->

Include mockups, the data flow from client to persistence, the key code I'll need to write, and a risk table. Make it easy to skim on a phone — I'm going to pass this to the implementer as-is.

<!-- ─── metric (summary strip) ─── -->
<!-- @use metric variant=band -->

<!-- @slot:metricValue -->
~2 weeks
3 packages
2
task_comments_v1
<!-- @/slot -->

<!-- @slot:metricLabel -->
Effort
Surfaces touched
New tables
Feature flag
<!-- @/slot -->

<!-- @slot:metricDelta -->




<!-- @/slot -->

<!-- ─── timeline (milestones) ─── -->
<!-- @use timeline variant=milestones -->

<!-- @slot:heading -->Milestones<!-- @/slot -->

Ship in four slices, each independently reviewable and each behind the flag. Nothing is user-visible until slice 4.

## Week 1 · Mon–Tue — Schema & API contract

New \`comments\` and \`comment_reads\` tables, migrations, and the tRPC router stubs. No UI. Contract reviewed before anything else lands.

\`packages/db\` · \`packages/api\` · \`migration 0042\`

## Week 1 · Wed–Fri — Thread component & composer

Static \`<CommentThread>\` rendered from fixtures. Optimistic insert on submit, rollback on failure, one level of nesting only.

\`apps/web\` · \`storybook\`

## Week 2 · Mon–Wed — Realtime fan-out & unread state

Subscribe the open card to its comment channel. Track per-user read cursors so the sidebar can show an unread count without a second query.

\`packages/realtime\` · \`apps/web\`

## Week 2 · Thu–Fri — Notifications, flag ramp, docs

Mention detection → notification row, email digest fallback, ramp \`task_comments_v1\` to internal, then 10% → 100% over three days.

\`packages/notify\` · \`growthbook\`

<!-- ─── comparison (mockups) ─── -->
<!-- @use comparison variant=mockup -->

<!-- @slot:mockupLabel -->A · Thread inside an open task card<!-- @/slot -->

<!-- @slot:mockupPreview -->
**Ship onboarding empty-state rewrite**

BIR-1142 · Assigned to Priya · Due Fri

---

**JM** · Jonah M. · 2h ago

Should the illustration swap when the workspace already has one project? Feels odd to show the "start here" art twice.

[Reply]

**PS** · Priya S. · 40m ago

Good catch — I'll gate it on \`projects.count > 0\` and fall back to the minimal variant.

[Add a comment…] [Post]
<!-- @/slot -->

<!-- @slot:mockupRationale -->
Not pixel-final — just enough that the reviewer and I agree on nesting depth, composer placement, and what the sidebar digest looks like.
<!-- @/slot -->

---

<!-- @use comparison variant=mockup -->

<!-- @slot:mockupLabel -->B · Sidebar unread digest<!-- @/slot -->

<!-- @slot:mockupPreview -->
**Jonah** commented on BIR-1142 — "Should the illustration swap when…"

**Aiko** mentioned you on BIR-1098 — "@priya can you confirm the copy here?"

**Rowan** replied on BIR-0971 — "Merged, thanks for the quick turnaround."
<!-- @/slot -->

<!-- @slot:mockupRationale -->
Unread rows get a clay left border; read rows stay neutral.
<!-- @/slot -->

<!-- ─── panel (key code) ─── -->
<!-- @use panel variant=snippet -->

### Key code — packages/db/migrations/0042_comments.sql

\`\`\`sql
create table comments (
  id          uuid primary key default gen_random_uuid(),
  task_id     uuid not null references tasks(id),
  parent_id   uuid references comments(id),   -- one level only,
                                                -- enforced in API
  author_id   uuid not null references users(id),
  body        text not null,
  created_at  timestamptz not null default now(),
  deleted_at  timestamptz                       -- soft delete
);

create table comment_reads (
  task_id    uuid not null references tasks(id),
  user_id    uuid not null references users(id),
  read_up_to timestamptz not null,
  primary key (task_id, user_id)
);

create index comments_task_created
  on comments (task_id, created_at);
\`\`\`

---

<!-- @use panel variant=snippet -->

<!-- @slot:panelTitle -->Key code — apps/web/hooks/useAddComment.ts<!-- @/slot -->

<!-- @slot:panelBody -->
\`\`\`typescript
export function useAddComment(taskId: string) {
  const qc = useQueryClient();
  return trpc.comments.create.useMutation({
    onMutate: async (input) => {
      const temp = { ...input, id: \`temp-\${nanoid()}\`,
                     createdAt: new Date(), pending: true };
      qc.setQueryData(key(taskId), (prev) =>
        [...(prev ?? []), temp]);
      return { tempId: temp.id };
    },
    onSuccess: (row, _v, ctx) => {
      // reconcile temp id → real id so the
      // realtime append doesn't duplicate it
      qc.setQueryData(key(taskId), (prev) =>
        prev.map((c) => c.id === ctx.tempId ? row : c));
    },
    onError: (_e, _v, ctx) => {
      qc.setQueryData(key(taskId), (prev) =>
        prev.filter((c) => c.id !== ctx.tempId));
    },
  });
}
\`\`\`
<!-- @/slot -->

<!-- ─── table (risks) ─── -->
<!-- @use table variant=risk -->

### Risks & mitigations

<!-- @slot:tableData -->
Realtime duplicate: socket append races with the HTTP response and the temp-id reconcile|HIGH|Dedupe on server-assigned id in the cache updater; socket payload carries the real id, temp rows are filtered on reconcile
Unread counts go stale when a user reads the thread on another device|MED|Broadcast comment_reads upserts on the same channel; client treats its own cursor as max(local, remote)
Mention detection false-positives on pasted markdown (@media, @2x)|LOW|Resolve mentions against workspace members only, at write time, and store the resolved user ids — never re-parse on read
<!-- @/slot -->

<!-- ─── callout (open questions) ─── -->
<!-- @use callout variant=recommendation -->

### Open questions

<!-- @slot:calloutBody -->
**Do we allow editing, or only delete-and-repost?**

Editing needs an \`edited_at\` column and an "edited" affordance. Delete-and-repost is simpler but loses the reply anchor. Leaning toward delete-only for v1.

*Decide with · design, before slice 2*

---

**Email digest cadence when a user has the app closed**

Immediate-per-mention will be noisy. Proposal: batch on a 15-minute window, collapse to one email per task, and respect quiet hours from the existing settings table.

*Decide with · platform, before slice 4*
<!-- @/slot -->

<!-- ─── footer ─── -->
<!-- @slot:footer -->Birchline · Implementation Plan<!-- @/slot -->
`,
    missingComponents: ['data-flow-diagram'],
  }),
];
