# 语法规范 · Forge Markdown

> 一句话：**所有 forge 扩展是 HTML 注释，内容永远是原生 Markdown**。
>
> 无论有没有 forge 引擎，你的 `.md` 文件在任何编辑器里都是可读的合法 Markdown。

---

## 目录

1. [快速入门 — 3 分钟写出第一个文档](#快速入门)
2. [指令一览](#指令一览)
3. [内置组件速查](#内置组件速查)
4. [指令详解](#指令详解)
5. [原生 MD 自动绑定](#原生-md-自动绑定)
6. [兜底渲染策略](#兜底渲染策略)
7. [内联语法](#内联语法)
8. [声明式图表](#声明式图表)
9. [优先级总览](#优先级总览)
10. [常见问题 FAQ](#常见问题-faq)

---

## 快速入门

### 最小可运行文档

```md
<!-- @page narrow -->
<!-- @compose: header, body, footer -->
<!-- @theme editorial -->

<!-- @use header -->

# 我的第一篇文档

## 用 md-html-forge 写文档

<!-- @slot:eyebrow -->2026 · 团队分享<!-- @/slot -->

<!-- @use body -->

## 背景

这是一段正文内容，支持 **加粗**、`代码`、[链接](https://example.com)。

- 要点一
- 要点二

## 总结

内容会按 editorial 主题渲染成精致的 HTML。

<!-- @use footer -->

<!-- @slot:footer -->内部文档 · 保密<!-- @/slot -->
```

**运行结果**：带 serif 标题、ivory 底色、clay 强调色的精美 HTML 文档。

---

## 指令一览

| 指令 | 作用域 | 用法 |
|---|---|---|
| `@page` | 文档级（一次性） | `<!-- @page narrow -->` |
| `@compose` | 文档级（一次性） | `<!-- @compose: header, body, footer -->` |
| `@theme` | 段级（到下一个 @theme 为止） | `<!-- @theme editorial -->` |
| `@layout` | 段级（到下一个 @layout 为止） | `<!-- @layout grid-3 -->` |
| `@use` | 组件级（后续 MD 块自动绑定到此组件） | `<!-- @use card variant=standard -->` |
| `@slot:name` / `@/slot` | 块级（显式指定 slot 内容） | `<!-- @slot:title -->标题<!-- @/slot -->` |
| `@compose-group` / `@/compose-group` | 块级（布局 + 循环） | 见下文 |
| `@item` / `@/item` | 在 group 内部 | 见下文 |

---

## 内置组件速查

> 用法模式：先 `@compose` 声明用哪些组件，再 `@use` 指定内容归属。

### header · 文档标题区

**场景**：每篇文档的第一块，显示标题、副标题、作者、日期等元信息。

```md
<!-- @use header -->

# 文档标题                       ← 自动绑定 title

## 副标题（可选）                 ← 自动绑定 subtitle

<!-- @slot:eyebrow -->项目 · 类型<!-- @/slot -->
<!-- @slot:date -->2026-05-11<!-- @/slot -->
<!-- @slot:author -->@alice<!-- @/slot -->
<!-- @slot:badge -->v1.0<!-- @/slot -->
```

---

### body · 通用正文

**场景**：任意段落文字、列表、代码块的通用容器。无需声明 slot，直接写 MD。

```md
<!-- @use body -->

## 这是一个章节

任意段落、**加粗**、`代码`、引用块……

- 列表项一
- 列表项二

```ts
const x = 1;
```
```

---

### lead · 摘要 / TL;DR

**场景**：文档开头的摘要、TL;DR、阶段说明。

**Variants**：
- `lead` — 大号引用块摘要
- `tldr` — "TL;DR" 样式的条目清单
- `phase` — 阶段编号 + 标题 + 简介（用于分步讲解）

```md
<!-- @use lead variant=lead -->

> 我们相信文档的质感应当与它承载的思考同等重要。

---

<!-- @use lead variant=tldr -->

<!-- @slot:tldr -->
- 把 Markdown 输入精心设计的组件
- 输出单文件精美 HTML
- AI 生成节省 token，用户随时可调整
<!-- @/slot -->

---

<!-- @use lead variant=phase -->

<!-- @slot:phaseNum -->01<!-- @/slot -->
<!-- @slot:phaseTitle -->需求分析<!-- @/slot -->
<!-- @slot:phaseIntro -->梳理核心用户路径，确定 MVP 范围。<!-- @/slot -->
```

---

### metric · 数据指标卡

**场景**：4 列 KPI 摘要条、大号 Hero 指标、幻灯片指标展示。

**Variants**：
- `band` — 4 列等宽卡片（标准周报 / 数据看板）
- `hero` — 2 列大字号指标
- `slide` — 幻灯片单指标

```md
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
```

> **注意**：每个 slot 每行对应一列，metricValue / metricLabel / metricDelta 行数要对齐。

---

### highlights · 亮点列表

**场景**：本周亮点、关键进展、重要事项，带分隔线标题的列表块。

```md
<!-- @use highlights -->

## Highlights                    ← 自动绑定标题（或用 @slot:heading）

- **功能 A 已发布**。简要说明影响和结果。
- **性能提升 38%**。切换到批量查询后 p95 从 410ms 降到 255ms。
- **一次 SEV-2**。周三配置推送触发，47 分钟内缓解，复盘文档已归档。
```

---

### table · 数据表格

**场景**：交付清单、影响评估、风险表、功能开关表。

**Variants**：
- `standard` — 标准 Markdown 表格，支持标题
- `risk` — 风险评估三列表（描述 / 严重度 / 缓解措施）
- `impact` — 影响表键值对（如事故影响数字）
- `flag` — 功能开关行（带 toggle 视觉）

```md
<!-- 标准表格 -->
<!-- @use table variant=standard -->

<!-- @slot:heading -->Shipped<!-- @/slot -->

| PR | Title | Author | Risk |
|---|---|---|---|
| #4871 | Bulk edit toolbar | Mira Okafor | Med |
| #4874 | Batch auth lookup | Devon Park | Med |

---

<!-- 影响评估表 -->
<!-- @use table variant=impact -->

<!-- @slot:tableHeading -->影响评估<!-- @/slot -->
<!-- @slot:tableData -->
Requests failed (502)|~41,200
Peak error rate|21.4%
Users affected|~2,300 workspaces
Data loss|None
<!-- @/slot -->

---

<!-- 风险评估表 -->
<!-- @use table variant=risk -->

<!-- @slot:tableHeading -->Risks<!-- @/slot -->
<!-- @slot:tableData -->
Duplicate delivery|HIGH|Dedupe on server-assigned id in cache updater
Stale unread counts|MED|Broadcast reads on same channel
<!-- @/slot -->
```

---

### timeline · 时间线

**场景**：项目里程碑、事故时间线、事件序列。

**Variants**：
- `standard` — 圆点竖线，列表形式
- `milestones` — 菱形标记的阶段标题
- `incident` — 事故时间线，支持彩色圆点（impact / mitigated）

```md
<!-- 事故时间线 -->
<!-- @use timeline variant=incident -->

<!-- @slot:heading -->Timeline<!-- @/slot -->

<!-- @slot:timelineEntry -->
- `14:02` · 监控触发，p95 飙到 3.2s
- `14:08` · 定位到 Redis 连接池耗尽
- `14:44` · **全量恢复** · 复盘 doc 创建
<!-- @/slot -->

---

<!-- 里程碑时间线 -->
<!-- @use timeline variant=milestones -->

<!-- @slot:heading -->Milestones<!-- @/slot -->

## Week 1 · Schema & API contract

新 `comments` 表、迁移文件和 tRPC 路由桩。

## Week 2 · Realtime fan-out

订阅卡片 comment channel，追踪未读游标。
```

---

### callout · 提示块

**场景**：概念提示、注意事项、待决问题、推荐结论。

**Variants**：
- `concept` — clay 边框概念提示
- `note` — 图标 + 正文（支持 ⚠ warning 样式）
- `questions` — oat 底色的待决问题面板
- `recommendation` — clay 左边线的推荐结论

```md
<!-- @use callout variant=recommendation -->

### Recommendation

Go with **approach 02**. Birchline already has three places that hand-roll
the inline pattern — extracting one shared hook removes duplication without
taking on a new dependency.

---

<!-- @use callout variant=questions -->

### Open questions

1. Should **Trash** be pinned and excluded from reordering?
2. Keyboard path: is `Alt + Arrow` enough for v1?

---

<!-- @use callout variant=note -->

<!-- @slot:calloutIcon -->★<!-- @/slot -->

If you only need the default tier, you don't need a YAML entry at all.
```

---

### panel · 信息面板

**场景**：代码片段展示、术语定义列表、提示词预览。

**Variants**：
- `snippet` — 深色代码预览面板（带顶部标签栏）
- `glossary` — sticky 侧栏术语列表
- `prompt` — 灰色底提示词展示框

```md
<!-- @use panel variant=snippet -->

### Key code

```sql
create table comments (
  id   uuid primary key,
  body text not null
);
```

---

<!-- @use panel variant=glossary -->

<!-- @slot:panelTitle -->术语表<!-- @/slot -->

<!-- @slot:panelData -->
Ring|哈希函数输出范围，绕成圆形处理
Node|放到环上的服务器，占有一段弧
<!-- @/slot -->
```

---

### actions · 行动清单

**场景**：Carryover 事项、待办清单（支持 GitHub 风格 checkbox）。

```md
<!-- @use actions -->

## Carryover

- [ ] **In review** — Workspace export to CSV — waiting on pagination review. · Sam Reyes
- [ ] **Blocked** — SSO group mapping — blocked on IdP credentials. · Priya Anand
- [x] **Done** — Connection pool limit fix — deployed Wed. · Devon Park
```

---

### checklist · 可勾选清单

**场景**：任务清单、验收项，支持双向同步（点击 checkbox 回写 MD）。

```md
<!-- @use checklist -->

## Try it

- [x] 编辑左侧 MD，预览实时更新
- [ ] 点击右侧元素看编辑器跳转到对应行
- [ ] **勾选这行**，看 MD 里的 `- [ ]` 自动变成 `- [x]`
```

---

### code-block · 代码展示

**场景**：diff 审查、逐步代码走读。

**Variants**：
- `diff` — 深色 diff 视图，支持 +/- 行
- `walkthrough` — 编号步骤 + 文件位置 + 正文 + 代码

```md
<!-- @use code-block variant=diff -->

<!-- @slot:diffContent -->
@@ -42,14 +42,17 @@
  const { data } = useTasks(boardId);
-  const [pending, setPending] = useState(null);
+  const { mutate } = useOptimisticTasks(boardId);
<!-- @/slot -->

---

<!-- @use code-block variant=walkthrough -->

<!-- @slot:stepNum -->3<!-- @/slot -->
<!-- @slot:stepLoc -->src/middleware/auth.ts<!-- @/slot -->
<!-- @slot:stepRange -->:14-31<!-- @/slot -->

<!-- @slot:stepBody -->
这是 **信任边界**。`verifyToken` 读取签名的 cookie，
要么填充 `req.ctx.session`，要么响应 401。
<!-- @/slot -->

<!-- @slot:stepCode -->
```ts
export async function verifyToken(req, res, next) {
  const raw = req.signedCookies['fw_sid'];
  if (!raw) return res.status(401).end();
}
```
<!-- @/slot -->
```

---

### comparison · 对比视图

**场景**：Before/After 对比、多方案选择、视觉方向探索、设计 mockup 展示。

**Variants**：
- `ba` — Before / After 双列对比
- `options` — 多选项切换控制
- `mockup` — 设计稿预览 + 说明

```md
<!-- @use comparison variant=ba -->

<!-- @slot:baBefore -->
- Sends run inline in the mutation handler
- SMTP timeout = 500 error for the comment
- No retries — a dropped email is gone
<!-- @/slot -->

<!-- @slot:baAfter -->
- Handler enqueues one job per recipient, returns
- Worker retries 3× with exponential backoff
- p99 on comments.create: **180 ms** (staging)
<!-- @/slot -->
```

---

### progress · 进度条

**场景**：OKR 进度、发布 rollout 阶段、任务完成率。

**Variants**：
- `bars` — 横向进度条，支持百分比 + 说明
- `rollout` — 分阶段发布步骤表

```md
<!-- @use progress variant=bars -->

<!-- @slot:barsHeading -->季度 OKR 进度<!-- @/slot -->
<!-- @slot:barsItems -->
API p95 < 200ms|95|已超额完成
错误率 < 0.05%|100|稳定达标
文档迁移|80|2 站点未完成
<!-- @/slot -->

---

<!-- @use progress variant=rollout -->

<!-- @slot:rolloutHeading -->Rollout<!-- @/slot -->
<!-- @slot:rolloutSteps -->
Day 0|internal|Birchline team only. Watch dead-letter table.
Day 2|10%|Random sample. Alert if dead-letter rate > 0.5%.
Day 4|100%|Full ramp, delete inline path next week.
<!-- @/slot -->
```

---

### chip · 标签 / 徽章

**场景**：风险等级标签、功能开关行、选项切换、图例说明。

**Variants**：
- `risk` — 风险等级（safe / medium / attention / high）
- `flag` — 功能开关行（带 toggle 开关 + rollout 状态）
- `option` — 可选项按钮（用于 comparison variant=options）
- `legend` — 图表图例行

```md
<!-- @use chip variant=risk -->

<!-- @slot:riskLabel -->Bundle impact: +0 kb<!-- @/slot -->
<!-- @slot:riskLevel -->safe<!-- @/slot -->
```

---

### pr-summary · PR 摘要头

**场景**：PR 评审文档的标题块，显示作者、分支、改动行数等元信息。

```md
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
```

---

### collapse-section · 折叠区块

**场景**：可展开的文件变更说明、折叠的详细步骤。

```md
<!-- @use collapse-section -->

<!-- @slot:sectionTitle -->src/components/Toast.tsx<!-- @/slot -->
<!-- @slot:sectionWhere -->+14 −2<!-- @/slot -->
<!-- @slot:sectionBody -->
Adds a `variant="warning"` style and exports `pushToast`.
Purely additive, no behaviour change for existing call sites.
<!-- @/slot -->
```

---

### review-comment · 评审评论

**场景**：PR 评审里的逐行 comment，支持 blocking / nit / suggestion 类型。

```md
<!-- @use review-comment -->

<!-- @slot:commentAnchor -->line 11<!-- @/slot -->
<!-- @slot:commentLabel -->Blocking<!-- @/slot -->
<!-- @slot:commentType -->blocking<!-- @/slot -->
<!-- @slot:commentBody -->
`onMutate` doesn't call `qc.cancelQueries(key)` first. If a background
refetch lands between the optimistic write and the server response, it will
clobber the optimistic state.
<!-- @/slot -->
```

---

### illustration · 插图 / 流程图框架

**场景**：SVG 插图展示、交互式流程图、设计注解、设计系统示意。

**Variants**：
- `frame` — 带标题的插图/SVG 框架
- `notes` — 设计注解列表

```md
<!-- @use illustration variant=frame -->

<!-- @slot:frameTitle -->Deploy Pipeline<!-- @/slot -->
<!-- @slot:frameSub -->git push → CI → Canary → Promote<!-- @/slot -->
<!-- @slot:frameSvg -->
<svg xmlns="http://www.w3.org/2000/svg" width="620" height="320" viewBox="0 0 620 320">
  <!-- SVG 内容 -->
</svg>
<!-- @/slot -->
```

---

### list-item · 列表条目

**场景**：已交付项展示、专注清单、行动项条目。

**Variants**：
- `shipped` — 已交付条目（标题 + 描述 + PR 引用）
- `focus` — 专注事项（编号 + 标题 + 详细说明）
- `carry` — 结转事项（标签 + 正文 + 负责人）
- `action` — 行动项（完成状态 + 负责人 + 截止日期）

```md
<!-- @use list-item variant=shipped -->

<!-- @slot:shipTitle -->Redis 连接池上限调整<!-- @/slot -->
<!-- @slot:shipDesc -->p95 从 320ms 降到 184ms<!-- @/slot -->
<!-- @slot:shipRef -->PR #1240<!-- @/slot -->
```

---

### list-row · 文件行 / 数据行

**场景**：PR 文件变更列表、条目数据行。

**Variants**：
- `file` — 文件变更行（路径 + 风险 + 行数变化）
- `entry` — 详细条目（路径 + 徽章 + 说明 + 代码）
- `pr` — PR 行（PR 号 + 标题 + 作者 + 风险）

```md
<!-- @use list-row variant=file -->

<!-- @slot:filePath -->src/hooks/useOptimisticTasks.ts<!-- @/slot -->
<!-- @slot:fileRisk -->attention<!-- @/slot -->
<!-- @slot:fileRiskLabel -->needs attention<!-- @/slot -->
<!-- @slot:fileAdded -->+58<!-- @/slot -->
<!-- @slot:fileDeleted -->−0<!-- @/slot -->
```

---

### meta-pills · 元信息标签栏

**场景**：事故复盘、状态概览里的快速状态 pill 标签。

```md
<!-- @use meta-pills -->

<!-- @slot:pill1 -->SEV-2<!-- @/slot -->
<!-- @slot:pill2 -->Resolved<!-- @/slot -->
<!-- @slot:pill3 -->Duration 47 min<!-- @/slot -->
<!-- @slot:pill4 -->Detected Apr 12 · 14:07<!-- @/slot -->
<!-- @slot:pill5 -->Owner Devon Park<!-- @/slot -->
```

---

### faq-item · FAQ 条目

**场景**：功能讲解文档的常见问题区。

```md
<!-- @use faq-item -->

## FAQ

<!-- @slot:q1 -->How do I exempt internal traffic?<!-- @/slot -->
<!-- @slot:a1 -->
Set `x-birchline-internal: 1`; the middleware checks it against the
mTLS peer name and skips the bucket entirely.
<!-- @/slot -->

<!-- @slot:q2 -->Where do I see who's getting limited?<!-- @/slot -->
<!-- @slot:a2 -->
Every `429` emits a `ratelimit.rejected` metric tagged with route and
key type. There's a Grafana panel under *API → Health*.
<!-- @/slot -->
```

---

### qa · 问答块

**场景**：单独的问答对展示。

```md
<!-- @use qa -->

## Why not use `hash mod N`?

Because when you add or remove a server, `mod N` remaps ~(N-1)/N of all
keys. Consistent hashing reduces that to ~1/(N+1).
```

---

### footer · 页脚

**场景**：文档末尾的元信息、版权、生成时间。

```md
<!-- @use footer -->

<!-- @slot:footer -->
Sources: git log · CI dashboard · deploy log — generated Mar 16 2025 18:02
<!-- @/slot -->
```

---

### test-step · 测试步骤

**场景**：PR 测试计划里的步骤条目。

```md
<!-- @use test-step -->

<!-- @slot:testDone -->done<!-- @/slot -->
<!-- @slot:testLabel -->Unit: retry → dead-letter path, channel mute, singleton dedupe<!-- @/slot -->
<!-- @slot:testNote -->packages/notify — 14 cases, real pg-boss on test db<!-- @/slot -->
```

---

### design-spec · 设计系统展示

**场景**：色板、动画关键帧时间线。

**Variants**：`swatch` / `spacing` / `radius` / `keyframe`

```md
<!-- @use design-spec variant=keyframe -->

<!-- @slot:keyframeTitle -->Keyframes<!-- @/slot -->
<!-- @slot:keyframes -->fill|0ms|0;check|80ms|13;strike|120ms|20;confetti|200ms|33;collapse|600ms|100<!-- @/slot -->
```

---

### 布局组件（grid / flex）

**场景**：把多个组件排成多列。

```md
<!-- @compose-group: grid-3 -->

<!-- @item lead variant=phase -->
<!-- @slot:phaseNum -->01<!-- @/slot -->
<!-- @slot:phaseTitle -->Schema<!-- @/slot -->
<!-- @slot:phaseIntro -->设计数据模型。<!-- @/slot -->
<!-- @/item -->

<!-- @item lead variant=phase -->
<!-- @slot:phaseNum -->02<!-- @/slot -->
<!-- @slot:phaseTitle -->API<!-- @/slot -->
<!-- @slot:phaseIntro -->实现 tRPC 路由。<!-- @/slot -->
<!-- @/item -->

<!-- @item lead variant=phase -->
<!-- @slot:phaseNum -->03<!-- @/slot -->
<!-- @slot:phaseTitle -->UI<!-- @/slot -->
<!-- @slot:phaseIntro -->接线前端组件。<!-- @/slot -->
<!-- @/item -->

<!-- @/compose-group -->
```

**可用布局**：`grid-2` / `grid-3` / `grid-4` / `layout-flex-row`

---

## 指令详解

### `@page` —— 文档级页面配置

```md
<!-- @page narrow -->                           简写预设
<!-- @page width=wide band=full-bleed -->       全属性式
<!-- @page 960 -->                              纯数字 px
```

**预设宽度**：

| id | 宽度 | 场景 |
|---|---|---|
| `mobile` | 420px | 移动预览 |
| `narrow` | 680px | 博客文章、事故复盘 |
| `reading` | 760px | 阅读器 |
| `default` | 880px | 平衡（默认） |
| `wide` | 1080px | 技术文档、PC 优化 |
| `xwide` | 1280px | 数据看板、宽表格 |
| `full` | 100% | 通栏 |

**Band 样式**：
- `contained`（默认）：主题段背景受页宽约束
- `full-bleed`：主题段背景铺满视口，内容仍按页宽居中

---

### `@compose` —— 声明文档使用的组件

```md
<!-- @compose: header, metric, highlights, table, actions, footer -->
```

- 列表顺序 = 渲染顺序
- 必须在文档开头声明（或由模板自动设置）
- 使用某组件前必须在此声明，否则 `@use` 会被忽略

---

### `@theme` / `@layout` —— 段切割

```md
<!-- @theme editorial -->        ← 以下内容用 editorial 主题

# 内容 A（editorial 风格）

<!-- @theme dark -->             ← 以下内容换 dark 主题

# 内容 B（深色背景）

<!-- @layout grid-3 -->          ← 以下三个组件排三列

<!-- @use card variant=standard -->...
<!-- @use card variant=standard -->...
<!-- @use card variant=standard -->...
```

**可用主题**：`editorial`（米色 serif 风格，默认）/ `dark`

---

### `@use` —— 显式组件归属

```md
<!-- @use 组件id -->
<!-- @use 组件id variant=变体名 -->
```

`@use` 之后的原生 MD 块（h1/h2/列表/引用/代码/表格/段落）会按该组件的 `slot.bind` 声明自动分配 slot。

> **规则**：一段里同 id 的组件多次 `@use` 会产生多个独立实例，互不合并。

---

### `@slot:name` —— 显式 slot 内容

```md
<!-- @slot:slotName -->内容<!-- @/slot -->

<!-- @slot:slotName -->
多行内容
支持 **Markdown** 和 `code`
<!-- @/slot -->
```

显式 slot 永远优先于自动绑定。

**别名匹配**：在 `@use highlights` 上下文里，`@slot:heading` 会自动映射到 `highlightsHeading`。

---

### `@compose-group` / `@item` —— 循环布局

```md
<!-- @compose-group: grid-3 -->

<!-- @item card variant=standard -->
<!-- @slot:cardTitle -->卡片 1<!-- @/slot -->
<!-- @slot:cardBody -->内容 1<!-- @/slot -->
<!-- @/item -->

<!-- @item card variant=standard -->
<!-- @slot:cardTitle -->卡片 2<!-- @/slot -->
<!-- @slot:cardBody -->内容 2<!-- @/slot -->
<!-- @/item -->

<!-- @/compose-group -->
```

**紧凑属性式**（纯文本 slot 简写）：

```md
<!-- @compose-group grid-4 -->
<!-- @item card variant=stat statValue="30+" statLabel="Components" --><!-- @/item -->
<!-- @item card variant=stat statValue="8"   statLabel="Templates"  --><!-- @/item -->
<!-- @/compose-group -->
```

---

## 原生 MD 自动绑定

每个组件 slot 可以声明 `bind`，用于自动捕获 `@use` 之后的 MD 块：

```ts
// 示例：highlights 组件的 slots
highlightsHeading: { type: 'text',    bind: 'h2'      },  // 捕获 ## 标题
highlights:        { type: 'content', bind: 'list'     },  // 捕获列表
```

**支持的 bind 类型**：

| bind | 匹配的 MD 块 |
|---|---|
| `h1` / `h2` / `h3` | 一/二/三级标题 |
| `blockquote` | `> ...` 引用块 |
| `ul` | `- ...` 无序列表 |
| `ol` | `1. ...` 有序列表 |
| `list` | 任意列表（ul 或 ol） |
| `code` | `` ``` lang ... ``` `` 代码块 |
| `table` | `\| ... \|` 表格 |
| `paragraph` | 普通段落 |
| `content` | **兜底**：吸收段内所有剩余未被占用的块 |

**匹配规则**：
1. 在 `@use` 之后，按声明顺序匹配 MD 块
2. 已被显式 `@slot:` 提供的 slot **不会再被自动绑定覆盖**
3. 第一轮按具体 bind 类型匹配；第二轮把剩余块喂给 `bind:content` 的 slot

---

## 兜底渲染策略

当 slot 写错或内容找不到归属时，forge 不会静默丢弃，而是兜底渲染：

1. **孤儿 slot**（`@slot:name` 找不到对应组件）：用 clay 左边线 editorial 样式渲染，显示 `@slot:name` 标签
2. **裸 MD 文本**（没有 `@use` 上下文的段落/标题）：用 editorial body 样式渲染，应用品牌包 CSS tokens

> 兜底内容可以正常阅读，但会有视觉提示让你知道哪里需要修正。

---

## 内联语法

| 写法 | 渲染 |
|---|---|
| `**bold**` | **粗体** |
| `*italic*` | *斜体* |
| `` `code` `` | `行内代码` |
| `[文字](url)` | 超链接 |
| `:lucide:zap:` | Lucide 图标 SVG（`zap`、`rocket`、`check` 等） |

---

## 声明式图表

在代码块里用特殊语言标识生成图表：

````md
```flow
用户写 Markdown
  ▼
Lexer · 单遍扫描
  ▼
Emitter → HTML
```

```compare
✅ forge 方式
- MD 保持可读
- 零学习成本

❌ 传统方式
- HTML 混 data
- 难以维护
```

```steps
1. 在 @compose 里声明组件
2. 用 @use 指定内容归属
3. 直接写原生 Markdown
```
````

---

## 优先级总览

```
1. 显式 <!-- @slot:name -->...<!-- @/slot -->         （最高）
2. @item 属性式 key=value                              （group/item 内部）
3. 原生 MD 块按 slot.bind 自动绑定                     （推荐，可读性最好）
4. 兜底渲染（free-text / orphan slot）                  （安全网）
```

---

## 常见问题 FAQ

**Q: `@use` 了但组件没渲染出来**

首先检查 `@compose` 里是否声明了该组件 id。未声明的组件无法被 `@use` 激活。

```md
<!-- @compose: header, body, footer -->   ← 要用 body，必须在这里声明
...
<!-- @use body -->
```

**Q: 内容写了但是空白**

可能是 slot 名写错。比如 `table variant=standard` 需要 `tableContent` slot，
但直接写裸 markdown 表格时，需要组件有 `bind:content` 的 slot 才能自动捕获。
检查方式：临时改用显式 `<!-- @slot:slotName -->` 看是否能正常显示。

**Q: `@slot:heading` 和 `@slot:tableHeading` 有什么区别**

在 `@use table` 上下文里，写 `@slot:heading` 会被自动别名映射到 `tableHeading`。
这是 forge 的"前缀别名"机制：`<componentId> + 首字母大写(slotName)`。

**Q: 在 `@item` 块里的裸 markdown 为什么不工作**

`@item` 块里的内容走的是 group item 路径，不支持 md-binding 自动绑定。
请在 `@item` 块里显式使用 `<!-- @slot:name -->` 语法。

**Q: 同一组件用了两次，内容会合并吗**

不会。每次 `@use` 都创建独立的组件实例。比如两次 `@use table` 会渲染两个独立的表格组件。

**Q: 如何在 `@theme dark` 下显示某个组件**

只需在 `@theme dark` 指令之后写 `@use`，该组件就会在 dark 主题段里渲染：

```md
<!-- @theme dark -->

<!-- @use metric variant=band -->
...
```

**Q: 如何导出不含编辑器代码的干净 HTML**

点击右上角"导出"按钮，选择"独立 HTML"。这会用 `mode: standalone` 编译，
去掉所有交互脚本和编辑器属性，输出可以在任何浏览器单独打开的干净文件。

---

## AI 生成模板：反例与最佳实践

> 本节总结了我们在内置模板迁移过程中踩过的所有坑，列出**错误写法** → **正确写法**的对照。
>
> **特别适合给 AI agent 看**——把这一节贴进 prompt 就能大幅减少 AI 生成错误 forge 语法的概率。

### 核心原则（AI 生成时的铁律）

1. **只能用实际存在的组件**：组件 id 必须与 `forgeRegistry` 中已注册的一致。不存在的组件（如 `slide-deck` / `ticket-card` / `kanban`）会被降级为 MD 兜底渲染，**不会**自动变成组件。
2. **只能用实际存在的 slot 名**：每个组件的 slot 集合是**固定**的。模板里写 `@slot:xxx` 前，务必先确认该 slot 在组件定义中存在。
3. **`@compose` 必须声明所有使用的组件**：未声明的组件无法被 `@use` 激活，其 slot 会变成孤儿。
4. **`@compose` 里**不要**声明未使用的组件**：否则会被自动兜底实例化成一个空组件，出现在页面底部。
5. **布局组件（`layout-grid-*` / `layout-flex-row`）必须配合 `@compose-group` + `@item` 使用**：不能用 `@slot:item-1/2/3` 这种虚构语法。

---

### 常见错误 1：虚构的 slot 名

**❌ 错误**（自己编了一套 `@slot:item-N`）：

```md
<!-- @use layout-grid-3 -->

<!-- @slot:item-1 -->
<!-- @use card variant=standard -->
<!-- @slot:title -->A — Flat<!-- @/slot -->
<!-- @slot:content -->...<!-- @/slot -->
<!-- @/use -->
<!-- @/slot -->
```

**✅ 正确**（用 `@compose-group` + `@item`）：

```md
<!-- @use layout-grid-3 -->

<!-- @compose-group: layout-grid-3 -->

<!-- @item card -->
<!-- @slot:cardTitle -->A — Flat<!-- @/slot -->
<!-- @slot:cardBody -->...<!-- @/slot -->
<!-- @/item -->

<!-- @item card -->
...
<!-- @/item -->

<!-- @/compose-group -->
```

关键点：
- `@compose-group: <layoutId>` 对应外层 `@use` 的布局组件
- `@item <childComponentId>` 指定每个 item 要用哪个组件（如 `card`）
- 在 `@item` 内部用**组件真实的 slot 名**（`cardTitle` / `cardBody`，不是 `title` / `content`）

---

### 常见错误 2：FAQ / 多条 section 用 `@slot:q1 / a1 / q2 / a2`

**❌ 错误**（把多条 Q&A 塞进一个 `@use faq-item`）：

```md
<!-- @use faq-item -->

<!-- @slot:q1 -->Question 1<!-- @/slot -->
<!-- @slot:a1 -->Answer 1<!-- @/slot -->
<!-- @slot:q2 -->Question 2<!-- @/slot -->
<!-- @slot:a2 -->Answer 2<!-- @/slot -->
```

`faq-item` 只有 `faqQ` / `faqA` 两个 slot，不存在 `q1/a1/q2/a2`。

**✅ 正确**（每条 Q&A 一次 `@use`）：

```md
<!-- @use faq-item -->
<!-- @slot:faqQ -->Question 1<!-- @/slot -->
<!-- @slot:faqA -->Answer 1<!-- @/slot -->

<!-- @use faq-item -->
<!-- @slot:faqQ -->Question 2<!-- @/slot -->
<!-- @slot:faqA -->Answer 2<!-- @/slot -->
```

同理适用于 `collapse-section`（每个步骤一次 `@use`，不要写 `item-1-title / item-1-body / item-2-title`）。

---

### 常见错误 3：误用 slot 别名

**❌ 错误**（lead 没有 `heading` 这个 slot，也没有 `leadHeading`）：

```md
<!-- @use lead variant=tldr -->

<!-- @slot:heading -->TL;DR<!-- @/slot -->

This is the summary text...
```

**✅ 正确**（用 `tldr` 真实的 slot；变体自带 "TL;DR" 标签，无需额外标题）：

```md
<!-- @use lead variant=tldr -->

<!-- @slot:tldr -->
This is the summary text...
<!-- @/slot -->
```

**前缀别名规则**：`@slot:heading` 只有当组件有 `<id>Heading` slot 时才会自动映射。例如：
- `@use table` + `@slot:heading` → 映射到 `tableHeading` ✓（table 有此 slot）
- `@use lead` + `@slot:heading` → 不映射（lead 没有 `leadHeading`）
- `@use header` + `@slot:sub` → 不映射（header 的 slot 叫 `subtitle`，不叫 `sub`）

---

### 常见错误 4：`bind` 不匹配导致内容丢失

**❌ 错误**（lead 的 `lead` slot 是 `bind: blockquote`，但写了普通段落）：

```md
<!-- @use lead -->

This is a plain paragraph, not a blockquote.
```

**✅ 正确**（用 blockquote 语法）：

```md
<!-- @use lead -->

> This is a blockquote, which binds to the `lead` slot.
```

**或者**（显式 slot）：

```md
<!-- @use lead -->

<!-- @slot:lead -->
This is a plain paragraph inside an explicit slot.
<!-- @/slot -->
```

**bind 速查表**：

| bind 值 | 能绑定什么 MD 块 |
|---|---|
| `h1` / `h2` / `h3` / `h4` | 对应层级的标题（`#` / `##` / `###` / `####`） |
| `blockquote` | `>` 引用块 |
| `list` | `- item` 无序列表（连续，中间不能有空行） |
| `content` | **任何块**（兜底），包括段落、表格、代码块 |
| `paragraph` | 单个段落 |
| `code` | 围栏代码块（```lang ... ```） |

---

### 常见错误 5：`@item` 块内写裸 markdown

**❌ 错误**：

```md
<!-- @compose-group: layout-grid-2 -->
<!-- @item card -->

## Title inside item
Body paragraph here.

<!-- @/item -->
<!-- @/compose-group -->
```

`@item` 块内的裸 MD **不会**被自动绑定到组件 slot（设计限制，详见 `docs/tech-debt/compiler-known-limitations.md`）。

**✅ 正确**（显式 slot）：

```md
<!-- @compose-group: layout-grid-2 -->
<!-- @item card -->

<!-- @slot:cardTitle -->Title inside item<!-- @/slot -->
<!-- @slot:cardBody -->
Body paragraph here.
<!-- @/slot -->

<!-- @/item -->
<!-- @/compose-group -->
```

---

### 常见错误 6：误用 variant 作为 `@item` 属性

**❌ 错误**（item 的 variant 不会传给子组件，会被当成 slot 值）：

```md
<!-- @item card variant=decision -->
<!-- @slot:cardTitle -->...<!-- @/slot -->
<!-- @/item -->
```

**当前设计**：group item 的子组件统一使用 **default variant**。如果需要不同 variant，在 group 外用独立的 `@use` 写。

**✅ 正确写法之一**（所有 item 同一 variant）：

```md
<!-- @item card -->
<!-- @slot:cardTitle -->...<!-- @/slot -->
<!-- @/item -->
```

**✅ 正确写法之二**（不同 variant 时不用 group）：

```md
<!-- @use card variant=decision -->
<!-- @slot:cardTitle -->Decision A<!-- @/slot -->
<!-- @slot:cardBody -->...<!-- @/slot -->

<!-- @use card variant=ticket -->
<!-- @slot:ticketTitle -->Ticket B<!-- @/slot -->
```

---

### 常见错误 7：`@compose` 里声明了不会用的组件

**❌ 错误**：

```md
<!-- @compose: header, lead, panel, comparison, list-row, code-block, list-item, test-step, progress, footer -->
```

实际模板里只用了 `header / lead / panel / comparison / list-row / list-item / test-step / progress / footer` —— 多声明的 `code-block` 会被自动兜底实例化成一个空组件，出现在页面底部。

**✅ 正确**：`@compose` 列表必须**精确匹配**实际 `@use` 的组件（不多不少）：

```md
<!-- @compose: header, lead, panel, comparison, list-row, list-item, test-step, progress, footer -->
```

---

### 常见错误 8：`table` 的 variant 选错 slot

`table` 组件有两种数据注入方式：

| variant | 用什么 slot | 内容格式 |
|---|---|---|
| `standard` | `tableContent` | 标准 Markdown 表格 |
| `risk` / `impact` / `flag` | `tableData` | 管道分隔 `A\|B\|C` 每行一条 |

**❌ 错误**（standard variant 用 tableData）：

```md
<!-- @use table variant=standard -->

<!-- @slot:tableData -->
Metric|Value
Latency|184ms
<!-- @/slot -->
```

`standard` variant 下 `.table-data { display: none }` —— 内容在 DOM 里但看不见！

**✅ 正确**：

```md
<!-- @use table variant=standard -->

<!-- @slot:heading -->Metrics<!-- @/slot -->

| Metric | Value |
|---|---|
| Latency | 184ms |
```

---

### 直接嵌入 SVG / 自定义 HTML 块

用户可以在任意 `bind: content` 的 slot 里**直接写 SVG / HTML 块**，编译器会原样透传（不会被 `&lt;` / `&gt;` 转义）。

支持场景：
- **品牌 logo**：在 header 的 subtitle 或自定义组件里嵌 inline SVG
- **示意图 / 插图**：在 illustration 或 panel 的 body 里嵌 SVG（无需外部资源）
- **自定义容器**：用 `<figure>` / `<aside>` / `<section>` / `<details>` 包裹混排内容

**支持的顶层 HTML 块标签**（在 simpleMdToHtml 中被识别为"原样透传"）：

```
svg, figure, aside, section, article, div, details, summary
```

**示例**：

```md
<!-- @use illustration variant=frame -->

<!-- @slot:frameTitle -->Queue<!-- @/slot -->
<!-- @slot:frameSub -->FIFO worker pool<!-- @/slot -->

<!-- @slot:frameSvg -->
<svg width="720" height="320" viewBox="0 0 720 320" aria-hidden="true">
  <rect x="60" y="110" width="70" height="100" rx="10" fill="#F0EEE6" stroke="#3D3D3A" stroke-width="1.5"/>
  <text x="95" y="164" text-anchor="middle" font-family="ui-monospace, monospace" font-size="11">job 5</text>
  <!-- ...更多元素... -->
</svg>
<!-- @/slot -->
```

**安全清洗**：所有透传的 HTML/SVG 会经过 DOMPurify 清洗，移除 `<script>`、`onclick=` 等不安全属性，但保留 SVG 的所有结构属性（`d`、`viewBox`、`stroke`、`fill`、`x`、`y`、`transform` 等约 50 项）和动画标签（`animate`、`animateTransform` 等）。

**注意事项**：

1. SVG 必须是**单个完整闭合**的块。多行 SVG 起始行必须是 `<svg ...>`，结束行必须是 `</svg>`
2. 不要在 SVG 之前留 `<!-- @slot:xxx -->` 之外的引导文字（会被识别成段落）
3. 推荐用品牌包 token 的 hex 值（`#FAF9F5` 而非 `var(--ivory)`）—— SVG 内部 CSS 变量在静态导出时不会解析

---

### 常见错误 9：HTML 注释装饰符被误渲染

**以前的 bug**：写 `<!-- ─── header ─── -->` 作为装饰分隔线会出现在页面底部的兜底区。

**当前行为**：forge lexer 会**静默丢弃**所有非 forge 指令的 HTML 注释，所以这类装饰符**不会**污染最终 HTML。可以放心使用，但注意别用 `<!-- @xxx -->` 这种 `@` 开头的——会被当成 forge 指令尝试解析。

---

### 常见错误 10：metric `band` variant 的三个 slot 顺序

**❌ 错误**（用裸 markdown 混写）：

```md
<!-- @use metric variant=band -->

14
PRs merged
+3 vs wk10

6
Deploys
±0
```

metric band variant 没有 `bind: content` 的 slot，裸 MD 不会被接收。

**✅ 正确**（显式三个 slot，每行对应一张卡片）：

```md
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
```

三个 slot 的**行数必须一致**（一行 = 一张卡片）。

---

### AI 生成 forge 模板的检查清单

给 AI 的 prompt 建议包含以下检查项：

1. [ ] `@compose` 列表 = 实际用到的组件集合（不多不少）
2. [ ] 所有 `@use <id>` 的 `<id>` 都在 `forgeRegistry.getAllComponents()` 中存在
3. [ ] 所有 `@slot:<name>` 的 `<name>` 都是目标组件的实际 slot 名
4. [ ] 布局组件用 `@compose-group` + `@item` 组合，**不用** `@slot:item-N`
5. [ ] 同一 variant 内多条记录（FAQ / timeline entries / steps）用**多次 `@use`**，**不**用 `<id>1 / <id>2` 虚构 slot
6. [ ] `lead variant=lead` 的内容用 `>` blockquote，或显式 `<!-- @slot:lead -->`
7. [ ] `table variant=standard` 用 `tableContent` + Markdown 表格语法
8. [ ] `table variant=risk/impact/flag` 用 `tableData` + 管道分隔格式
9. [ ] `metric variant=band` 需要 `metricValue/metricLabel/metricDelta` 三个等长列表
10. [ ] 每个组件的 slot 命名遵循 `<id><SlotName>` 规则（如 card → `cardTitle/cardBody`）

### 组件 slot 名速查

可用组件及其**所有** slot 名，请参阅本文档上方"组件目录"章节，或直接读源码：
`src/builtin/components/<category>/<name>.forge.md` 的 `## Slots` 块。

**常用组件的 slot 清单（高频踩坑点）**：

- `header`: `eyebrow / subtitle / badge / date / author`（**不是** `sub` / `title` / `meta`）
- `card` (default standard): `cardIcon / cardTitle / cardBody / cardLink / cardLinkText`
- `table`: `tableHeading / tableContent / tableData`（不是 `title` / `content`）
- `lead`: `lead / tldr`（只有这两个；变体 `tldr` 固定显示 "TL;DR" 标签）
- `panel`: `panelTitle / panelBody / panelData`（`panelTitle` bind 是 `h3`）
- `meta-pills`: `pills`（单个 slot，内容为 `text|type` 每行一条）
- `collapse-section`: `sectionTitle / sectionWhere / sectionBody`（**不是** `sectionMeta`）
- `faq-item`: `faqQ / faqA`
- `illustration` (variant=frame): `frameTitle / frameSub / frameSvg`（没有 `caption` / `meta`）
- `timeline`: `timelineHeading / timelineBody / timelineEntry`
- `code-block` (variant=diff): `diffContent`（没有 `heading` / `filename`）
- `code-block` (variant=walkthrough): `stepNum / stepLoc / stepRange / stepHot / stepBody / stepCode`
- `metric` (variant=band): `metricValue / metricLabel / metricDelta`（三个等长列表）
- `progress` (variant=bars): `barsHeading / barsItems`（items 格式：`Name|Percent|Note`）
