# md-html-forge 渲染规范（forge.md）

> 本文档是系统提示词的一部分。AI 必须按此规范产出 Markdown，md-html-forge 引擎才能正确渲染。
> 版本：2026-05-10

---

## 1. What is forge

md-html-forge 是一个 Markdown 渲染引擎。你（AI）的职责是：产出符合本规范的 Markdown 文件，引擎会自动把它渲染成带样式、可交互的 HTML。

你不需要写 HTML、不需要写 CSS、不需要写 JS。你写的永远是 Markdown，外加 HTML 注释形式的指令（`<!-- @xxx -->`）。引擎负责把指令和 Markdown 内容映射到对应的组件上。

---

## 2. 核心约束

✅ **必须做的事**

- 所有 forge 扩展指令必须是 HTML 注释：`<!-- @use card -->`
- 内容本身永远是原生 Markdown（标题、列表、段落、表格、代码块）
- 用 `@use` 指令把接下来的 Markdown 块绑定到指定组件
- 组件变体通过 `variant=xxx` 声明，不写则使用默认变体
- data slot 必须用 `|` 分隔列，每行一条记录
- 源文件必须在任何 Markdown 编辑器里打开后依然可读

❌ **不要做的事**

- 不要手写 HTML 标签（如 `<div class="card">`）
- 不要把内容藏在注释属性里（`<!-- @use card title="xxx" -->` 是错的）
- 不要在一个 `@use` 之后放不属于该组件的内容
- 不要发明文档里没有的指令或组件 id
- 不要硬编码颜色、字体、阴影（引擎用 token 系统处理）

**反例：**

```markdown
<!-- ❌ 错：内容藏在注释属性里 -->
<!-- @use card title="API 文档" body="这是描述" -->

<!-- ❌ 错：手写 HTML -->
<div class="feature-card">
  <h3>标题</h3>
</div>

<!-- ❌ 错：@use 之后混了不属于它的内容 -->
<!-- @use card -->
### 卡片标题
这是卡片内容。

## 这个 h2 不属于 card，但上面没有新的 @use
```

**正例：**

```markdown
<!-- ✅ 对：用原生 Markdown 表达内容 -->
<!-- @use card -->
### API 文档
这是描述。
```

---

## 3. 指令清单

### 3.1 `@page` — 页面级配置

写在文档最顶部，只出现一次。

```markdown
<!-- @page width=wide band=full-bleed -->
```

| 属性 | 说明 | 常用值 |
|---|---|---|
| `width` | 页面内容区最大宽度 | `narrow` `default` `wide` `xwide` `full` |
| `band` | 主题段背景是否铺满视口 | `contained`（默认）`full-bleed` |

不写 `@page` 时，默认 `width=default band=contained`。

**反例：**

```markdown
<!-- ❌ 错：放在文档中间 -->
# 标题
<!-- @page width=wide -->
```

### 3.2 `@compose` — 声明文档使用的组件

写在 `@page` 之后，列出本文档会用到的组件 id，顺序即渲染顺序。

```markdown
<!-- @compose: header, body, card, checklist, footer -->
```

同一组件可以出现多次（引擎按段切割自动分配）。

**反例：**

```markdown
<!-- ❌ 错：用了 @use 但没在 @compose 里声明 -->
<!-- @compose: header, body -->
<!-- @use checklist -->
```

### 3.3 `@layout` — 段级布局

切割文档为段，从该指令开始到下一个 `@layout`/`@theme` 之前。

```markdown
<!-- @layout: stack -->
<!-- @layout: grid-3 -->
<!-- @layout: flex-row -->
```

常用布局：`stack`（垂直堆叠）、`grid-2` `grid-3` `grid-4`（网格）、`flex-row`（水平排列）。

### 3.4 `@theme` — 段级主题

从该指令开始到下一个 `@theme`/`@layout` 之前，所有组件使用指定主题。

```markdown
<!-- @theme: editorial -->

# 这一段用 editorial 主题

<!-- @theme: dark -->

这一段用 dark 主题。
```

### 3.5 `@use` — 绑定组件

把接下来的 Markdown 块绑定到指定组件。引擎按 slot 的 `bind` 规则自动匹配。

```markdown
<!-- @use card -->
### 卡片标题          ← 自动绑定 cardTitle（bind: h3）
卡片描述段落。         ← 自动绑定 cardBody（bind: content）
```

**反例：**

```markdown
<!-- ❌ 错：没有内容块 -->
<!-- @use card -->
<!-- @use checklist -->
```

