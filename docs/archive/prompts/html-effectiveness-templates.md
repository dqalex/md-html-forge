# Agent 任务：把 `html-effectiveness` 20 个 HTML 还原为 md-html-forge 模板

## 背景

`src/templates/html-effectiveness/` 下有 20 份高质量单页 HTML（编号 `01..20`），
是 [html-effectiveness](https://github.com/ThariqS/html-effectiveness) 项目的精选作品。
它们是 md-html-forge 产品灵感的源头，也是视觉基准。

现在要把它们还原成 md-html-forge 的**模板**（TemplateDef），让用户选中模板后，
仅通过「已有组件 + @compose + @slot」就能渲染出近似原版的版式与内容。

## 你的角色

你是**一个负责 1 个模板**的 agent。本任务会分配 20 次，每次我会告诉你要做哪一号（例如 "做 #11 状态报告"）。
**不要主动做多个**。

## 输入

- `src/templates/html-effectiveness/<NN>-<name>.html` —— 原 HTML 源文件
- `src/builtin/components/` —— md-html-forge 内置组件库（见下方清单）
- `src/builtin/templates/index.ts` —— 现有 8 个模板示例

## 产出要求

### 1. 一个模板条目（追加到 `src/builtin/templates/index.ts` 的 `BUILTIN_TEMPLATES` 数组末尾）

```ts
makeTemplate({
  id: 'he-11-status-report',           // 前缀统一 he-<编号>-<kebab-slug>
  name: '工程状态周报（Birchline）',    // 中文友好名
  description: '一句话说明：3-4 列指标 + 亮点 + 交付表 + 结转清单',
  emoji: '📊',                          // 留着向后兼容，UI 实际用 icon
  icon: 'BarChart3',                    // 见下方「可用图标」
  color: 'var(--color-clay-100)',       // 见下方「徽标配色」
  group: 'report',                      // 'research' | 'report' | 'code-review' | 'plan' | 'playground'
  componentIds: ['header', 'summary-band', 'highlights', 'table', 'actions', 'footer'],
  docTitle: 'Birchline · Engineering Status · Week 11',  // 注入 header title 的默认值
}),
```

如果原 HTML 有内置组件覆盖不到的布局（例如 10-svg-illustrations / 13-flowchart-diagram 的
专属画布），**不要自己写 customComponents**。按下面说明走：

### 2. 如果需要新组件：在 TemplateDef 上加 `missingComponents` 字段

```ts
makeTemplate({
  id: 'he-10-svg-illustrations',
  // ... 其他字段 ...
  componentIds: ['header', 'lead', /* 暂时先用现有组件拼一个最小能用的版本 */],
  docTitle: '...',
}),
// 然后在 BUILTIN_TEMPLATES 声明后手动补一行：
BUILTIN_TEMPLATE_MAP.get('he-10-svg-illustrations')!.missingComponents = [
  'illustration-gallery',   // 这个组件名由你拍定，要用 kebab-case
  'svg-annotation-strip',
];
```

（或者更简单：在 `makeTemplate` 返回对象里直接赋值，见"实现提示"章节）

`missingComponents` 是**后续独立任务的输入**，我们下一轮再补组件。

### 3. 生成 starter MD：**不要**调用 `generateStarterMarkdown()`

它只能吐骨架 / 标准 sample；`html-effectiveness` 每个模板都有具体的真实文案（人物名、时间戳、
数据等），我们**要保留这些文案**让模板一眼就像原版。

手写 starter MD，直接写在 `makeTemplate` 的第三个参数位置或重构 `makeTemplate` 支持
`starterMarkdown` 显式传入。

推荐：**在 `makeTemplate` 的 `args` 上加一个可选字段 `starterMarkdown?: string`**，
优先用显式值；空时 fallback 到生成器。

```ts
function makeTemplate(args: {
  id: string; name: string; description: string;
  emoji: string; icon: string; color: string;
  group: TemplateDef['group'];
  componentIds: string[];
  docTitle: string;
  starterMode?: StarterMode;
  starterMarkdown?: string;   // ← 新增
  missingComponents?: string[]; // ← 新增
}): TemplateDef {
  return {
    id: args.id,
    // ...
    starterMarkdown: args.starterMarkdown
      ?? generateStarterMarkdown(args.componentIds, args.docTitle, BUILTIN_COMPONENTS, args.starterMode ?? 'sample'),
    missingComponents: args.missingComponents,
  };
}
```

## 可用内置组件（**牌池**）

### header 类
- `header` — 标题 + eyebrow + date + author 等（最常用的文档头）
- `meta-pills` — 状态 pill 条（INCIDENT / RESOLVED 这种）

### summary 类
- `summary-band` — 4 列指标带，适合周报 / 数据看板的顶部
- `tldr` — Too long; didn't read 摘要块
- `lead` — 大字导语段

### data 类
- `metric` — 大数字指标卡（变体：band / card / inline）
- `table` — 表格（variants: impact / delivered / carryover）
- `pr-summary` — PR 概览块

### content 类
- `body` — 通用 markdown 正文段
- `code` — 代码段（基础）
- `code-block` — 语法高亮 + 行号代码块
- `qa` — Q&A 对话式段

### card 类
- `card` — 通用卡片（variants: standard / stat / ticket）
- `info-panel` — 带图标的信息面板

### list 类
- `highlights` — 亮点条目列表
- `actions` — 行动项清单
- `checklist` — 带复选框的清单
- `list-item` — 通用列表项（可循环）
- `list-row` — 带左中右三栏的行式列表
- `timeline` — 时间线（variants: standard / milestones / incident）
- `faq-item` / `review-comment` / `setup-steps` / `test-step`

### visual 类
- `callout` — 提示/警告/备注框（variants: note / warning / concept）
- `progress` — 进度条（variants: bars / pie）
- `comparison` — Before / After 对比
- `design-spec` — 设计规范（token / keyframe / measurements）
- `chip` — 徽标（variants: risk / status）
- `panel` — 带标题的引用面板（variants: prompt / quote）
- `illustration` — 基础 SVG 插图容器
- `rollout` — 发布节奏条
- `before-after` — 前后对比（较 comparison 更简）
- `options` — 方案对比表
- `milestones` — 里程碑列

### layout 类
- `layout-flex-row` / `grid-2` / `grid-3` / `grid-4` — 容器，内部 @item 子组件

### special 类
- `slide-cover` / `slide-agenda` — 演示封面 / 议程

### footer 类
- `footer` — 文档页脚

### forge 类（存在但未必每个都覆盖）
另有 17 个 `.forge.md` 组件（`card` / `table` / `timeline` 等其实这里有更丰富的变体），
实际可用 id 请 `grep -rE "^id: " src/builtin/components/**/*.forge.md` 查。

## 写 starter MD 的规范

```markdown
<!-- @page wide -->
<!-- @compose: header, summary-band, highlights, table, actions, footer -->
<!-- @theme editorial -->

<!-- ─── header ─── -->
<!-- @use header -->

# Birchline · Engineering Status

## Week 11 — Infrastructure stabilization

<!-- @slot:eyebrow -->WEEKLY · INTERNAL<!-- @/slot -->
<!-- @slot:date -->2025-03-14<!-- @/slot -->
<!-- @slot:author -->@alex / Platform team<!-- @/slot -->


<!-- ─── summary-band ─── -->
<!-- @use metric variant=band -->

184ms
p95 API 延迟
↓ 12% wk/wk

...
```

**要点：**
1. 顶部必写 `@compose:` 列出本模板用到的组件 id，顺序 = 渲染顺序
2. 每个组件前加 `<!-- ─── <组件名> ─── -->` 注释，便于阅读
3. 组件用 `<!-- @use <id> [variant=xxx] -->` 激活
4. slot 填充用 `<!-- @slot:name -->内容<!-- @/slot -->`
5. 可切 `@theme dark` / `@theme editorial` 做主题段（原 HTML 若有深色段则切换）
6. 文本**保留原 HTML 里的真实数据**（人物名、日期、具体数字），不要改成 lorem
7. `@page` 宽度：参考原 HTML 的 `max-width`（常见：860px → narrow，1080px → wide，
   1240px / 1360px → xwide）

## 可用图标（TemplatePicker 识别的 lucide 名）

- `FileText` / `File` — 文档 / 空白
- `BarChart3` / `LineChart` — 报告 / 看板
- `Flame` — 事故 / 热点
- `ClipboardList` — 计划 / 待办
- `GitPullRequest` — PR / review
- `BookOpen` — 讲解 / 研究
- `Scale` — 决策
- `LayoutTemplate` — 兜底
- `User` — 用户模板

不在上表的 lucide 图标名**不会被渲染**（会回退到 LayoutTemplateIcon）。
如需新图标，顺便在 `src/components/markdown-editor/TemplatePicker.tsx` 和
`src/components/app/AppHeader.tsx` 的 `ICON_MAP` 里加一行。

## 徽标配色（CSS var 或 hex）

- `var(--accent-soft)` / `var(--color-clay-100)` — 米橙
- `var(--color-ivory-200)` / `var(--color-ivory-300)` — 中性米
- `#FED7AA` 橙 / `#FEF3C7` 黄 / `#D1FAE5` 绿 / `#DBEAFE` 蓝 / `#E0E7FF` 靛 / `#F3E8FF` 紫 / `#FCE7F3` 粉

## 20 个模板一览（选你分到的那个）

| # | 原文件 | 建议 id | 建议 name | 建议 group | 建议 icon | 特殊提示 |
|---|---|---|---|---|---|---|
| 01 | exploration-code-approaches | `he-01-code-approaches` | 代码方案探索 | code-review | `GitPullRequest` | 三方案对比 → `options` + `code-block` |
| 02 | exploration-visual-designs | `he-02-visual-designs` | 视觉方向探索 | research | `LayoutTemplate` | 4 列视觉草图 → `grid-4` + `illustration`；可能缺"sketch-card" → 写入 missingComponents |
| 03 | code-review-pr | `he-03-pr-review` | PR 评审摘要 | code-review | `GitPullRequest` | `pr-summary` + `review-comment` + `diff-block`(缺) |
| 04 | code-understanding | `he-04-code-understanding` | 代码流程讲解 | research | `BookOpen` | 流程图可能缺 "flow-diagram"，先用 `callout` + `code-block` 凑 |
| 05 | design-system | `he-05-design-system` | 设计系统参考 | research | `BookOpen` | 有 token 表格、`type-scale-row`、`design-spec` |
| 06 | component-variants | `he-06-component-variants` | 组件变体矩阵 | research | `LayoutTemplate` | `grid-3` + `card` 多 variant |
| 07 | prototype-animation | `he-07-animation-spec` | 动画规范 | plan | `ClipboardList` | `design-spec variant=keyframe` |
| 08 | prototype-interaction | `he-08-interaction-spec` | 交互原型 | plan | `ClipboardList` | 可能缺 "drag-list-item"（实际已有！） |
| 09 | slide-deck | `he-09-slide-deck` | 演示稿（deck） | playground | `LayoutTemplate` | `slide-cover` + `slide-agenda` + 多 section |
| 10 | svg-illustrations | `he-10-svg-illustrations` | SVG 插画画廊 | playground | `LayoutTemplate` | 缺 "illustration-gallery"，写入 missingComponents |
| 11 | status-report | `he-11-status-report` | 工程周报 | report | `BarChart3` | **参考现有 `status-report` 模板但内容用 Birchline Week 11** |
| 12 | incident-report | `he-12-incident-report` | 事故复盘 | report | `Flame` | `meta-pills` + `tldr` + `timeline variant=incident` + `table` |
| 13 | flowchart-diagram | `he-13-flowchart` | 流程图带注解 | plan | `ClipboardList` | 缺 "flowchart-canvas"，写入 missingComponents |
| 14 | research-feature-explainer | `he-14-feature-explainer` | 特性讲解（feature） | research | `BookOpen` | `lead` + `body` + `qa` + 可能的 `callout` |
| 15 | research-concept-explainer | `he-15-concept-explainer` | 概念讲解（interactive） | research | `BookOpen` | 原 HTML 有交互，静态还原用 `illustration` 占位 |
| 16 | implementation-plan | `he-16-impl-plan` | 实施计划 | plan | `ClipboardList` | 参考现有 `impl-plan` 结构 |
| 17 | pr-writeup | `he-17-pr-writeup` | PR 说明 | code-review | `GitPullRequest` | 参考现有 `pr-writeup` |
| 18 | editor-triage-board | `he-18-triage-board` | Triage 看板 | playground | `LayoutTemplate` | 缺 "kanban-column"，写入 missingComponents |
| 19 | editor-feature-flags | `he-19-feature-flags` | 功能开关清单 | report | `LineChart` | `table` + `chip` 多 variant |
| 20 | editor-prompt-tuner | `he-20-prompt-tuner` | 提示词调优 | playground | `LayoutTemplate` | `panel variant=prompt` + 多段对比 |

## 实现步骤

1. **读原 HTML**（`src/templates/html-effectiveness/<NN>-xxx.html`）
2. **识别结构**：把原页面按视觉分段 → 每段映射到一个内置组件
3. **选定 `componentIds` 数组**（按自上而下的渲染顺序）
4. **写 starter MD**：覆盖每个组件的关键 slot，保留原 HTML 的真实文案
5. **在 `BUILTIN_TEMPLATES` 数组末尾插入** `makeTemplate({ ... })` 条目（并传 `starterMarkdown`）
6. **若有缺失组件**：在条目上加 `missingComponents: ['xxx-yyy']` 列表
7. **必要时扩 `makeTemplate`**：如上文所述，给 `args` 加 `starterMarkdown?` / `missingComponents?`
   （只有第一个做模板的 agent 需要做这一步，后续 agent 发现已扩展就直接用）

## 验收

- `npx tsc --noEmit` 通过
- `npx next build` 通过
- 手动打开 dev server：顶部模板选择器能看到你新增的模板，点击后编辑器加载 starter MD，
  预览区能渲染出**和原 HTML 视觉近似**的版面
- 如果写了 `missingComponents`，在 PR 描述里说明"需要后续补的组件"

## 禁止

- 不要新建 `customComponents`（这次只盘点现有能力）
- 不要改内置组件文件本身
- 不要改主题系统
- 不要改任何已有模板的 id（新增追加）

## 补充规范：`.forge.md` 文件格式（给后续补组件的 agent）

> 本次任务**只产出模板**，不碰组件文件。但你登记的 `missingComponents` 下一轮会有 agent
> 来实现。为避免那一轮又产生格式漂移，这里明确规范：**所有 `.forge.md` 必须以 YAML
> frontmatter 开头**，与 `UserTemplate` 保持一致。

### 正确格式

```markdown
---
id: flowchart-canvas
category: visual
tags: flowchart, diagram, svg
trust: builtin
defaultVariant: standard
description: 流程图画布（可选）
---

# 流程图画布

## Variants

- `standard` — 默认
- `compact` — 紧凑

## Slots

```yaml
flowTitle:
  label: 标题
  type: text
  placeholder: Flow
...
```

## HTML

...（以下照旧）
```

### 规则

1. **文件开头第一行必须是 `---`**，紧接元信息键值对，再用 `---` 闭合
2. frontmatter 内**不要用缩进 / 列表 / 嵌套**，只接受顶层 `key: value` 标量
3. 字符串含 `:` / `#` / 引号 / 前后空格时**用单引号包裹**（与 UserTemplate 一致）
4. `tags` 写成逗号分隔字符串（如 `tags: flowchart, diagram, svg`），loader 会自己切
5. `h1`（`# 组件显示名`）放在 frontmatter 之后的空行后；`## Variants` 及后续章节照旧
6. **不要**再写旧的"H1 + 松散 key: value 行"风格（loader 仍向后兼容，但新文件一律用 frontmatter）

### 为什么统一

- `UserTemplate` 保存 / 导入的 `.md` 文件已经是 frontmatter 格式
- 之后会有"导入 `.forge.md` 到用户品牌包"的能力，用户模板和组件用同一种头很省心
- 统一的 yaml 头让外部工具（静态站点 / CI 脚本）都能直接 `gray-matter` 读

### 必备 / 可选键位

| key | 必备 | 说明 |
|---|---|---|
| `id` | ✅ | 稳定 kebab-case，全局唯一，`@compose` 引用用它 |
| `category` | ✅ | `header` / `summary` / `content` / `card` / `list` / `visual` / `data` / `layout` / `footer` / `special` 之一 |
| `trust` | ✅ | `builtin`（内置）或 `user`（用户提交） |
| `defaultVariant` | 视情况 | 有 `## Variants` 段时必填 |
| `tags` | 可选 | 逗号分隔；供组件浏览器搜索 |
| `description` | 可选 | 一句话用途，会显示在组件库 tooltip |

### 如果你在本任务里**临时需要**新增 `.forge.md`

（例如用户调整了需求，你必须创建组件而非仅登记 `missingComponents`）——
**也必须用 frontmatter 格式**，并同步把 `import xxx from './path.forge.md?raw'` 登记到
`src/builtin/components/forge-registry.ts` 的 `IMPORTS` 与 `SOURCES` 数组。

## 示例：#11 Status Report 的 starter MD 片段

```markdown
<!-- @page narrow -->
<!-- @compose: header, meta-pills, summary-band, highlights, table, actions, footer -->
<!-- @theme editorial -->

<!-- ─── header ─── -->
<!-- @use header -->

# Birchline · Engineering Status

## Week 11 — Infra stabilization

<!-- @slot:eyebrow -->WEEKLY · INTERNAL<!-- @/slot -->
<!-- @slot:date -->2025-03-14<!-- @/slot -->
<!-- @slot:author -->@alex · Platform team<!-- @/slot -->

<!-- ─── meta-pills ─── -->
<!-- @use meta-pills -->

<!-- @slot:pillStatus -->✓ on track<!-- @/slot -->
<!-- @slot:pillDelta -->p95 −12%<!-- @/slot -->
<!-- @slot:pillRisk -->low<!-- @/slot -->

<!-- ─── summary-band（4 列指标）─── -->
<!-- @use metric variant=band -->

184ms
API p95
↓ 12% wk/wk

0.04%
错误率
under target

21
事件
0 P1

92%
SLO 达成
↑ 3pt

<!-- ─── highlights ─── -->
<!-- @use highlights -->

- 连接池上限从 20 → 100，p95 从 320ms 降到 184ms
- 回滚 cfg-9a12 后错误率回归 0
- 新增 3 个 Grafana alert 规则

<!-- ─── table ─── -->
<!-- @use table variant=impact -->

<!-- @slot:tableHeading -->本周交付<!-- @/slot -->
<!-- @slot:tableData -->
Feature|Owner|Status
Redis 连接池调整|@bob|✅ shipped
新告警规则|@mira|✅ shipped
Worker 队列重构|@alex|🟡 in review
<!-- @/slot -->

<!-- ─── actions（结转清单）─── -->
<!-- @use actions -->

- [ ] Worker 队列重构 - 完成 code review
- [ ] 更新 runbook for connection pool
- [ ] 编写 post-mortem for cfg-9a12

<!-- ─── footer ─── -->
<!-- @slot:footer -->
Birchline · Platform Engineering · 2025
<!-- @/slot -->
```

## 你写完后提交的单元

一个 commit，标题格式：

```
feat(templates): add he-11 Engineering Status template
```

正文说明：
- 覆盖了原 HTML 的哪些段
- 用了哪些内置组件
- 如果有 `missingComponents`，列清单 + 一句话描述每个组件的角色
- 任何一眼能看出来的视觉差异（便于下轮补齐）
