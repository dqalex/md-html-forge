# 模板渲染审查任务（给审查 agent）

> 目的：找出 md-html-forge 内置模板"模板源 MD"与"实际渲染 HTML"之间的不一致，
> 把问题汇总成结构化清单，交给修复 agent 处理。

---

## 任务背景

`md-html-forge` 是把 Markdown 喂给组件库渲染成精美 HTML 的工具。每个模板由
"原始 MD（含 forge 指令）" + "组件 schema" 共同决定最终渲染。

**已知问题**：用户反馈某些模板渲染结果有缺失或多余内容：

1. **缺失渲染**：例如事故复盘模板的 lead (TL;DR)、Timeline 段渲染不出来
2. **多余兜底**：很多模板底部出现类似 `<!-- ─── header ─── -->` 这种**注释残留**
   被作为裸文本渲染出来
3. **孤儿 slot**：写了 `<!-- @slot:xxx -->` 但没有组件接收它

你的任务是**逐一审查所有 20 个模板**，找出所有偏差。

---

## 任务约束

- **只做审查，不写代码**。最终交付一份结构化问题清单。
- **不要相信表面现象**（"看起来渲染出来了"），要用组件契约严格比对。
- **抓主要矛盾**：缺失/多余的内容是什么、源 MD 里对应的位置是什么、根因是什么。

---

## 工作流程

### Step 1 · 启动应用并打开模板

应用已在 `http://localhost:3000/` 运行。

```bash
# 如未运行：
cd /data/workspace/md-html-forge
npm run dev
```

打开浏览器访问 `http://localhost:3000/`，左上角"选择模板"下拉里有 20 个模板：

```
报告 (3)：
  - 工程周报
  - 事故复盘
  - 功能开关清单

规划 (4)：
  - 动画规范
  - 交互原型
  - 流程图带注解
  - 实施计划

研究 / 讲解 (5)：
  - 代码流程讲解
  - 设计系统参考
  - 组件变体矩阵
  - 特性讲解（feature）
  - 概念讲解（interactive）

代码评审 (3)：
  - 代码方案探索
  - PR 评审摘要
  - PR 说明

其他 (5)：
  - 视觉方案探索
  - 幻灯片演示
  - SVG 插图集
  - 编辑器看板
  - 提示词调优器
```

### Step 2 · 对每个模板做对比

对每个模板：

1. **读源 MD**（在 `/data/workspace/md-html-forge/src/builtin/templates/batches/he-batch-{a,b,c,d,e}.ts` 里）：
   - he-batch-a.ts → 工程周报、事故复盘、功能开关清单
   - he-batch-b.ts → 代码方案探索、PR 评审摘要、PR 说明
   - he-batch-c.ts → 动画规范、交互原型、流程图带注解、实施计划
   - he-batch-d.ts → 代码流程讲解、设计系统参考、组件变体矩阵、特性讲解、概念讲解
   - he-batch-e.ts → 视觉方案探索、幻灯片演示、SVG 插图集、编辑器看板、提示词调优器
2. **导出 HTML**：在应用界面右上角点"导出"按钮，选择"HTML"导出独立 HTML 文件
   - 或者直接点"预览"按钮，从浏览器开发工具拷贝预览 iframe 的 outerHTML
3. **对比**：用下面的"组件契约"和"判定规则"逐项检查

### Step 3 · 输出问题清单

按下面"输出格式"汇总所有问题。

---

## 组件契约（判定依据）

> 关键术语：
> - **slot**：组件的内容插槽。用 `<!-- @slot:slotName -->...<!-- @/slot -->` 显式填写。
> - **bind**：声明哪种 MD 块（h1/h2/list/code/table/content...）会自动绑定到该 slot。
>   `bind:content` 是兜底——会吃掉段内剩余的所有 MD 块。
> - **variant**：组件的样式变体。`@use foo variant=bar` 切换 variant。

### 通用规则

1. 如果一个组件**所有有意义的 slot 都为空**，组件返回空字符串（不渲染）。
2. `<!-- ─── 注释 ─── -->` 这种**纯 HTML 注释**应该被 forge 编译器丢弃，
   **绝对不应该出现在最终渲染 HTML 里**。
3. `@slot:xxx` 如果没有组件能接收（没有同名 slot 也没有匹配的别名），
   会渲染成 **孤儿 slot 块**（左边框 clay 色 + 顶部小标签 `@slot:xxx`）。
4. 没有 `@use` 上下文的裸 markdown 段落会渲染成 **forge-free-text 兜底块**（editorial 风格段落）。
5. **理想情况下，正确的模板应该渲染时**：
   - **0 个 forge-orphan**
   - **0 个 forge-free-text**
   - **0 段 `─── ... ───` 注释残留**

### 关键组件 slot 表

