# 迁移清单（动态更新）

> ⚠️ **本文件正在淘汰中**
>
> 产品方向调整后（见 `docs/product/direction.md` 决策 6），组件不再以"逐个 1:1 迁移"管理。
> 当前组件库 = **17 个 `.forge.md` 原子组件 × 40+ 变体** + 少量保留的 `.ts` 列表组件。
>
> - 可用组件以代码为真相源：`src/builtin/components/*/*.forge.md`
> - 各组件能力清单见 `docs/product/forge.md`（给 AI 看的对外规范）
>
> 本文件仅作历史参考保留，不再维护。

## 已完成（67）

### header
- [x] header
- [x] meta-pills

### summary
- [x] tldr
- [x] lead
- [x] prompt-box
- [x] recommendation

### content
- [x] body
- [x] code
- [x] qa

### card
- [x] feature-card
- [x] stat-card (enhanced: +statAccent slot)
- [x] approach-card
- [x] review-comment
- [x] variant-card
- [x] decision-card
- [x] drag-list-item
- [x] detail-panel

### list
- [x] actions
- [x] checklist
- [x] highlights
- [x] milestones
- [x] setup-steps
- [x] timeline
- [x] ship-item
- [x] slide-agenda
- [x] carryover-item
- [x] action-row
- [x] incident-timeline-entry
- [x] collapse-section
- [x] faq-item

### visual
- [x] before-after
- [x] mockup-card
- [x] options
- [x] progress
- [x] rollout
- [x] diff-block
- [x] risk-chip
- [x] snippet-panel
- [x] code-walkthrough
- [x] concept-callout
- [x] token-swatch
- [x] spacing-grid
- [x] radius-sample
- [x] prog-item
- [x] animation-keyframe
- [x] interaction-notes
- [x] open-questions
- [x] svg-frame
- [x] incident-pill
- [x] flow-legend
- [x] callout-note
- [x] glossary-panel

### data
- [x] metrics
- [x] summary-band
- [x] table
- [x] pr-summary
- [x] file-changed-row
- [x] key-files
- [x] type-scale-row
- [x] slide-metric
- [x] impact-table
- [x] shipped-row

### layout
- [x] grid-2
- [x] grid-3
- [x] grid-4
- [x] flex-row

### special
- [x] slide-cover

### footer
- [x] footer

## 待完成（按 HTML 文件分配）

> 每个 HTML 是**一个迁移任务**。建议组件 id 是 reviewer 在迁移时根据实际可复用性决定，下表只是建议。

### 01-exploration-code-approaches.html ✅

主题：展示 3 种代码实现方案的并列对比。

候选组件：
- [x] ~~approach-grid~~ → 复用现有 grid-3 布局
- [x] **approach-card**（每个方案的卡片）
  - slots: approachNum, approachTitle, approachDesc, approachCode, approachPros, approachCons, approachTags
- [x] **prompt-box**（顶部的 prompt 提示框）
  - slots: promptLabel, promptText
- [x] **recommendation**（推荐结论块）
  - slots: recoTitle, recoBody
- [x] ~~code-snippet~~ → 复用现有 code 组件，approach-card 内嵌代码面板

### 02-exploration-visual-designs.html ✅

主题：3 种视觉设计方案对比。

候选组件：
- [x] **mockup-card**（每种设计的预览卡，含标签/预览区/理由说明）
  - slots: mockupLabel, mockupPreview, mockupRationale
- [x] **setup-steps**（引导步骤列表，从 es-d 提取）
  - slots: stepsTitle, stepsBody
- [x] **prompt-box** → 复用 01 已迁移组件（source 已更新为 '01,02'）
- [x] ~~rationale-block~~ → 合并进 mockup-card 的 mockupRationale slot

### 03-code-review-pr.html ✅

主题：PR review 报告。

