// Batch D: research 系 (04, 05, 06, 14, 15)

import { makeTemplate } from '../make-template';

export const BATCH_D_TEMPLATES = [
  makeTemplate({
    id: 'he-04-code-understanding',
    name: '代码流程讲解',
    description: '代码架构讲解：流程图 + 分步 walkthrough + 关键文件 + gotchas',
    emoji: '📖',
    icon: 'BookOpen',
    color: 'var(--color-clay-100)',
    group: 'research',
    componentIds: ['header', 'lead', 'code-block', 'body', 'callout', 'footer'],
    docTitle: 'How authentication flows through birchline/web',
    starterMarkdown: `<!-- @page wide -->
<!-- @compose: header, lead, code-block, body, callout, footer -->
<!-- @theme editorial -->

<!-- ─── header ─── -->
<!-- @use header -->

# How authentication flows through the codebase

## birchline/web · architecture note

<!-- @slot:eyebrow -->birchline/web · architecture note<!-- @/slot -->

<!-- ─── lead ─── -->
<!-- @use lead -->

> Birchline uses cookie-based sessions: the browser never holds a bearer token directly. Every authenticated request hits \`/api/*\`, passes through a single \`verifyToken()\` middleware, and resolves to a \`Session\` row that downstream handlers read off \`req.ctx\`. The middleware is the only place that talks to the session store, which is the only place that talks to the \`sessions\` table — so there's exactly one trust boundary to reason about.

<!-- ─── code-block (Request path diagram) ─── -->
<!-- @use code-block variant=walkthrough -->

\`\`\`
Browser          /api/session       verifyToken()
birchline.app    route handler      middleware/auth.ts
     │                │                    │
     └───────────────►│───────────────────►│
     cookie           │                    │
                      │                    │
                      │                    ▼
                      │              SessionStore
                      │              lib/sessionStore.ts
                      │                    │
                      │◄───────────────────┘
                      │              lookup
                      ▼
                   Postgres
                   sessions table
\`\`\`

<!-- ─── body (Step 1) ─── -->
<!-- @use body -->

## 1. AuthProvider.tsx

**src/app/providers/AuthProvider.tsx :22-48**

On mount, the React provider issues a \`GET /api/session\` with \`credentials: 'include'\` so the \`fw_sid\` cookie rides along. The response either hydrates \`currentUser\` into context or leaves it \`null\`, which the router treats as "show the sign-in screen".

\`\`\`ts
// src/app/providers/AuthProvider.tsx
export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch('/api/session', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(setUser);
  }, []);

  return <AuthCtx.Provider value={{ user }}>{children}</AuthCtx.Provider>;
}
\`\`\`

<!-- ─── body (Step 2) ─── -->
<!-- @use body -->

## 2. session.ts route

**src/server/routes/session.ts :9-27**

The route itself is thin: it just returns whatever \`req.ctx.session\` the middleware attached. If the middleware short-circuited with a 401, this handler never runs — so there's no auth logic duplicated here.

\`\`\`ts
// src/server/routes/session.ts
router.get('/session', verifyToken, (req, res) => {
  const { session } = req.ctx;
  res.json({
    id:    session.userId,
    email: session.email,
    role:  session.role,
    exp:   session.expiresAt,
  });
});
\`\`\`

<!-- ─── body (Step 3) ─── -->
<!-- @use body -->

## 3. verifyToken middleware

**src/middleware/auth.ts :14-31**

This is the trust boundary. \`verifyToken\` reads the signed \`fw_sid\` cookie, asks \`SessionStore\` to resolve it, and either populates \`req.ctx.session\` or responds 401. Every protected route in the app is mounted behind this function, so changing its behaviour changes auth globally.

\`\`\`ts
// src/middleware/auth.ts
export async function verifyToken(req, res, next) {
  const raw = req.signedCookies['fw_sid'];
  if (!raw) return res.status(401).end();

  const session = await SessionStore.get(raw);
  if (!session || session.expiresAt < Date.now()) {
    return res.status(401).end();
  }

  req.ctx = { session };
  next();
}
\`\`\`

<!-- ─── body (Step 4) ─── -->
<!-- @use body -->

## 4. SessionStore

**src/lib/sessionStore.ts :8-52**

\`SessionStore\` is a small read-through cache: it checks an in-process LRU first, then falls back to Postgres. Writes (\`create\`, \`revoke\`) always go straight to the DB and invalidate the cache entry so other workers don't serve a stale session.

\`\`\`ts
// src/lib/sessionStore.ts
const cache = new LRU<string, Session>({ max: 5000, ttl: 60_000 });

export const SessionStore = {
  async get(id: string) {
    const hit = cache.get(id);
    if (hit) return hit;
    const row = await db.one(SELECT_SESSION, [id]);
    if (row) cache.set(id, row);
    return row ?? null;
  },
  /* create, revoke, touch ... */
};
\`\`\`

<!-- ─── body (Step 5) ─── -->
<!-- @use body -->

## 5. sessions table

**db/migrations/004_sessions.sql :1-18**

The \`sessions\` table is keyed on a random 32-byte id (the cookie value) with a covering index on \`user_id\` for "sign out everywhere". Expiry is enforced both here (\`expires_at\`) and again in the middleware as defence in depth.

\`\`\`sql
-- db/migrations/004_sessions.sql
create table sessions (
  id          text primary key,
  user_id     uuid not null references users(id),
  created_at  timestamptz default now(),
  expires_at  timestamptz not null,
  ip          inet,
  user_agent  text
);
create index sessions_user_id_idx on sessions(user_id);
\`\`\`

<!-- ─── callout (Key files) ─── -->
<!-- @use callout variant=note -->

### Key files

- \`src/middleware/auth.ts\` — Single entry point for request authentication.
- \`src/lib/sessionStore.ts\` — LRU + Postgres session lookup; only DB caller.
- \`src/server/routes/session.ts\` — Returns the current session to the client.
- \`src/server/routes/login.ts\` — Exchanges credentials for a cookie via SessionStore.create.
- \`src/app/providers/AuthProvider.tsx\` — Client-side context that mirrors the server session.
- \`db/migrations/004_sessions.sql\` — Schema for the sessions table and indexes.

<!-- ─── callout (Gotchas) ─── -->
<!-- @use callout variant=questions -->

### Gotchas

- The LRU in \`SessionStore\` is per-process. Revoking a session only clears the local cache — other workers may serve it for up to 60s until their TTL lapses.
- \`verifyToken\` compares \`expiresAt\` against \`Date.now()\`, but the column is \`timestamptz\`. The driver returns a \`Date\`, so the comparison works, but don't refactor it to a raw string without adjusting the check.

<!-- ─── footer ─── -->
<!-- @use footer -->

<!-- @slot:footer -->birchline/web · architecture note<!-- @/slot -->
`,
    missingComponents: ['flow-diagram'],
  }),

  makeTemplate({
    id: 'he-05-design-system',
    name: '设计系统参考',
    description: '设计系统文档：色板、字体层级、间距、圆角、阴影、核心组件展示',
    emoji: '🎨',
    icon: 'BookOpen',
    color: 'var(--color-clay-100)',
    group: 'research',
    componentIds: ['header', 'table', 'footer'],
    docTitle: 'Birchline — Design System Reference',
    starterMarkdown: `<!-- @page wide -->
<!-- @compose: header, table, footer -->
<!-- @theme editorial -->

<!-- ─── header ─── -->
<!-- @use header -->

# Birchline design system

## Generated from \`src/styles/tokens.ts\` and \`src/components/\` — use as a portable reference when prompting.

<!-- @slot:eyebrow -->Design system reference<!-- @/slot -->

<!-- ─── Color ─── -->
<!-- @use table variant=standard -->

<!-- @slot:heading -->Color<!-- @/slot -->

| Token | Hex | Usage |
|---|---|---|
| \`--clay\` | #D97757 | Primary accent, CTAs |
| \`--slate\` | #141413 | Text, borders |
| \`--ivory\` | #FAF9F5 | Page background |
| \`--oat\` | #E3DACC | Muted fill |
| \`--white\` | #FFFFFF | Card surface |
| \`--gray-100\` | #F0EEE6 | Subtle bg |
| \`--gray-300\` | #D1CFC5 | Dividers |
| \`--gray-500\` | #87867F | Placeholder, icons |
| \`--gray-700\` | #3D3D3A | Body text |
| \`--success\` | #788C5D | Positive state |
| \`--warning\` | #C78E3F | Warning state |
| \`--danger\` | #B04A4A | Error state |
| \`--info\` | #5C7CA3 | Info state |

<!-- ─── Typography ─── -->
<!-- @use table variant=standard -->

<!-- @slot:heading -->Typography<!-- @/slot -->

| Name | Specimen | Size / Line / Weight |
|---|---|---|
| Display | Plan the week ahead | 48 / 1.1 / 500 |
| Heading 1 | Plan the week ahead | 32 / 1.2 / 500 |
| Heading 2 | Plan the week ahead | 24 / 1.3 / 500 |
| Body | Review milestones, assign owners, and surface blockers before they cascade. | 16 / 1.55 / 430 |
| Small | Review milestones, assign owners, and surface blockers before they cascade. | 14 / 1.5 / 430 |
| Caption | UPDATED 2 HOURS AGO | 12 / 1.4 / 500 |

<!-- ─── Spacing ─── -->
<!-- @use table variant=standard -->

<!-- @slot:heading -->Spacing<!-- @/slot -->

| Token | Value |
|---|---|
| \`--sp-1\` | 4px |
| \`--sp-2\` | 8px |
| \`--sp-3\` | 12px |
| \`--sp-4\` | 16px |
| \`--sp-5\` | 24px |
| \`--sp-6\` | 32px |
| \`--sp-7\` | 48px |
| \`--sp-8\` | 64px |

<!-- ─── Radius & Elevation ─── -->
<!-- @use table variant=standard -->

<!-- @slot:heading -->Radius & Elevation<!-- @/slot -->

| Token | Value | Type |
|---|---|---|
| \`--r-xs\` | 4px | radius |
| \`--r-sm\` | 8px | radius |
| \`--r-md\` | 12px | radius |
| \`--r-lg\` | 20px | radius |
| \`--shadow-sm\` | 0 1px 2px / 6% | shadow |
| \`--shadow-md\` | 0 4px 10px / 8% | shadow |
| \`--shadow-lg\` | 0 12px 28px / 12% | shadow |

<!-- ─── footer ─── -->
<!-- @use footer -->

<!-- @slot:footer -->Birchline · Design System<!-- @/slot -->
`,
  }),

  makeTemplate({
    id: 'he-06-component-variants',
    name: '组件变体矩阵',
    description: '组件变体展示：grid 布局 + card 多 variant + 代码片段面板',
    emoji: '🧩',
    icon: 'LayoutTemplate',
    color: 'var(--color-ivory-200)',
    group: 'research',
    componentIds: ['header', 'layout-grid-3', 'card', 'panel', 'footer'],
    docTitle: 'Birchline — Card Variant Matrix',
    starterMarkdown: `<!-- @page wide -->
<!-- @compose: header, layout-grid-3, card, panel, footer -->
<!-- @theme editorial -->

<!-- ─── header ─── -->
<!-- @use header -->

# Card variant matrix

## Six structural treatments of the Birchline \`<Card />\` component. Adjust density and emphasis with the controls, hover a variant to see its prop combo.

<!-- @slot:eyebrow -->Component reference<!-- @/slot -->

<!-- ─── layout-grid-3 (Variant cards) ─── -->
<!-- @use layout-grid-3 -->

<!-- @compose-group: layout-grid-3 -->

<!-- @item card -->
<!-- @slot:cardTitle -->A · Flat<!-- @/slot -->
<!-- @slot:cardBody -->
**Weekly planning**
12 tasks · due Friday
Tags: Q2, Roadmap
[Open]

_best for: dense lists on tinted backgrounds_
<!-- @/slot -->
<!-- @/item -->

<!-- @item card -->
<!-- @slot:cardTitle -->B · Outlined<!-- @/slot -->
<!-- @slot:cardBody -->
**Weekly planning**
12 tasks · due Friday
Tags: Q2, Roadmap
[Open]

_best for: default content cards on ivory_
<!-- @/slot -->
<!-- @/item -->

<!-- @item card -->
<!-- @slot:cardTitle -->C · Elevated<!-- @/slot -->
<!-- @slot:cardBody -->
**Weekly planning**
12 tasks · due Friday
Tags: Q2, Roadmap
[Open]

_best for: draggable items, popovers_
<!-- @/slot -->
<!-- @/item -->

<!-- @item card -->
<!-- @slot:cardTitle -->D · Accent stripe<!-- @/slot -->
<!-- @slot:cardBody -->
**Weekly planning**
12 tasks · due Friday
Tags: Q2, Roadmap
[Open]

_best for: pinned or priority items_
<!-- @/slot -->
<!-- @/item -->

<!-- @item card -->
<!-- @slot:cardTitle -->E · Inset<!-- @/slot -->
<!-- @slot:cardBody -->
**Weekly planning**
12 tasks · due Friday
Tags: Q2, Roadmap
[Open]

_best for: nested cards inside white panels_
<!-- @/slot -->
<!-- @/item -->

<!-- @item card -->
<!-- @slot:cardTitle -->F · Horizontal<!-- @/slot -->
<!-- @slot:cardBody -->
**Weekly planning**
Tags: Q2, Roadmap
[Open]

_best for: compact row lists, sidebars_
<!-- @/slot -->
<!-- @/item -->

<!-- @/compose-group -->

<!-- ─── panel (Snippet) ─── -->
<!-- @use panel variant=snippet -->

<!-- @slot:panelTitle -->JSX — hover a variant above<!-- @/slot -->

<!-- @slot:panelBody -->
\`\`\`jsx
// hover a card to preview its props
\`\`\`
<!-- @/slot -->

<!-- ─── footer ─── -->
<!-- @use footer -->

<!-- @slot:footer -->Birchline · Component Reference<!-- @/slot -->
`,
    missingComponents: ['interactive-toolbar'],
  }),

  makeTemplate({
    id: 'he-14-research-feature-explainer',
    name: '特性讲解（feature）',
    description: '特性深度讲解：TL;DR + 分步折叠 + 配置示例 + FAQ',
    emoji: '🔍',
    icon: 'BookOpen',
    color: 'var(--color-clay-100)',
    group: 'research',
    componentIds: ['header', 'lead', 'collapse-section', 'code-block', 'callout', 'body', 'faq-item', 'footer'],
    docTitle: 'How rate limiting works in birchline/api',
    starterMarkdown: `<!-- @page wide -->
<!-- @compose: header, lead, collapse-section, code-block, callout, body, faq-item, footer -->
<!-- @theme editorial -->

<!-- ─── header ─── -->
<!-- @use header -->

# How rate limiting works in \`birchline/api\`

## Research & Learning · feature summary

<!-- @slot:eyebrow -->Research & Learning · feature summary<!-- @/slot -->

<!-- ─── lead ─── -->
<!-- @use lead variant=tldr -->

<!-- @slot:tldr -->
**TL;DR** — Every request passes through \`rateLimit()\` middleware, which resolves the caller to a *bucket key*, fetches a token-bucket from Redis, and either consumes one token or returns \`429\`. Limits are declared per-route in \`config/limits.yaml\`; routes without an entry inherit the \`default\` tier (100 req/min per API key).
<!-- @/slot -->

<!-- ─── collapse-section (Step 1) ─── -->
<!-- @use collapse-section -->

<!-- @slot:sectionTitle -->1 · Identify the caller<!-- @/slot -->
<!-- @slot:sectionWhere -->middleware/ratelimit.ts:21<!-- @/slot -->
<!-- @slot:sectionBody -->
The middleware first reduces the request to a \`bucketKey\`: API key if an \`Authorization\` header is present, otherwise the client IP (via the \`x-forwarded-for\` chain, trusting only our own LB). Anonymous IP traffic gets a much lower default tier.
<!-- @/slot -->

<!-- ─── collapse-section (Step 2) ─── -->
<!-- @use collapse-section -->

<!-- @slot:sectionTitle -->2 · Look up the bucket<!-- @/slot -->
<!-- @slot:sectionWhere -->lib/tokenBucket.ts:9<!-- @/slot -->
<!-- @slot:sectionBody -->
The route name plus bucket key map to a Redis hash (\`rl:{route}:{key}\`) holding \`tokens\` and \`updatedAt\`. If the key is missing it's created lazily at full capacity — there's no warm-up.
<!-- @/slot -->

<!-- ─── collapse-section (Step 3) ─── -->
<!-- @use collapse-section -->

<!-- @slot:sectionTitle -->3 · Refill and consume<!-- @/slot -->
<!-- @slot:sectionWhere -->lib/tokenBucket.ts:31<!-- @/slot -->
<!-- @slot:sectionBody -->
Refill is computed from elapsed time (\`rate × Δt\`, capped at \`burst\`), then one token is subtracted. The whole read-modify-write runs as a single Lua script so concurrent requests can't double-spend.
<!-- @/slot -->

<!-- ─── collapse-section (Step 4) ─── -->
<!-- @use collapse-section -->

<!-- @slot:sectionTitle -->4 · Reject when empty<!-- @/slot -->
<!-- @slot:sectionWhere -->middleware/ratelimit.ts:48<!-- @/slot -->
<!-- @slot:sectionBody -->
If the script returns \`tokens < 0\` the middleware short-circuits with \`429 Too Many Requests\` and sets \`Retry-After\` to the seconds until one token refills. Successful responses always carry \`X-RateLimit-Remaining\`.
<!-- @/slot -->

<!-- ─── code-block (Config examples) ─── -->
<!-- @use code-block variant=walkthrough -->

<!-- @slot:stepNum -->★<!-- @/slot -->
<!-- @slot:stepLoc -->config/limits.yaml<!-- @/slot -->
<!-- @slot:stepRange -->Configuring a limit on your route<!-- @/slot -->

<!-- @slot:stepBody -->
You don't touch the middleware. Add an entry to \`config/limits.yaml\` keyed by route name, and (optionally) tag the route so the middleware can find it.
<!-- @/slot -->

<!-- @slot:stepCode -->
\`\`\`yaml
# config/limits.yaml
default:
  rate: 100/min
  burst: 120

search.query:
  rate: 20/min
  burst: 40
  key: api_key        # or: ip
\`\`\`
<!-- @/slot -->

<!-- ─── callout ─── -->
<!-- @use callout variant=note -->

<!-- @slot:calloutBody -->
★ If you only need the default tier, you don't need a YAML entry at all — just wrap the handler in \`rateLimit()\` with no argument. The route name is inferred from the path.
<!-- @/slot -->

<!-- ─── body (Gotchas) ─── -->
<!-- @use body -->

## Gotchas worth knowing

- **Limits are per-process in dev.** The Redis client falls back to an in-memory map when \`REDIS_URL\` is unset, so local testing won't reflect real cluster behaviour.
- **Burst ≠ rate.** \`burst\` is the bucket capacity; a caller idle for a minute can fire \`burst\` requests instantly even if \`rate\` is low.
- **Streaming responses count once.** The token is consumed at request start; a 30-second SSE stream still costs one token.

<!-- ─── faq-item (FAQ #1) ─── -->
<!-- @use faq-item -->

<!-- @slot:faqQ -->How do I exempt internal traffic?<!-- @/slot -->
<!-- @slot:faqA -->Set \`x-birchline-internal: 1\` from the caller; the middleware checks it against the mTLS peer name and skips the bucket entirely.<!-- @/slot -->

<!-- ─── faq-item (FAQ #2) ─── -->
<!-- @use faq-item -->

<!-- @slot:faqQ -->Where do I see who's getting limited?<!-- @/slot -->
<!-- @slot:faqA -->Every \`429\` emits a \`ratelimit.rejected\` metric tagged with route and key type. There's a Grafana panel under *API → Health*.<!-- @/slot -->

<!-- ─── faq-item (FAQ #3) ─── -->
<!-- @use faq-item -->

<!-- @slot:faqQ -->Can a single user have a higher limit?<!-- @/slot -->
<!-- @slot:faqA -->Yes — add their API key under \`overrides:\` in the YAML. Overrides are reloaded without a deploy.<!-- @/slot -->

<!-- ─── footer ─── -->
<!-- @use footer -->

<!-- @slot:footer -->birchline/api · Research & Learning<!-- @/slot -->
`,
    missingComponents: ['tabbed-code-block'],
  }),

  makeTemplate({
    id: 'he-15-research-concept-explainer',
    name: '概念讲解（interactive）',
    description: '交互式概念讲解：导语 + 交互演示 + 对比表格 + 术语表',
    emoji: '💡',
    icon: 'BookOpen',
    color: 'var(--color-clay-100)',
    group: 'research',
    componentIds: ['header', 'lead', 'body', 'illustration', 'table', 'panel', 'footer'],
    docTitle: 'Consistent hashing — an interactive explainer',
    starterMarkdown: `<!-- @page wide -->
<!-- @compose: header, lead, body, illustration, table, panel, footer -->
<!-- @theme editorial -->

<!-- ─── header ─── -->
<!-- @use header -->

# Consistent hashing, in one ring

## Research & Learning · concept explainer

<!-- @slot:eyebrow -->Research & Learning · concept explainer<!-- @/slot -->

<!-- ─── lead ─── -->
<!-- @use lead -->

> You have *K* keys spread across *N* cache servers. A server dies, or you add one. How many keys have to move? With naive \`hash(key) mod N\` the answer is "almost all of them." Consistent hashing gets it down to roughly \`K / N\`. Here's why.

<!-- ─── body ─── -->
<!-- @use body -->

<!-- @slot:body -->
## The trick: hash onto a circle, not a line

Map both **nodes** and keys onto the same **ring** (the hash output space, wrapped around). A key belongs to the first node found by walking clockwise from the key's position. When a node leaves, only the keys in its **arc** reassign — to the next node round — and everything else stays put.
<!-- @/slot -->

<!-- ─── illustration ─── -->
<!-- @use illustration variant=frame -->

<!-- @slot:frameTitle -->Interactive demo<!-- @/slot -->
<!-- @slot:frameSub -->4 nodes · 32 keys · — moved on last change<!-- @/slot -->

<!-- @slot:frameSvg -->
Colored arcs show ownership. Removing a node hands its arc to its clockwise neighbor; every dot outside that arc keeps its color. That's the whole idea.
<!-- @/slot -->

<!-- ─── table ─── -->
<!-- @use table variant=standard -->

## Versus \`mod N\`

| | hash mod N | consistent hashing |
|---|---|---|
| Keys moved when N→N+1 | ~ (N−1)/N of all keys | ~ 1/(N+1) |
| Hot-spot risk | even by construction | uneven — fix with virtual nodes |
| Lookup cost | O(1) | O(log N) (binary search on ring) |
| Used by | array sharding, simple LB | Dynamo, Cassandra, Memcached clients, Envoy |

<!-- ─── body ─── -->
<!-- @use body -->

## Where you'll meet it

Any time you're spreading state across a pool that changes size: cache fleets, partitioned queues, object storage, request routing with sticky sessions. The **virtual-node** variant (each physical node owns many small arcs instead of one big one) is what production systems actually run, because it smooths out load and makes rebalancing even gentler.

<!-- ─── panel (Glossary) ─── -->
<!-- @use panel variant=glossary -->

<!-- @slot:panelTitle -->Glossary<!-- @/slot -->

<!-- @slot:panelBody -->
| Term | Definition |
|---|---|
| **Ring** | The hash function's output range, treated as a circle so the value after \`max\` is \`0\`. |
| **Node** | A server placed on the ring at \`hash(node_id)\`. Owns every key between it and its anticlockwise neighbor. |
| **Arc** | The stretch of ring a node owns. Removing a node merges its arc into the next node's. |
| **Virtual node** | Placing each physical node at many ring positions so arcs are small and evenly sized. |
| **Successor** | The first node clockwise from a given point — the owner of any key landing there. |
<!-- @/slot -->

<!-- ─── footer ─── -->
<!-- @use footer -->

<!-- @slot:footer -->Research & Learning · Concept Explainer<!-- @/slot -->
`,
    missingComponents: ['interactive-ring-demo'],
  }),
];