| 组件 | 关键 slot | 类型 | bind | 用途 |
|---|---|---|---|---|
| **header** | title | text | h1 | 标题（自动绑 `# ...`） |
|  | subtitle | content | h2 | 副标题（自动绑 `## ...`） |
|  | eyebrow / date / author / badge | text | 无 | 元信息（要显式 slot） |
| **footer** | footer | text | 无 | 页脚（要显式 slot） |
| **lead** | lead | content | blockquote | variant=lead 的引用块 |
|  | tldr | content | list | variant=tldr 的列表 |
|  | phaseNum / phaseTitle / phaseIntro | text | 无 | variant=phase 的三件套 |
| **highlights** | highlightsHeading | text | h2 | 标题 |
|  | highlights | content | list | 列表 |
| **actions** | actionsHeading | text | h2 | 标题 |
|  | actions | content | list | 列表 |
| **checklist** | checklistHeading | text | h2 | 标题 |
|  | checklist | content | list | 列表 |
| **table** | tableHeading | text | h2 | 标题 |
|  | tableContent | content | content | variant=standard 的 markdown 表格 |
|  | tableData | data | 无 | variant=risk/impact/flag 的数据（每行 `\|` 分隔） |
| **timeline** | timelineHeading | text | h2 | 标题 |
|  | timelineBody | content | content | variant=standard/milestones 的内容 |
|  | timelineEntry | content | content | variant=incident 的内容（**与 timelineBody 互斥**） |
|  | timelineTime / timelineDot | text | 无 | incident 的时间戳 / 圆点颜色 |
| **callout** | calloutTitle | text | h3 | 标题 |
|  | calloutBody | content | content | 内容 |
|  | calloutIcon | text | 无 | 图标字符 |
| **panel** | panelTitle | text | h3 | 标题 |
|  | panelBody | content | content | variant=snippet/prompt 的内容 |
|  | panelData | data | 无 | variant=glossary 的数据（每行 `key\|value`） |
| **metric** | metricValue / metricLabel / metricDelta | data | 无 | band/hero variant 多列数据（每行一列） |
|  | metricTrend | text | 无 | slide variant 趋势方向 |
| **code-block** | diffContent | data | 无 | variant=diff 的 diff 文本（@@/+/-/ 开头） |
|  | stepNum / stepLoc / stepRange | text | 无 | variant=walkthrough 步骤元信息 |
|  | stepBody | content | paragraph | walkthrough 正文 |
|  | stepCode | content | code | walkthrough 代码块（要带 ```fence） |
| **comparison** | baBefore / baAfter | content | 无 | variant=ba 的两侧（要显式 slot） |
|  | optionTitle | text | 无 | variant=options 标题 |
|  | optionContext | content | 无 | variant=options 上下文 |
|  | optionItems | data | 无 | variant=options 选项（每行一条） |
|  | mockupLabel | text | h3 | variant=mockup 标签 |
|  | mockupPreview | content | 无 | variant=mockup 内容 |
|  | mockupRationale | content | 无 | variant=mockup 说明 |
| **chip** | riskLabel / riskLevel | text | 无 | variant=risk |
|  | pillType / pillKey / pillValue | text | 无 | variant=pill |
|  | legendItems | data | 无 | variant=legend（每行 `key\|label`） |
| **progress** | barsHeading | text | 无 | variant=bars 标题 |
|  | barsItems | data | 无 | variant=bars 数据（`label\|pct\|note`） |
|  | rolloutHeading / rolloutSteps | text/data | 无 | variant=rollout |
|  | itemTitle (h3) / itemPct / itemNote | text/text/content | 无 | variant=item |
| **illustration** | frameTitle / frameSub | text | 无 | variant=frame 标题 |
|  | frameSvg | content | 无 | variant=frame 的 SVG（要显式 slot） |
|  | notesTitle | text | h2 | variant=notes 标题 |
|  | notesLeade | text | 无 | variant=notes 引言 |
|  | notesBody | content | list | variant=notes 列表 |
| **list-item** | shipTitle (h3) / shipDesc (content) / shipRef | text | 无 | variant=shipped |
|  | carryTag / carryBody / carryOwner | text | 无 | variant=carry |
|  | focusNum / focusTitle / focusDesc | text | 无 | variant=focus |
|  | actionDone / actionOwner / actionDesc / actionDue | text | 无 | variant=action |
| **list-row** | shippedPr / shippedTitle / shippedAuthor / shippedRisk | text | 无 | variant=pr |
|  | filePath / fileRisk / fileRiskLabel / fileAdded / fileDeleted | text | 无 | variant=file |
|  | entryPath / entryBadge / entryStats / entryWhy / entryCode | text/text/text/content/content | 无 | variant=entry |
| **pr-summary** | prRepo / prTitle (h1) / prAuthor / prAuthorSub / prAuthorInitials / prBranch / prAdded / prDeleted / prFiles | text | 无 | variant=standard |
| **collapse-section** | sectionTitle / sectionWhere | text | 无 | 折叠头 |
|  | sectionBody | content | content | 折叠内容 |
| **review-comment** | commentAnchor / commentLabel / commentType | text | 无 | 元信息 |
|  | commentBody | content | content | 评论正文 |
| **meta-pills** | pill1..pill5 | text | 无 | 5 个 pill 标签 |
|  | pills | content | content | 整段 pill 内容（备用） |
| **faq-item** | faqQ / faqA | text/content | 无 | 问答（也支持 q1/a1, q2/a2 多对） |
| **slide-cover** | coverTitle | text | h1 | variant=cover 标题 |
|  | coverSubtitle | content | h2 | 副标题 |
|  | coverByline | text | 无 | 作者署名 |

> **完整组件契约**见 `/data/workspace/md-html-forge/docs/engine/syntax.md` 的"内置组件速查"小节。

### 编译器关键规则（影响判断）

1. **slot 名别名匹配**：
   在 `@use highlights` 上下文里写 `<!-- @slot:heading -->...<!-- @/slot -->`，
   会自动映射到 `highlightsHeading`。规则：`<componentId> + 首字母大写(slotName)`。
2. **`@compose` 必须声明**：组件 id 没在 `@compose` 列表里，`@use` 它会失效。
3. **`@item` 块限制**：`<!-- @item -->` 块内的裸 markdown **不支持**自动 bind，
   必须用显式 `<!-- @slot:xxx -->`。
4. **同 id 多次 `@use`**：每次创建独立组件实例，不合并。
5. **HTML 注释 `<!-- @use ... -->` / `<!-- @slot ... -->` / `<!-- @compose ... -->`**
   都被编译器识别处理；其他注释（如 `<!-- ─── 分割 ─── -->`）应被丢弃。

---

## 判定规则（决定问题严重性）

### 🔴 严重问题（必须修）

- **组件完全没渲染**：源 MD 写了 `@use foo`，但 HTML 里找不到 `[data-section="foo"]`
- **关键 slot 内容丢失**：`@slot:tableContent` 写了内容但 HTML 里 `.table-content` 是空的
- **注释残留**：HTML 里出现 `─── 文字 ───` 这种本应被丢弃的分割注释
- **孤儿 slot**：HTML 里出现 `.forge-orphan` 块，且 label 是常见 slot 名（说明 slot 名拼错或上下文错）

### 🟡 中等问题（建议修）

- **多余 free-text 兜底**：HTML 里出现 `.forge-free-text` 块，且内容是模板里的某段
  （说明那段没有合适的 `@use` 上下文）
- **变体不正确**：`@use table variant=standard` 但实际渲染成了 risk 样式
- **空的占位元素**：组件渲染了，但里面的 slot 全空（说明数据没流进去）

### 🟢 轻微问题（可选）

- 文字内容差异（中英文、占位符）
- 视觉小缺陷

---

## 输出格式

请把所有问题按下面格式输出。**优先级从严重到轻微排序**。

```markdown
# 模板审查结果

