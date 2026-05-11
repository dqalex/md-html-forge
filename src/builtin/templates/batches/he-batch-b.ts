// Batch B: code-review 系 (01, 03, 17)

import { makeTemplate } from '../make-template';

export const BATCH_B_TEMPLATES = [
  // ============================================================
  // #01 exploration-code-approaches
  // ============================================================
  makeTemplate({
    id: 'he-01-code-approaches',
    name: '代码方案探索',
    description: '三种实现方案的对比：代码示例 + 优劣表格 + 推荐结论',
    emoji: '🔬',
    icon: 'GitPullRequest',
    color: 'var(--color-clay-100)',
    group: 'code-review',
    componentIds: [
      'header',
      'panel',
      'layout-grid-3',
      'lead',
      'code-block',
      'table',
      'chip',
      'callout',
      'footer',
    ],
    docTitle: 'Three ways to implement debounced search',
    starterMarkdown: `<!-- @page wide -->
<!-- @compose: header, panel, layout-grid-3, lead, code-block, table, chip, callout, footer -->
<!-- @theme editorial -->

<!-- ─── header ─── -->
<!-- @use header -->

# Three ways to implement debounced search

<!-- @slot:eyebrow -->Exploration · Birchline web client<!-- @/slot -->

<!-- ─── prompt panel ─── -->
<!-- @use panel variant=prompt -->

<!-- @slot:panelTitle -->Prompt<!-- @/slot -->

<!-- @slot:panelBody -->
Show me three different ways to implement debounced search for the task filter input in our React codebase, with tradeoffs for each.
<!-- @/slot -->

<!-- ─── approach grid ─── -->
<!-- @use layout-grid-3 -->

<!-- @item -->
<!-- @use lead variant=phase -->

<!-- @slot:phaseNum -->01<!-- @/slot -->
<!-- @slot:phaseTitle -->Inline useEffect + setTimeout<!-- @/slot -->
<!-- @slot:phaseIntro -->Debounce logic lives directly inside the component that owns the input.<!-- @/slot -->

<!-- @use code-block variant=walkthrough -->

<!-- @slot:stepCode -->
\`\`\`tsx
export function TaskSearch() {
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setQuery(draft), 300);
    return () => clearTimeout(id);
  }, [draft]);

  const { data } = useTasks({ search: query });

  return (
    <input
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      placeholder="Filter tasks…"
    />
  );
}
\`\`\`
<!-- @/slot -->

<!-- @use table variant=standard -->

<!-- @slot:heading -->Tradeoffs<!-- @/slot -->

<!-- @slot:tableContent -->
| Pro | Con |
|---|---|
| Zero new abstractions to learn | Logic duplicated everywhere search exists |
| Easy to step through in devtools | Two pieces of state for one conceptual value |
| No dependency or bundle change | Delay constant is buried in component body |
<!-- @/slot -->

<!-- @use chip variant=risk -->

<!-- @slot:riskLabel -->Bundle impact: +0 kb<!-- @/slot -->
<!-- @slot:riskLevel -->safe<!-- @/slot -->

<!-- @use chip variant=risk -->

<!-- @slot:riskLabel -->Testability: medium<!-- @/slot -->
<!-- @slot:riskLevel -->medium<!-- @/slot -->

<!-- @use chip variant=risk -->

<!-- @slot:riskLabel -->Reuse: low<!-- @/slot -->
<!-- @slot:riskLevel -->medium<!-- @/slot -->

<!-- @use chip variant=risk -->

<!-- @slot:riskLabel -->SSR safe: yes<!-- @/slot -->
<!-- @slot:riskLevel -->safe<!-- @/slot -->

<!-- @/item -->

<!-- @item -->
<!-- @use lead variant=phase -->

<!-- @slot:phaseNum -->02<!-- @/slot -->
<!-- @slot:phaseTitle -->Custom useDebounce hook<!-- @/slot -->
<!-- @slot:phaseIntro -->Extract the timer into a shared hook under \`src/hooks/\`.<!-- @/slot -->

<!-- @use code-block variant=walkthrough -->

<!-- @slot:stepCode -->
\`\`\`tsx
// src/hooks/useDebounce.ts
export function useDebounce<T>(value: T, ms = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

// TaskSearch.tsx
const [draft, setDraft] = useState('');
const query = useDebounce(draft, 300);
const { data } = useTasks({ search: query });
\`\`\`
<!-- @/slot -->

<!-- @use table variant=standard -->

<!-- @slot:heading -->Tradeoffs<!-- @/slot -->

<!-- @slot:tableContent -->
| Pro | Con |
|---|---|
| Single import reused across filter, command bar, board search | One more file to maintain and document |
| Trivial to unit test with fake timers | Generic \`T\` hides intent slightly |
| Delay is a visible, tunable argument | Still re-renders on every keystroke |
<!-- @/slot -->

<!-- @use chip variant=risk -->

<!-- @slot:riskLabel -->Bundle impact: +0.2 kb<!-- @/slot -->
<!-- @slot:riskLevel -->safe<!-- @/slot -->

<!-- @use chip variant=risk -->

<!-- @slot:riskLabel -->Testability: high<!-- @/slot -->
<!-- @slot:riskLevel -->safe<!-- @/slot -->

<!-- @use chip variant=risk -->

<!-- @slot:riskLabel -->Reuse: high<!-- @/slot -->
<!-- @slot:riskLevel -->safe<!-- @/slot -->

<!-- @use chip variant=risk -->

<!-- @slot:riskLabel -->SSR safe: yes<!-- @/slot -->
<!-- @slot:riskLevel -->safe<!-- @/slot -->

<!-- @/item -->

<!-- @item -->
<!-- @use lead variant=phase -->

<!-- @slot:phaseNum -->03<!-- @/slot -->
<!-- @slot:phaseTitle -->Tiny external library<!-- @/slot -->
<!-- @slot:phaseIntro -->Adopt \`use-debounce\` for both values and callbacks.<!-- @/slot -->

<!-- @use code-block variant=walkthrough -->

<!-- @slot:stepCode -->
\`\`\`tsx
import { useDebouncedCallback } from 'use-debounce';

export function TaskSearch() {
  const [query, setQuery] = useState('');

  const onChange = useDebouncedCallback(
    (next: string) => setQuery(next),
    300,
    { leading: false, maxWait: 1000 },
  );

  const { data } = useTasks({ search: query });

  return (
    <input
      defaultValue=""
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
\`\`\`
<!-- @/slot -->

<!-- @use table variant=standard -->

<!-- @slot:heading -->Tradeoffs<!-- @/slot -->

<!-- @slot:tableContent -->
| Pro | Con |
|---|---|
| leading / trailing / maxWait handled for us | New runtime dependency to audit and update |
| Callback form skips intermediate re-renders | Uncontrolled input diverges from Birchline form patterns |
| Well-tested edge cases (unmount, flush, cancel) | ~1.4 kb gzipped for something we could own |
<!-- @/slot -->

<!-- @use chip variant=risk -->

<!-- @slot:riskLabel -->Bundle impact: +1.4 kb<!-- @/slot -->
<!-- @slot:riskLevel -->attention<!-- @/slot -->

<!-- @use chip variant=risk -->

<!-- @slot:riskLabel -->Testability: high<!-- @/slot -->
<!-- @slot:riskLevel -->safe<!-- @/slot -->

<!-- @use chip variant=risk -->

<!-- @slot:riskLabel -->Reuse: high<!-- @/slot -->
<!-- @slot:riskLevel -->safe<!-- @/slot -->

<!-- @use chip variant=risk -->

<!-- @slot:riskLabel -->SSR safe: yes<!-- @/slot -->
<!-- @slot:riskLevel -->safe<!-- @/slot -->

<!-- @/item -->

<!-- ─── recommendation ─── -->
<!-- @use callout variant=recommendation -->

### Recommendation

Go with **approach 02, the custom \`useDebounce\` hook**. Birchline already has three places that hand-roll the inline pattern (task filter, command palette, member picker), so extracting one shared hook removes duplication without taking on a new dependency.

Revisit approach 03 only if we later need \`maxWait\` or \`flush()\` semantics — the library earns its bundle cost once the requirements outgrow a ten-line hook.

<!-- ─── footer ─── -->
<!-- @slot:footer -->
Birchline · Engineering · 2026
<!-- @/slot -->
`,
    missingComponents: ['approach-card'],
  }),

  // ============================================================
  // #03 code-review-pr
  // ============================================================
  makeTemplate({
    id: 'he-03-pr-review',
    name: 'PR 评审摘要',
    description: 'PR 概览 + 风险地图 + 文件级 diff + 评审评论 + 待办清单',
    emoji: '🔍',
    icon: 'GitPullRequest',
    color: '#D1FAE5',
    group: 'code-review',
    componentIds: [
      'pr-summary',
      'body',
      'chip',
      'list-row',
      'code-block',
      'review-comment',
      'collapse-section',
      'checklist',
      'footer',
    ],
    docTitle: 'PR #247 — Review Summary',
    starterMarkdown: `<!-- @page narrow -->
<!-- @compose: pr-summary, body, chip, list-row, code-block, review-comment, collapse-section, checklist, footer -->
<!-- @theme editorial -->

<!-- ─── pr-summary ─── -->
<!-- @use pr-summary variant=standard -->

<!-- @slot:prRepo -->birchline/web · Pull Request #247<!-- @/slot -->
<!-- @slot:prTitle -->Add optimistic updates to task list mutations<!-- @/slot -->
<!-- @slot:prAuthor -->Mira Okafor<!-- @/slot -->
<!-- @slot:prAuthorSub -->opened 2 days ago<!-- @/slot -->
<!-- @slot:prAuthorInitials -->MO<!-- @/slot -->
<!-- @slot:prBranch -->mo/optimistic-tasks → main<!-- @/slot -->
<!-- @slot:prAdded -->+142<!-- @/slot -->
<!-- @slot:prDeleted -->−38<!-- @/slot -->
<!-- @slot:prFiles -->6 files changed<!-- @/slot -->

<!-- ─── what this pr does ─── -->
<!-- @use body -->

## What this PR does

- Replaces the await-then-refetch pattern in \`TaskList\` with optimistic cache writes, so toggling or reordering a task feels instant instead of waiting ~300ms for the round-trip.
- Introduces a small \`useOptimisticTasks\` hook that wraps the mutation, snapshots the previous list, and rolls back on error.
- Extends the API client to accept an idempotency key per mutation and adds a toast when a rollback fires.

<!-- ─── risk map ─── -->
<!-- @use chip variant=risk -->

<!-- @slot:riskLabel -->useOptimisticTasks.ts<!-- @/slot -->
<!-- @slot:riskLevel -->attention<!-- @/slot -->

<!-- @use chip variant=risk -->

<!-- @slot:riskLabel -->TaskList.tsx<!-- @/slot -->
<!-- @slot:riskLevel -->medium<!-- @/slot -->

<!-- @use chip variant=risk -->

<!-- @slot:riskLabel -->api/tasks.ts<!-- @/slot -->
<!-- @slot:riskLevel -->medium<!-- @/slot -->

<!-- @use chip variant=risk -->

<!-- @slot:riskLabel -->Toast.tsx<!-- @/slot -->
<!-- @slot:riskLevel -->safe<!-- @/slot -->

<!-- @use chip variant=risk -->

<!-- @slot:riskLabel -->types/task.ts<!-- @/slot -->
<!-- @slot:riskLevel -->safe<!-- @/slot -->

<!-- @use chip variant=risk -->

<!-- @slot:riskLabel -->TaskList.test.tsx<!-- @/slot -->
<!-- @slot:riskLevel -->safe<!-- @/slot -->

<!-- ─── file 1: useOptimisticTasks.ts ─── -->
<!-- @use list-row variant=file -->

<!-- @slot:filePath -->src/hooks/useOptimisticTasks.ts<!-- @/slot -->
<!-- @slot:fileRisk -->attention<!-- @/slot -->
<!-- @slot:fileRiskLabel -->needs attention<!-- @/slot -->
<!-- @slot:fileAdded -->+58<!-- @/slot -->
<!-- @slot:fileDeleted -->−0<!-- @/slot -->

<!-- @use code-block variant=diff -->

<!-- @slot:diffContent -->
@@ -0,0 +1,58 @@
+import { useMutation, useQueryClient } from '@tanstack/react-query';
+import { updateTask, TaskPatch } from '../api/tasks';
+import type { Task } from '../types/task';
+
+export function useOptimisticTasks(boardId: string) {
+  const qc = useQueryClient();
+  const key = ['tasks', boardId];
+
+  return useMutation({
+    mutationFn: (patch: TaskPatch) => updateTask(patch),
+    onMutate: async (patch) => {
+      const prev = qc.getQueryData<Task[]>(key);
+      qc.setQueryData<Task[]>(key, (old = []) =>
+        old.map(t => t.id === patch.id ? { ...t, ...patch } : t)
+      );
+      return { prev };
+    },
+    onError: (_e, _p, ctx) => qc.setQueryData(key, ctx?.prev),
+  });
+}
<!-- @/slot -->

<!-- @use review-comment -->

<!-- @slot:commentAnchor -->line 11<!-- @/slot -->
<!-- @slot:commentLabel -->Blocking<!-- @/slot -->
<!-- @slot:commentType -->blocking<!-- @/slot -->
<!-- @slot:commentBody -->\`onMutate\` doesn't call \`qc.cancelQueries(key)\` first. If a background refetch lands between the optimistic write and the server response, it will clobber the optimistic state and the UI will flicker back to the old value.<!-- @/slot -->

<!-- @use review-comment -->

<!-- @slot:commentAnchor -->line 18<!-- @/slot -->
<!-- @slot:commentLabel -->Nit<!-- @/slot -->
<!-- @slot:commentType -->nit<!-- @/slot -->
<!-- @slot:commentBody -->Rollback restores the list but never surfaces the error. Consider wiring the existing \`pushToast\` here so users know the toggle didn't stick.<!-- @/slot -->

<!-- ─── file 2: TaskList.tsx ─── -->
<!-- @use list-row variant=file -->

<!-- @slot:filePath -->src/components/TaskList.tsx<!-- @/slot -->
<!-- @slot:fileRisk -->medium<!-- @/slot -->
<!-- @slot:fileRiskLabel -->worth a look<!-- @/slot -->
<!-- @slot:fileAdded -->+31<!-- @/slot -->
<!-- @slot:fileDeleted -->−24<!-- @/slot -->

<!-- @use code-block variant=diff -->

<!-- @slot:diffContent -->
@@ -42,14 +42,17 @@ export function TaskList({ boardId }: Props) {
   const { data: tasks } = useTasks(boardId);
-  const [pending, setPending] = useState<string | null>(null);
-
-  async function toggle(task: Task) {
-    setPending(task.id);
-    await updateTask({ id: task.id, done: !task.done });
-    await refetch();
-    setPending(null);
-  }
+  const { mutate, isPending } = useOptimisticTasks(boardId);
+
+  const toggle = (task: Task) =>
+    mutate({ id: task.id, done: !task.done });

   return (
     <ul className="tasks">
-      {tasks?.map(t => <TaskRow key={t.id} task={t} busy={pending === t.id} />)}
+      {tasks?.map(t => <TaskRow key={t.id} task={t} onToggle={toggle} />)}
     </ul>
<!-- @/slot -->

<!-- @use review-comment -->

<!-- @slot:commentAnchor -->line 43<!-- @/slot -->
<!-- @slot:commentLabel -->Nit<!-- @/slot -->
<!-- @slot:commentType -->nit<!-- @/slot -->
<!-- @slot:commentBody -->\`isPending\` is destructured but never read. Either drop it or pass it to \`TaskRow\` so the checkbox can dim while the request is in flight.<!-- @/slot -->

<!-- ─── file 3: api/tasks.ts ─── -->
<!-- @use list-row variant=file -->

<!-- @slot:filePath -->src/api/tasks.ts<!-- @/slot -->
<!-- @slot:fileRisk -->medium<!-- @/slot -->
<!-- @slot:fileRiskLabel -->worth a look<!-- @/slot -->
<!-- @slot:fileAdded -->+19<!-- @/slot -->
<!-- @slot:fileDeleted -->−6<!-- @/slot -->

<!-- @use code-block variant=diff -->

<!-- @slot:diffContent -->
@@ -12,10 +12,15 @@ export type TaskPatch = Partial<Task> & { id: string };

-export async function updateTask(patch: TaskPatch) {
-  return http.patch(\`/tasks/\${patch.id}\`, patch);
+export async function updateTask(
+  patch: TaskPatch,
+  key = crypto.randomUUID(),
+) {
+  return http.patch(\`/tasks/\${patch.id}\`, patch, {
+    headers: { 'Idempotency-Key': key },
+  });
 }
<!-- @/slot -->

<!-- @use review-comment -->

<!-- @slot:commentAnchor -->line 15<!-- @/slot -->
<!-- @slot:commentLabel -->Blocking<!-- @/slot -->
<!-- @slot:commentType -->blocking<!-- @/slot -->
<!-- @slot:commentBody -->Generating the idempotency key as a default parameter means retries from the mutation layer get a *new* key each time, which defeats the purpose. The key should be minted once in \`onMutate\` and threaded through.<!-- @/slot -->

<!-- ─── collapsed files ─── -->
<!-- @use collapse-section -->

<!-- @slot:sectionTitle -->src/components/Toast.tsx<!-- @/slot -->
<!-- @slot:sectionWhere --><span class="add">+14</span> <span class="del">−2</span><!-- @/slot -->
<!-- @slot:sectionBody -->Adds a \`variant="warning"\` style and exports \`pushToast\`. Purely additive, no behaviour change for existing call sites.<!-- @/slot -->

<!-- @use collapse-section -->

<!-- @slot:sectionTitle -->src/types/task.ts<!-- @/slot -->
<!-- @slot:sectionWhere --><span class="add">+6</span> <span class="del">−2</span><!-- @/slot -->
<!-- @slot:sectionBody -->Widens \`Task.status\` to include \`"archived"\` and adds an optional \`updatedAt\` timestamp. Type-only change.<!-- @/slot -->

<!-- @use collapse-section -->

<!-- @slot:sectionTitle -->src/components/__tests__/TaskList.test.tsx<!-- @/slot -->
<!-- @slot:sectionWhere --><span class="add">+14</span> <span class="del">−4</span><!-- @/slot -->
<!-- @slot:sectionBody -->Adds a test asserting the row updates synchronously after click, and one asserting rollback when the mocked request rejects. Both pass locally.<!-- @/slot -->

<!-- ─── suggested next steps ─── -->
<!-- @use checklist -->

<!-- @slot:checklistHeading -->Suggested next steps<!-- @/slot -->

<!-- @slot:checklist -->
- [ ] Add \`await qc.cancelQueries(key)\` at the top of \`onMutate\` in \`useOptimisticTasks.ts\`.
- [ ] Move idempotency-key generation into the mutation context so retries reuse the same key.
- [ ] Either consume \`isPending\` in \`TaskRow\` or remove it from the destructure to keep lint clean.
<!-- @/slot -->

<!-- ─── footer ─── -->
<!-- @slot:footer -->
birchline/web · Pull Request #247 · Review Summary
<!-- @/slot -->
`,
    missingComponents: ['file-card'],
  }),

  // ============================================================
  // #17 pr-writeup
  // ============================================================
  makeTemplate({
    id: 'he-17-pr-writeup',
    name: 'PR 说明',
    description: 'TL;DR + Before/After + 文件逐行讲解 + 评审焦点 + 测试计划 + 发布节奏',
    emoji: '🔀',
    icon: 'GitPullRequest',
    color: '#D1FAE5',
    group: 'code-review',
    componentIds: [
      'header',
      'lead',
      'panel',
      'comparison',
      'list-row',
      'list-item',
      'test-step',
      'progress',
      'footer',
    ],
    docTitle: 'PR #312 — Move notification delivery onto a queue',
    starterMarkdown: `<!-- @page wide -->
<!-- @compose: header, lead, panel, comparison, list-row, list-item, test-step, progress, footer -->
<!-- @theme editorial -->

<!-- ─── header ─── -->
<!-- @use header -->

# #312 — Move notification delivery onto a queue

<!-- @slot:eyebrow -->Pull request · Birchline<!-- @/slot -->
<!-- @slot:author -->@priya<!-- @/slot -->

<!-- ─── pr meta (inline) ─── -->
**9 files** · **+418** / **−190** · branch **notify-queue → main**

<!-- ─── prompt panel ─── -->
<!-- @use panel variant=prompt -->

<!-- @slot:panelTitle -->Prompt<!-- @/slot -->

<!-- @slot:panelBody -->
Write up PR #312 for my reviewers. Explain the motivation, walk them through the change file by file with the *why* for each, show before/after behavior, and tell them exactly where to focus. They haven't touched the notification code in six months.
<!-- @/slot -->

<!-- ─── tldr ─── -->
<!-- @use lead variant=tldr -->

<!-- @slot:tldr -->
Notification sends were happening inline in the request path. Under load they added 200–800 ms to mutation latency and silently dropped emails when the SMTP pool was exhausted. This PR moves delivery onto the existing \`pg-boss\` queue so the API returns immediately and failed sends retry with backoff.
<!-- @/slot -->

<!-- ─── why ─── -->
## Why

When we added @mentions in comments last quarter, every mention started triggering up to three sends (in-app, email, Slack) inside the same transaction that saved the comment. That was fine at launch. It is not fine now that a single task update can fan out to forty watchers.

<!-- ─── before / after ─── -->
<!-- @use comparison variant=ba -->

<!-- @slot:baBefore -->
- Sends run inline in the mutation handler
- SMTP timeout = 500 error for the *comment*
- No retries — a dropped email is gone
- p99 on \`comments.create\`: **1.4 s**
<!-- @/slot -->

<!-- @slot:baAfter -->
- Handler enqueues one job per recipient, returns
- Worker retries 3× with exponential backoff
- Dead-letter table for inspection after exhaustion
- p99 on \`comments.create\`: **180 ms** (staging)
<!-- @/slot -->

<!-- ─── file-by-file ─── -->
## File-by-file

Ordered for reading, not alphabetically. Start at the worker — it's the new thing — then the enqueue call site, then the plumbing.

<!-- @use list-row variant=entry -->

<!-- @slot:entryPath -->packages/notify/src/worker.ts<!-- @/slot -->
<!-- @slot:entryBadge -->new<!-- @/slot -->
<!-- @slot:entryStats -->+126<!-- @/slot -->

<!-- @slot:entryWhy -->
**The heart of the PR.** A \`pg-boss\` subscriber that pulls \`notify.deliver\` jobs, resolves the user's channel preferences, and calls the right adapter. Retries are configured per-channel — email gets three attempts, Slack gets one because its API is already idempotent on our side.
<!-- @/slot -->

<!-- @slot:entryCode -->
\`\`\`typescript
boss.work('notify.deliver', { batchSize: 20 }, async (jobs) => {
  for (const job of jobs) {
    const { userId, event, channel } = job.data;
    const prefs = await getPrefs(userId);
    if (!prefs[channel]) return;          // user muted this channel

    try {
      await adapters[channel].send(userId, event);
    } catch (err) {
      if (job.retryCount >= MAX_RETRY[channel]) {
        await deadLetter(job, err);         // don't throw — ack & park
        return;
      }
      throw err;                            // pg-boss reschedules
    }
  }
});
\`\`\`
<!-- @/slot -->

<!-- @use list-row variant=entry -->

<!-- @slot:entryPath -->packages/api/src/routers/comments.ts<!-- @/slot -->
<!-- @slot:entryBadge -->mod<!-- @/slot -->
<!-- @slot:entryStats -->+14 / −62<!-- @/slot -->

<!-- @slot:entryWhy -->
**Where the win shows up.** The mutation used to call \`sendEmail\`, \`sendSlack\`, and \`createInApp\` directly. Now it inserts the comment, computes recipients, and enqueues. The try/catch soup is gone.
<!-- @/slot -->

<!-- @slot:entryCode -->
\`\`\`typescript
  const comment = await db.comments.insert(input);
  const recipients = await resolveWatchers(input.taskId, input.mentions);

  await boss.insert(recipients.flatMap((r) =>
    CHANNELS.map((ch) => ({
      name: 'notify.deliver',
      data: { userId: r.id, channel: ch, event: toEvent(comment) },
      singletonKey: \`\${comment.id}:\${r.id}:\${ch}\`,  // idempotent
    }))));
  return comment;
\`\`\`
<!-- @/slot -->

<!-- @use list-row variant=entry -->

<!-- @slot:entryPath -->packages/db/migrations/0051_dead_letter.sql<!-- @/slot -->
<!-- @slot:entryBadge -->new<!-- @/slot -->
<!-- @slot:entryStats -->+22<!-- @/slot -->

<!-- @slot:entryWhy -->
Table for jobs that exhaust their retries. Deliberately *not* auto-pruned — we want to look at these weekly until we trust the new path. Has the full job payload and the last error string.
<!-- @/slot -->

<!-- @use list-row variant=entry -->

<!-- @slot:entryPath -->packages/notify/src/adapters/{email,slack,inapp}.ts<!-- @/slot -->
<!-- @slot:entryBadge -->mod<!-- @/slot -->
<!-- @slot:entryStats -->+88 / −74<!-- @/slot -->

<!-- @slot:entryWhy -->
Mostly moves. Each adapter now implements a shared \`Adapter\` interface and throws a typed \`RetryableError\` or \`PermanentError\` so the worker knows whether to retry. The email adapter also drops its internal retry loop — the queue owns retries now, double-retrying was how we got duplicate emails in April.
<!-- @/slot -->

<!-- @use list-row variant=entry -->

<!-- @slot:entryPath -->apps/worker/src/index.ts, infra/fly.toml<!-- @/slot -->
<!-- @slot:entryBadge -->mod<!-- @/slot -->
<!-- @slot:entryStats -->+31 / −4<!-- @/slot -->

<!-- @slot:entryWhy -->
Registers the new subscriber in the existing worker process and bumps its concurrency from 5 → 20. No new deploy unit.
<!-- @/slot -->

<!-- @use list-row variant=entry -->

<!-- @slot:entryPath -->packages/notify/src/__tests__/worker.test.ts<!-- @/slot -->
<!-- @slot:entryBadge -->new<!-- @/slot -->
<!-- @slot:entryStats -->+137<!-- @/slot -->

<!-- @slot:entryWhy -->
Covers the retry boundary, the dead-letter path, channel muting, and the singleton key dedupe. Uses a real pg-boss against the test database — we got burned last quarter when mocked queue tests passed but prod ordering broke.
<!-- @/slot -->

<!-- ─── where to focus ─── -->
## Where to focus your review

<!-- @use list-item variant=focus -->

<!-- @slot:focusNum -->1<!-- @/slot -->
<!-- @slot:focusTitle -->The retry / dead-letter boundary<!-- @/slot -->
<!-- @slot:focusDesc -->\`worker.ts:31–44\`. I catch, check \`retryCount\`, and either park or rethrow. If this logic is wrong we either retry forever or drop messages — the two failure modes this PR exists to fix.<!-- @/slot -->

<!-- @use list-item variant=focus -->

<!-- @slot:focusNum -->2<!-- @/slot -->
<!-- @slot:focusTitle -->The singleton key<!-- @/slot -->
<!-- @slot:focusDesc -->\`comments.ts:28\`. \`\${commentId}:\${userId}:\${channel}\` should make re-enqueues idempotent if the API handler retries. Sanity-check that this can't collide across tasks.<!-- @/slot -->

<!-- @use list-item variant=focus -->

<!-- @slot:focusNum -->3<!-- @/slot -->
<!-- @slot:focusTitle -->What I deliberately did not do<!-- @/slot -->
<!-- @slot:focusDesc -->No per-user digest batching, no delivery receipts, no priority lanes. All of those layer on top of this cleanly; bundling them would make this unreviewable.<!-- @/slot -->

<!-- ─── test plan ─── -->
## Test plan

<!-- @use test-step -->

<!-- @slot:testDone -->done<!-- @/slot -->
<!-- @slot:testLabel -->Unit: retry → dead-letter path, channel mute, singleton dedupe<!-- @/slot -->
<!-- @slot:testNote -->packages/notify — 14 cases, real pg-boss on test db<!-- @/slot -->

<!-- @use test-step -->

<!-- @slot:testDone -->done<!-- @/slot -->
<!-- @slot:testLabel -->Integration: create comment with 3 watchers, assert 9 jobs enqueued and drained<!-- @/slot -->

<!-- @use test-step -->

<!-- @slot:testDone -->done<!-- @/slot -->
<!-- @slot:testLabel -->Staging load: 500 rps on comments.create for 10 min, p99 = 180 ms<!-- @/slot -->
<!-- @slot:testNote -->was 1.4 s before — dashboard linked in the PR description<!-- @/slot -->

<!-- @use test-step -->

<!-- @slot:testDone --><!-- @/slot -->
<!-- @slot:testLabel -->Manual: kill SMTP mid-burst, confirm jobs land in dead-letter and nothing 500s<!-- @/slot -->
<!-- @slot:testNote -->will do during the 10% ramp<!-- @/slot -->

<!-- ─── rollout ─── -->
## Rollout

Behind \`notify_queue_v2\`. The old inline path stays in the codebase, dead but dormant, for one release in case we need to flip back.

<!-- @use progress variant=rollout -->

<!-- @slot:rolloutHeading -->Rollout<!-- @/slot -->

<!-- @slot:rolloutSteps -->
Day 0|internal|Birchline team only. Watch dead-letter table + worker error rate.
Day 2|10%|Random sample. Alert if dead-letter rate > 0.5% of sends.
Day 4|100%|Ramp fully, delete the inline path in a follow-up PR next week.
<!-- @/slot -->

<!-- ─── footer ─── -->
<!-- @slot:footer -->
Birchline · Engineering · 2026
<!-- @/slot -->
`,
    missingComponents: ['toc-sidebar'],
  }),
];