### 3.6 `@slot:name` — 显式 slot 内容

当自动绑定不够用，或需要内联 markdown 时，用显式 slot。

```markdown
<!-- @slot:cardMeta -->2026-05-10<!-- @/slot -->

<!-- @slot:cardBody -->
一段含 **加粗** 和换行的
富文本内容。
<!-- @/slot -->
```

### 3.7 `@compose-group` / `@item` — 循环多个组件

同一布局下循环多个同类或不同类组件。

```markdown
<!-- @compose-group layout-grid-3 -->

<!-- @item card -->
<!-- @slot:cardTitle -->卡片一<!-- @/slot -->
<!-- @slot:cardBody -->描述一<!-- @/slot -->
<!-- @/item -->

<!-- @item card -->
<!-- @slot:cardTitle -->卡片二<!-- @/slot -->
<!-- @slot:cardBody -->描述二<!-- @/slot -->
<!-- @/item -->

<!-- @/compose-group -->
```

**紧凑属性式**（仅用于纯 text slot 简写）：

```markdown
<!-- @compose-group layout-grid-3 -->
<!-- @item card cardTitle="卡片一" cardBody="描述一" --><!-- @/item -->
<!-- @item card cardTitle="卡片二" cardBody="描述二" --><!-- @/item -->
<!-- @/compose-group -->
```

---

## 4. 变体使用

通过 `@use <component> variant=<id>` 切换变体。

```markdown
<!-- @use card variant=compact -->
### 紧凑卡片
紧凑展示。

<!-- @use card variant=detailed -->
### 详细卡片
带附加信息的展示。
```

不写 `variant=` 时使用组件的 `defaultVariant`（缺省即第一个变体）。

**反例：**

```markdown
<!-- ❌ 错：变体 id 不存在 -->
<!-- @use card variant=mini -->
```

---

## 5. 组件清单

### 5.1 原子组件（17 个）

每个组件对应一个 `.forge.md` 文件，可通过 `@use <id>` 引用，通过 `variant=<id>` 切换样式。

#### card 类
| 组件 id | 用途 | 变体 |
|---|---|---|
| `card` | 通用卡片 | `standard` `stat` `decision` `ticket` |
| `info-panel` | 信息面板（方案 / 详情 / 样例） | `approach` `variant` `detail` `sample` |

#### list 类
| 组件 id | 用途 | 变体 |
|---|---|---|
| `list-item` | 列表项 | `shipped` `carryover` `focus` `action` |
| `list-row` | 表格行（紧凑） | `pr` `file` `entry` |
| `timeline` | 时间线 | `standard` `milestones` `incident` |

#### data 类
| 组件 id | 用途 | 变体 |
|---|---|---|
| `metric` | KPI 指标 | `band` `kpi` `slide` |
| `pr-summary` | PR 总览头 | `standard` `keyfiles` |
| `table` | 表格类（Markdown 表格或 data DSL） | `standard` `risk` `impact` `flag` |

#### visual 类
| 组件 id | 用途 | 变体 |
|---|---|---|
| `callout` | 提示块 | `concept` `note` `questions` `recommendation` |
| `panel` | 信息面板（代码片段 / 术语表 / 提示框） | `snippet` `glossary` `prompt` |
| `progress` | 进度展示 | `bars` `item` `rollout` |
| `chip` | 胶囊标签 | `risk` `incident` `legend` |
| `code-block` | 代码区 | `diff` `walkthrough` |
| `comparison` | 对比 | `ba` `options` `mockup` |
| `design-spec` | 设计规范展示 | `swatch` `spacing` `radius` `keyframe` |
| `illustration` | SVG 插图 / 注释 | `frame` `notes` |

#### summary 类
| 组件 id | 用途 | 变体 |
|---|---|---|
| `lead` | 导语 / TLDR / Phase 头 | `lead` `tldr` `phase` |

### 5.2 非原子组件（保留为单一组件，无变体）

以下组件结构特殊，未合并为变体形式，按 `@use <id>` 直接使用：

| 组件 id | 用途 |
|---|---|
| `header` | 文档头部 |
| `meta-pills` | 元信息胶囊 |
| `body` | 正文容器 |
| `code` | 代码块容器 |
| `qa` | Q&A 块 |
| `checklist` | 待办清单 |
| `actions` | 行动项列表 |
| `collapse-section` | 可折叠段落 |
| `faq-item` | FAQ 项 |
| `highlights` | 亮点列表 |
| `setup-steps` | 步骤列表 |
| `slide-agenda` | 幻灯片议程 |
| `test-step` | 测试步骤 |
| `type-scale-row` | 字号样例行 |
| `slide-cover` | 幻灯片封面 |
| `footer` | 页脚 |
| `review-comment` | Review 评论 |
| `drag-list-item` | 可拖拽列表项 |