总计审查 20 个模板，发现问题 N 处。

## 🔴 严重问题

### Q1 · [模板名] [问题简述]

- **模板**: 工程周报 (he-11-status-report)
- **症状**: 渲染 HTML 末尾出现 4 行注释残留：
  ```
  <!-- ─── header ─── -->
  <!-- ─── highlights ─── -->
  ...
  ```
- **源 MD 位置**: he-batch-a.ts:21-23
- **MD 片段**:
  ```md
  <!-- ─── header ─── -->
  <!-- @use header -->
  ```
- **猜测根因**: 这种"分割注释"看起来被 lexer 当作普通文本 token 输出了，
  resolver 收集到 freeText 数组里，emitter 用 forge-free-text 兜底渲染。
- **建议**: 修编译器，让 lexer 识别并丢弃所有非 forge 指令的 HTML 注释。

### Q2 · ...

## 🟡 中等问题

### Q3 · ...

## 🟢 轻微问题（可选）

### ...

---

## 总览统计

| 模板 | 严重 | 中等 | 轻微 | 备注 |
|---|---|---|---|---|
| 工程周报 | 1 | 0 | 0 | 注释残留 |
| 事故复盘 | 2 | 1 | 0 | lead/timeline 缺失 + ... |
| ... | ... | ... | ... | ... |
```

---

## 重要提示

- 同一类问题（例如所有模板都有的"注释残留"）只在第一个模板里详细描述，后面的引用即可
- 给出**精确的源 MD 行号**（在 he-batch-{a,b,c,d,e}.ts 里）
- **不要给出修复方案**（那是修复 agent 的工作），只描述症状和猜测根因
- 输出文件路径建议：`/tmp/template-audit-result.md`

完成后请把这份 markdown 直接打印出来。
