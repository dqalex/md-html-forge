// Batch A: report 系 (11, 12, 19)

import { makeTemplate } from '../make-template';

export const BATCH_A_TEMPLATES = [
  makeTemplate({
    id: 'he-11-status-report',
    name: '工程周报',
    description: '4 列指标带 + 亮点列表 + 交付表格 + 速度图表 + 结转清单',
    emoji: '📊',
    icon: 'BarChart3',
    color: 'var(--color-clay-100)',
    group: 'report',
    componentIds: ['header', 'metric', 'highlights', 'table', 'actions', 'footer'],
    docTitle: 'Birchline · Engineering Status · Week 11',
    starterMarkdown: `<!-- @page narrow -->
<!-- @compose: header, metric, highlights, table, actions, footer -->
<!-- @theme editorial -->

<!-- ─── header ─── -->
<!-- @use header -->

# Engineering Status — Week 11

## birchline/app @ main

<!-- @slot:eyebrow -->auto-generated<!-- @/slot -->
<!-- @slot:date -->Mar 10 – Mar 16, 2025<!-- @/slot -->


<!-- ─── metric (4 列指标带) ─── -->
<!-- @use metric variant=band -->

<!-- @slot:metricValue -->
14
6
1
3
<!-- @/slot -->

<!-- @slot:metricLabel -->
PRs merged
Deploys
Incidents
Flaky tests fixed
<!-- @/slot -->

<!-- @slot:metricDelta -->
+3 vs wk10
±0
SEV-2 · 47m
suite now 99.1%
<!-- @/slot -->


<!-- ─── highlights ─── -->
<!-- @use highlights -->

<!-- @slot:heading -->Highlights<!-- @/slot -->

- **Bulk task editing shipped to 100%.** The multi-select toolbar landed behind a flag on Monday and ramped to all workspaces by Thursday with no error-rate regression.
- **Sync API p95 down 38%.** Replacing per-task auth checks with a scoped batch lookup cut the hot path from 410ms to 255ms on the staging load test.
- **One SEV-2 on Wednesday** — a config rollout pushed a bad connection-pool limit to the sync workers. Mitigated in 47 minutes; full postmortem linked below.


<!-- ─── table (交付表) ─── -->
<!-- @use table variant=standard -->

<!-- @slot:heading -->Shipped<!-- @/slot -->

| PR | Title | Author | Risk |
|---|---|---|---|
| #4871 | Bulk edit toolbar: selection model + keyboard shortcuts | Mira Okafor | Med |
| #4874 | Batch auth lookup for /v2/sync hot path | Devon Park | Med |
| #4878 | Fix race in attachment uploader retry loop | Sam Reyes | Low |
| #4879 | Migrate reminder scheduler to idempotent job keys | Priya Anand | High |
| #4882 | Board view: collapse empty swimlanes by default | Mira Okafor | Low |
| #4885 | Quarantine 3 flaky webhook integration tests | Jules Tan | Low |
| #4888 | Connection pool limits configurable per worker tier | Devon Park | Med |
| #4891 | Dark mode pass on settings & billing panels | Noor Halabi | Low |


<!-- ─── actions (结转清单) ─── -->
<!-- @use actions -->

<!-- @slot:heading -->Carryover<!-- @/slot -->

- [ ] **In review** — Workspace export to CSV — waiting on pagination review. · Sam Reyes
- [ ] **Blocked** — SSO group mapping — blocked on staging IdP credentials from IT. · Priya Anand
- [ ] **Slipped** — Mobile push reliability dashboard — deprioritized for incident follow-up. · Devon Park


<!-- ─── footer ─── -->
<!-- @use footer -->

<!-- @slot:footer -->
Sources: git log main..HEAD · CI dashboard · deploy log — generated Mar 16 2025 18:02
<!-- @/slot -->
`,
    missingComponents: ['chart-bar'],
  }),

  makeTemplate({
    id: 'he-12-incident-report',
    name: '事故复盘',
    description: '事件 ID + 状态 pill + TL;DR + 时间线 + 根因 + 影响表 + 行动清单',
    emoji: '🚨',
    icon: 'Flame',
    color: '#FED7AA',
    group: 'report',
    componentIds: ['header', 'meta-pills', 'lead', 'timeline', 'code-block', 'table', 'checklist', 'footer'],
    docTitle: 'INC-2025-0412 · Elevated 502s on task sync',
    starterMarkdown: `<!-- @page narrow -->
<!-- @compose: header, meta-pills, lead, timeline, code-block, table, checklist, footer -->
<!-- @theme editorial -->

<!-- ─── header ─── -->
<!-- @use header -->

# Elevated 502s on task sync

## INC-2025-0412

<!-- @slot:eyebrow -->INC-2025-0412<!-- @/slot -->


<!-- ─── meta-pills ─── -->
<!-- @use meta-pills -->

<!-- @slot:pills -->
SEV-2|sev
Resolved|resolved
Duration 47 min|neutral
Detected Apr 12 · 14:07|neutral
Owner Devon Park|neutral
<!-- @/slot -->


<!-- ─── lead (TL;DR) ─── -->
<!-- @use lead variant=tldr -->

<!-- @slot:tldr -->
A config rollout lowered the database connection-pool limit on the \`sync-worker\` tier from 64 to 8, exhausting connections under normal afternoon load. The sync API returned 502s for roughly 21% of requests over 47 minutes. We mitigated by reverting the config and cycling the worker fleet; no data was lost.
<!-- @/slot -->


<!-- ─── timeline ─── -->
<!-- @use timeline variant=incident -->

<!-- @slot:heading -->Timeline<!-- @/slot -->

14:02 — Config change \`cfg-9a12\` promoted to production via the standard rollout pipeline.
14:06 — **Impact starts.** Sync workers begin queueing on pool checkout; p95 latency climbs past 4s and the load balancer starts returning 502s.
14:07 — Alert fires: \`sync_5xx_rate > 2%\` for 60s. On-call (Devon) acknowledges.
14:18 — Initial hypothesis is a bad deploy of the API service; last two application deploys are rolled back with no effect.
14:31 — Mira joins and notices pool-wait saturation in the worker dashboard. Investigation pivots to infra config rather than app code.
14:44 — **Mitigated.** \`cfg-9a12\` reverted; worker fleet cycled. 5xx rate drops below 0.2% within three minutes.
14:49 — Monitors green for 5 minutes. Incident declared resolved; status page updated.


<!-- ─── code-block (根因 diff) ─── -->
<!-- @use code-block variant=diff -->

<!-- @slot:diffContent -->
\`\`\`diff
   pool:
     global_max_connections: 64
     tiers:
-      sync-worker: { max_connections: 64 }
+      sync-worker: { max_connections: 8 }   # debug value, do not ship
       webhook-worker: { max_connections: 32 }
\`\`\`
<!-- @/slot -->


<!-- ─── lead (根因说明) ─── -->
<!-- @use lead variant=lead -->

> **Root cause (\`infra/config/workers.yaml\`).** PR #4888 made connection-pool limits configurable per worker tier. The default for the new \`sync-worker\` key was meant to inherit the global value (64) but was hard-coded to 8 during a local test and committed. The config linter only validates type, not magnitude, so the change passed CI. Because config rollouts and code deploys go through separate pipelines, the on-call's first instinct — rolling back the most recent application deploys — had no effect and cost roughly 13 minutes of diagnosis time.


<!-- ─── table (影响表) ─── -->
<!-- @use table variant=impact -->

<!-- @slot:heading -->Impact<!-- @/slot -->
<!-- @slot:tableData -->
Metric|Value
Requests failed (502)|~41,200
Peak error rate|21.4%
Users affected|~2,300 workspaces
Data loss|None — clients retried
SLA breach|No (within monthly budget)
<!-- @/slot -->


<!-- ─── checklist (行动项) ─── -->
<!-- @use checklist -->

<!-- @slot:heading -->Action items<!-- @/slot -->

- [x] Revert cfg-9a12 and restore pool limit to 64 — Devon Park — Apr 12
- [ ] Add config-linter range check for \`max_connections\` (warn < 32) — Mira Okafor — Apr 18
- [ ] Surface "recent config rollouts" alongside deploys in the on-call dashboard — Sam Reyes — Apr 25
- [ ] Canary config changes to one worker AZ for 10 min before fleet-wide promote — Priya Anand — May 02


<!-- ─── footer ─── -->
<!-- @use footer -->

<!-- @slot:footer -->
Authored from on-call notes + alert history · reviewed by Devon Park, Mira Okafor
<!-- @/slot -->
`,
    missingComponents: ['toc-nav'],
  }),

  makeTemplate({
    id: 'he-19-editor-feature-flags',
    name: '功能开关清单',
    description: '分组功能开关表格 + 依赖警告 + 变更 diff 面板',
    emoji: '🚩',
    icon: 'LineChart',
    color: '#DBEAFE',
    group: 'report',
    componentIds: ['header', 'callout', 'table', 'panel', 'actions', 'footer'],
    docTitle: 'Birchline · flags.production.json',
    starterMarkdown: `<!-- @page wide -->
<!-- @compose: header, callout, table, panel, actions, footer -->
<!-- @theme editorial -->

<!-- ─── header ─── -->
<!-- @use header -->

# flags.production.json

## Birchline / editor / feature-flags

<!-- @slot:eyebrow -->Birchline / editor / feature-flags<!-- @/slot -->
<!-- @slot:subtitle -->A form-based editor for the production feature-flag config. Toggle flags, fix dependency warnings as they surface, then copy out only the lines that changed.<!-- @/slot -->


<!-- ─── callout (警告横幅) ─── -->
<!-- @use callout variant=warning -->

⚠ 1 flag is enabled without its prerequisite


<!-- ─── table (Onboarding) ─── -->
<!-- @use table variant=flag -->

<!-- @slot:heading -->Onboarding · 4 flags, 2 on<!-- @/slot -->
<!-- @slot:tableData -->
Flag|Status|Description|Requires
onboarding.checklist_v2|✅ On|New three-step setup checklist replacing the modal tour.|—
onboarding.invite_nudge|✅ On|Nudge owners to invite teammates after creating their first project.|—
onboarding.workspace_templates|⬜ Off|Offer prebuilt workspace templates during signup.|onboarding.checklist_v2
onboarding.skip_email_verify|⬜ Off|Let SSO-domain users in before email verification completes.|—
<!-- @/slot -->


<!-- ─── table (Sync engine) ─── -->
<!-- @use table variant=flag -->

<!-- @slot:heading -->Sync engine · 5 flags, 2 on<!-- @/slot -->
<!-- @slot:tableData -->
Flag|Status|Description|Requires
sync.delta_compression|✅ On|Send field-level deltas instead of full document snapshots.|—
sync.offline_queue_v2|⬜ Off|Persist offline edits to IndexedDB and replay on reconnect.|sync.delta_compression
sync.presence_cursors|✅ On|Show live collaborator cursors in board and doc views.|—
sync.conflict_banner|⬜ Off|Surface a merge banner instead of silently last-write-wins.|sync.offline_queue_v2
sync.binary_ws_frames|⬜ Off 10%|Switch the realtime channel to binary WebSocket frames.|—
<!-- @/slot -->


<!-- ─── table (Billing) ─── -->
<!-- @use table variant=flag -->

<!-- @slot:heading -->Billing · 4 flags, 2 on<!-- @/slot -->
<!-- @slot:tableData -->
Flag|Status|Description|Requires
billing.usage_meter|⬜ Off|Show per-seat usage meter on the workspace billing page.|—
billing.annual_discount_banner|✅ On|Promote the annual-plan discount in the upgrade flow.|—
billing.proration_preview|⬜ Off|Preview the prorated charge before confirming a plan change.|billing.usage_meter
billing.dunning_emails_v3|✅ On 25%|Use the rewritten dunning sequence with a 14-day grace window.|—
<!-- @/slot -->


<!-- ─── table (Internal) ─── -->
<!-- @use table variant=flag -->

<!-- @slot:heading -->Internal · 3 flags, 2 on<!-- @/slot -->
<!-- @slot:tableData -->
Flag|Status|Description|Requires
internal.shadow_traffic|⬜ Off|Mirror 1% of API traffic to the staging cluster for diffing.|—
internal.query_tracing|✅ On|Attach OpenTelemetry spans to every Postgres query.|—
internal.kill_switch_ui|✅ On|Expose the emergency kill-switch panel in the admin console.|internal.query_tracing
<!-- @/slot -->


<!-- ─── panel (diff 面板) ─── -->
<!-- @use panel variant=snippet -->

<!-- @slot:panelTitle -->Pending changes · 0 changed · 0 warnings<!-- @/slot -->

\`\`\`
// no changes yet
\`\`\`


<!-- ─── actions ─── -->
<!-- @use actions -->

- [ ] Copy diff
- [ ] Copy full JSON
- [ ] Reset


<!-- ─── footer ─── -->
<!-- @use footer -->

<!-- @slot:footer -->
Birchline · Editor · Feature Flags
<!-- @/slot -->
`,
    missingComponents: ['toggle-switch', 'flag-group'],
  }),
];