候选组件：
- [x] **pr-summary**（PR 总览，含标题/作者/状态/diff stats）
- [x] **diff-block**（代码 diff，+/- 着色）
- [x] **review-comment**（每条 review 评论）
- [x] **file-changed-row**（变更文件行，含 +/- 数字）
- [x] **risk-chip**（风险等级 chip 标签）
- [x] ~~review-verdict~~ → 源 HTML 无独立 verdict 区块，复用 review-comment

### 04-code-understanding.html ✅

主题：代码理解报告。

候选组件：
- [x] **code-walkthrough**（带编号徽章 + 文件位置 + 正文 + 代码的步骤卡）
  - slots: stepNum, stepLoc, stepRange, stepHot, stepBody, stepCode
- [x] ~~call-graph~~ → 复用现有 code 组件（用户可用 ```flow 代码块写调用关系图）
- [x] **concept-callout**（关键概念/注意事项提示块）
  - slots: calloutTitle, calloutBody
- [x] **key-files**（关键文件路径 + 描述面板）
  - slots: keyFilesHeading, keyFiles

### 05-design-system.html ✅

主题：设计系统文档。

候选组件：
- [x] **token-swatch**（颜色 token 块：色块 + 名 + 值）
  - slots: swatchColor, swatchHex, swatchToken, swatchGroup, swatchBorder
- [x] ~~token-grid~~ → 复用现有 grid-4 布局 + token-swatch 循环
- [x] **type-scale-row**（字号示例行）
  - slots: specimenText, specimenName, specimenMeta, specimenFont, specimenSize, specimenWeight, specimenLineHeight, specimenLetterSpacing, specimenColor
- [x] **spacing-grid**（间距可视化）
  - slots: spSize, spToken
- [x] **radius-sample**（圆角/阴影示例）
  - slots: rsType, rsValue, rsToken, rsDetail
- [x] ~~core-components~~ → 需 JS 交互（checkbox、button），无法用纯 forge 表达，跳过

### 06-component-variants.html ✅

主题：组件变体展示（hover/focus/disabled 等）。

候选组件：
- [x] **variant-card**（每个变体的预览 + 说明）
  - slots: variantLabel, variantStyle, avatarText, cardTitle, cardSubtitle, cardChips, cardAction, variantNote
- [x] ~~variant-state-pill~~ → 内嵌在 variant-card 的 variantLabel slot 中，不需独立组件
- [x] ~~toolbar~~ → 需要 JavaScript 交互，无法迁移
- [x] **snippet-panel**（代码片段预览面板）
  - slots: snippetTitle, snippetCode

### 07-prototype-animation.html ✅

主题：动画原型规格。

候选组件：
- [x] **animation-keyframe**（关键帧时间线，水平轨道 + 节点）
  - slots: keyframeTitle, keyframes
- [x] ~~animation-frame~~ → 源 HTML 中的 .stage/.panel 区域需要 JS 交互（点击切换 .done 状态、easing 按钮切换），无法用纯 forge 表达，跳过
- [x] ~~motion-spec~~ → 合并进 animation-keyframe 的 keyframes slot（data 类型承载结构化规格）
- [x] ~~timing-curve~~ → easing 面板需要 JS 交互，跳过
- [x] ~~snippet~~ → 复用现有 snippet-panel 组件

### 08-prototype-interaction.html ✅

主题：交互流程图。

候选组件：
- [x] **drag-list-item**（可拖拽排序列表项，含 grip 手柄 + 标签 + 计数）
  - slots: itemLabel, itemCount
- [x] **interaction-notes**（交互设计注解面板，含标题 + 导语 + 方块 bullet 列表）
  - slots: notesTitle, notesLeade, notesBody
- [x] **open-questions**（oat 底色的待决问题面板，含标题 + 有序列表）
  - slots: questionsTitle, questionsBody
- [x] ~~interaction-state~~ → 源 HTML 实际为 sidebar drag-to-reorder 原型，非状态机，inventory 原计划不适用
- [x] ~~state-transition~~ → 同上，非状态转换图
- [x] ~~drop-indicator~~ → 需要 JavaScript 交互，无法用纯 forge 表达，跳过
- [x] ~~sidebar~~ → 整体 nav 容器是页面特定布局，不够通用；拆为 drag-list-item 循环 + 用户自行组织
- [x] ~~bench layout~~ → 页面特定的 300px+1fr 双栏布局，用户可用 flex-row 或原生 CSS 实现
- [x] ~~footnote~~ → 太小（一行文本），作为 body 内容即可
- [x] ~~header~~ → 复用现有 header 组件
- [x] ~~script~~ → JavaScript 交互，无法迁移

### 09-slide-deck.html ✅

主题：幻灯片样式。

候选组件：
- [x] **slide-cover**（封面 slide，含标题/副标题/署名）
  - slots: coverTitle, coverSubtitle, coverByline
- [x] **ship-item**（已发布列表项，圆点+标题+描述+引用编号）
  - slots: shipTitle, shipDesc, shipRef
- [x] **prog-item**（进行中项目，标题+百分比+进度条+备注）
  - slots: progTitle, progPct, progNote
- [x] **slide-metric**（幻灯片指标，大号数值+标签+趋势）
  - slots: metricLabel, metricValue, metricDelta, metricTrend
- [x] **decision-card**（决策卡，问题+背景+选项标签）
  - slots: decisionQ, decisionContext, decisionOptions
- [x] **slide-agenda**（幻灯片议程/下一步列表+脚注）
  - slots: agendaItems, agendaFootnote
- [x] ~~slide 容器~~ → 复用 @theme + @layout: stack
- [x] ~~eyebrow 文本~~ → 复用原生 MD 或 meta-pills
- [x] ~~slide counter~~ → 需要 JavaScript，跳过
- [x] ~~sparkline SVG~~ → 内联 SVG 图表，不可复用，跳过
- [x] ~~ornament SVG~~ → 装饰性内联 SVG，跳过

### 10-svg-illustrations.html ✅

主题：SVG 插图集合。

候选组件：
- [x] **svg-frame**（SVG 包装容器 + 标题说明）
  - slots: frameTitle, frameSub, frameSvg
- [x] ~~illustration-grid~~ → 复用现有 grid-3/grid-4 布局
- [x] ~~download button~~ → 需要 JavaScript 交互，跳过
- [x] ~~palette section~~ → 复用现有 token-swatch 组件
- [x] ~~notes list~~ → 太简单，用 markdown 列表即可

### 11-status-report.html ✅

主题：项目状态周报。

候选组件：
- [x] ~~status-band~~ → 复用现有 summary-band 组件
- [x] ~~kpi-grid~~ → 复用现有 summary-band + stat-card（增强 statAccent slot）
- [x] **carryover-item**（遗留项：状态标签 + 描述 + 负责人）
  - slots: carryTag, carryBody, carryOwner
- [x] **shipped-row**（已发布 PR 行：PR链接 + 标题 + 作者 + 风险点）
  - slots: shippedPr, shippedTitle, shippedAuthor, shippedRisk
- [x] **stat-card 增强** — 新增 statAccent slot，支持 warn 左边框变体
- [x] ~~velocity chart~~ → 内联 SVG 图表，太特定，跳过
- [x] ~~highlights~~ → 复用现有 highlights 组件

### 12-incident-report.html ✅

主题：事故报告。

候选组件：
- [x] **incident-pill**（事件标签：sev/resolved/neutral 三种变体）
  - slots: pillType, pillKey, pillValue
- [x] **impact-table**（键值对影响评估表）
  - slots: impactHeading, impactRows (data: key|value per line)
- [x] **action-row**（带复选框 + 头像 + 描述 + 截止日期的行动项）
  - slots: actionDone, actionOwner, actionDesc, actionDue
- [x] **incident-timeline-entry**（带彩色圆点变体的时间线条目）
  - slots: tlTime, tlDot, tlBody
- [x] ~~incident-summary~~ → 复用现有 header + meta-pills + tldr
- [x] ~~root-cause~~ → 用 body 内容 + 复用 diff-block
- [x] ~~TOC sidebar~~ → 需要 JS 滚动交互，跳过
- [x] ~~code-panel~~ → 复用现有 diff-block 组件

### 13-flowchart-diagram.html ✅

主题：流程图。

候选组件：
- [x] **flow-legend**（图例条：彩色芯片 + 标签）
  - slots: legendItems (data: chipType|label per line)
- [x] **detail-panel**（详情面板：提示 + 标题 + 元数据 + 正文 + 代码）
  - slots: panelHint, panelTitle, panelMeta, panelBody, panelCode
- [x] ~~flowchart-canvas~~ → 内联 SVG 流程图太特定，跳过
- [x] ~~flowchart-node / flowchart-edge~~ → 点击交互需 JS，跳过
- [x] ~~interactive click~~ → 需 JS 交互，跳过

### 14-research-feature-explainer.html ✅

主题：功能讲解。

候选组件：
- [x] **collapse-section**（折叠段落：details/summary + 源码引用）
  - slots: sectionTitle, sectionWhere, sectionBody
- [x] **callout-note**（提示标注框：图标 + 文字，oat 边框）
  - slots: calloutIcon, calloutBody
- [x] **faq-item**（问答条目）
  - slots: faqQ, faqA
- [x] ~~feature-anatomy~~ → 复用 collapse-section 展示功能各部分
- [x] ~~feature-step~~ → 复用 collapse-section 的 steps
- [x] ~~feature-comparison~~ → 复用 before-after
- [x] ~~side nav~~ → 需 JS 滚动追踪，跳过
- [x] ~~tabs~~ → 需 JS 标签切换，跳过

### 15-research-concept-explainer.html ✅

主题：概念讲解。

候选组件：
- [x] **glossary-panel**（术语表面板：定义列表侧栏）
  - slots: glossHeading, glossEntries (data: term|definition per line)
- [x] ~~concept-card~~ → 复用 glossary-panel 的定义条目
- [x] ~~analogy-block~~ → 用 body 内容即可
- [x] ~~diagram-block~~ → 交互式 SVG 需 JS，跳过
- [x] ~~compare table~~ → 复用现有 table 组件
- [x] ~~term hover~~ → 需 JS 交互，跳过

### 16-implementation-plan.html

主题：实施计划。

候选组件：
- [ ] **plan-phase**（阶段标题 + 时间）
- [ ] **plan-task**（任务条目）
- [ ] **plan-risk**（风险）
- [ ] **plan-dependency**（依赖关系）

### 17-pr-writeup.html

主题：PR 描述（与 03 对比：03 是 review，17 是写 PR 描述）。

候选组件：
- [ ] **change-summary**（变更总览）
- [ ] **commit-list**（commit 列表）
- [ ] **screenshot-pair**（变更前后截图）
- [ ] **test-coverage**（测试覆盖说明）

### 18-editor-triage-board.html

主题：bug triage 看板。

候选组件：
- [ ] **kanban-column**（看板列）
- [ ] **kanban-card**（看板卡片）
- [ ] **kanban-board**（layout，多列容器）

### 19-editor-feature-flags.html

主题：feature flag 控制台。

候选组件：
- [ ] **flag-row**（每个 flag 一行）
- [ ] **flag-state-toggle**（启用状态切换视觉）
- [ ] **flag-metadata**（owner / created / rollout%）

### 20-editor-prompt-tuner.html

主题：Prompt 调优界面。

候选组件：
- [ ] **prompt-version**（一个版本的 prompt 块）
- [ ] **prompt-comparison**（多版本对比）
- [ ] **prompt-result-sample**（输出示例）

## 进度追踪

```
总计：~120 候选组件
已完成：67
进度：56%
```

更新本文件时同步：
1. 在已完成区添加条目
2. 在待完成区勾掉对应条目
3. 更新进度数字