### 5.3 已弃用 / 已合并的旧组件名（不要再使用）

以下组件名在历史版本里存在，现已合并到 5.1 原子组件，**继续写这些 id 会导致渲染失败**：

- `feature-card` `stat-card` `approach-card` `variant-card` `decision-card` `detail-panel` `sample-card` `ticket-card` → 改用 `card`（按场景选 variant）
- `ship-item` `carryover-item` `focus-item` `action-row` → 改用 `list-item`
- `shipped-row` `file-changed-row` `file-entry` → 改用 `list-row`
- `concept-callout` `callout-note` `warn-banner` `open-questions` `recommendation` → 改用 `callout`
- `snippet-panel` `glossary-panel` `prompt-box` → 改用 `panel`
- `risk-table` `impact-table` `flag-row` → 改用 `table`
- `milestones` `incident-timeline-entry` → 改用 `timeline`
- `metrics` `summary-band` `slide-metric` → 改用 `metric`
- `key-files` → 改用 `pr-summary` 的 `keyfiles` 变体
- `before-after` `options` `mockup-card` → 改用 `comparison`
- `progress` `rollout` `prog-item` → 改用 `progress`（不同 variant）
- `risk-chip` `incident-pill` `flow-legend` → 改用 `chip`
- `diff-block` `code-walkthrough` → 改用 `code-block`
- `token-swatch` `spacing-grid` `radius-sample` `animation-keyframe` → 改用 `design-spec`
- `svg-frame` `interaction-notes` → 改用 `illustration`
- `tldr` `phase-header` → 改用 `lead`

---

## 6. Slot 用法

组件通过 slot 接收内容。slot 有 3 种类型：

### 6.1 `text` — 单行文本

用于标题、徽章、日期、数值等。

```markdown
<!-- @slot:cardTitle -->API 延迟优化<!-- @/slot -->
```

**场景**：卡片标题、指标数值、标签文字。

### 6.2 `content` — 块级 Markdown

用于段落、列表、引用、代码块、表格等完整 Markdown 内容。

```markdown
<!-- @slot:cardBody -->
- 优化了连接池配置
- p95 从 320ms 降到 184ms
<!-- @/slot -->
```

**场景**：卡片描述、折叠段落正文、提示框内容。

### 6.3 `data` — 结构化数据

组件自己解析的原始数据，不经过 Markdown 渲染。

**反例：**

```markdown
<!-- ❌ 错：data slot 里写 Markdown 表格 -->
<!-- @slot:riskRows -->
| Risk | Sev | Mitigation |
|---|---|---|
| ... | ... | ... |
<!-- @/slot -->
```

---

## 7. Data Slot 的统一 DSL

所有 `type: data` 的 slot，统一使用以下格式：

- 每行一条记录
- 列之间用 `|` 分隔
- 不要表头，不要 Markdown 表格语法

```markdown
<!-- @slot:impactRows -->
Requests failed (502)|~41,200
Peak error rate|21.4%
Users affected|~2,300 workspaces
<!-- @/slot -->

<!-- @slot:riskRows -->
Race condition on socket append|high|Dedupe on server-assigned id
Unread counts go stale|med|Broadcast comment_reads upserts
Mention detection false-positives|low|Resolve mentions against workspace members
<!-- @/slot -->
```

如果列含义需要说明，在组件文档或 slot 的 `description` 里写清楚。

---

## 8. 主题

### 8.1 内置主题

| 主题 id | 气质 | 用途 |
|---|---|---|
| `editorial` | 米色底 + 深色文字 + 红橙强调（`#D97757`） | 默认，文档/文章 |
| `dark` | 深色底 + 白色文字 + 蓝绿强调（`#5EEAD4`） | 数据 dashboard / code |
| `sage` | 橄榄绿 + 米色 + 深绿（`#788C5D`） | 自然 / 友好 |

切换方式：

```markdown
<!-- @theme: dark -->

# 这一段全部渲染为 dark 主题
```

### 8.2 自定义主题提示

如果用户要求品牌定制，不要手写主题 CSS。告诉用户：「主题通过引擎的品牌包功能配置，支持自定义颜色、字体、logo。」你只需正常写 Markdown，引擎会按品牌包渲染。

---

## 9. 典型场景示例

### 9.1 周报

```markdown
<!-- @page width=wide -->
<!-- @compose: header, body, checklist, table, footer -->
<!-- @theme: editorial -->

<!-- @use header -->
# Engineering Weekly · May 5–9
## 本周交付 4 项，无 P0 事故

<!-- @use body -->
### 关键指标

- API p95 延迟：**184ms**（↓ 12%）
- 错误率：**0.03%**
- 部署次数：**23**

<!-- @use checklist -->
## 下周计划

- [ ] Redis 连接池上限调整上线
- [ ] 新用户引导 A/B 测试数据 review
- [ ] 文档站点 SEO 优化

<!-- @use table -->
## 已发布 PR

| PR | Title | Author | Impact |
|---|---|---|---|
| #1240 | Move session store to Redis | @bob | p1 |
| #1244 | Worker graceful shutdown | @chen | p1 |
```

### 9.2 PR Review

```markdown
<!-- @page width=wide -->
<!-- @compose: pr-summary, body, risk-table, checklist -->
<!-- @theme: editorial -->

<!-- @use pr-summary -->
<!-- @slot:prRepo -->birchline/web · Pull Request #247<!-- @/slot -->
# Add optimistic updates to task list mutations
<!-- @slot:prAuthor -->Mira Okafor<!-- @/slot -->

<!-- @use body -->
## What this PR does

- Replaces await-then-refetch with optimistic cache writes.
- Introduces `useOptimisticTasks` hook.

<!-- @use risk-table -->
## 风险评估

<!-- @slot:riskRows -->
Race condition on socket append|high|Dedupe on server-assigned id
Unread counts go stale|med|Broadcast comment_reads upserts
<!-- @/slot -->

<!-- @use checklist -->
## Suggested next steps

- [ ] Add `await qc.cancelQueries(key)` at top of `onMutate`
- [ ] Move idempotency-key generation into mutation context
```

### 9.3 事故报告

```markdown
<!-- @page width=wide -->
<!-- @compose: header, body, impact-table, timeline, action-row -->
<!-- @theme: editorial -->

<!-- @use header -->
# Incident Report · Redis connection pool exhaustion
## 2026-05-08 · 14:02–14:44 · Resolved

<!-- @use impact-table -->
## Impact

<!-- @slot:impactRows -->
Requests failed (502)|~41,200
Peak error rate|21.4%
Users affected|~2,300 workspaces
Data loss|None — clients retried
SLA breach|No (within monthly budget)
<!-- @/slot -->

<!-- @use timeline -->
## Timeline

- `14:02` · 监控触发 **p95 飙到 3.2s**
- `14:08` · 定位到 Redis 连接池耗尽
- `14:14` · 回滚上一版配置
- `14:44` · **全量恢复**

<!-- @use action-row -->
## Action items

- [ ] Revert cfg-9a12 and restore pool limit — DP — Apr 12
- [ ] Add connection pool alert threshold — LK — Apr 15
```

### 9.4 产品说明

```markdown
<!-- @page width=wide -->
<!-- @compose: header, body, card, footer -->
<!-- @theme: sage -->

<!-- @use header -->
# md-html-forge
## AI 产出的最佳渲染器

<!-- @use body -->
## 核心能力

- AI 完成 99% 内容创作
- 用户手改 1%（内容 + 审美）
- 输出可交互 HTML

<!-- @compose-group layout-grid-3 -->

<!-- @item card -->
### 极速渲染
从 Markdown 到样式 HTML，纯前端、零后端。
<!-- @/item -->

<!-- @item card -->
### 双向同步
预览里点击、编辑、拖拽，变化自动回写 MD。
<!-- @/item -->

<!-- @item card -->
### 品牌包
沉淀审美选择，下次同样内容，同样样式出去。
<!-- @/item -->

<!-- @/compose-group -->
```

---

## 10. 快速检查清单

写完一份文档后，对照以下清单自查：

- [ ] 所有 `@use` 的组件都在 `@compose` 里声明过
- [ ] 没有手写 HTML 标签
- [ ] 没有内容藏在注释属性里
- [ ] data slot 使用 `|` 分隔，不是 Markdown 表格
- [ ] 源文件在纯文本编辑器里打开依然可读
- [ ] 变体 id 是组件文档里列出的有效值
