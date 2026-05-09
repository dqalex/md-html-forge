# 迁移清单（动态更新）

> 完成一个组件后请勾选对应行。

## 已完成（25）

### header
- [x] header
- [x] meta-pills

### summary
- [x] tldr
- [x] lead

### content
- [x] body
- [x] code
- [x] qa

### card
- [x] feature-card
- [x] stat-card

### list
- [x] actions
- [x] checklist
- [x] highlights
- [x] milestones
- [x] timeline

### visual
- [x] before-after
- [x] options
- [x] progress
- [x] rollout

### data
- [x] metrics
- [x] summary-band
- [x] table

### layout
- [x] grid-2
- [x] grid-3
- [x] grid-4
- [x] flex-row

### footer
- [x] footer

## 待完成（按 HTML 文件分配）

> 每个 HTML 是**一个迁移任务**。建议组件 id 是 reviewer 在迁移时根据实际可复用性决定，下表只是建议。

### 01-exploration-code-approaches.html

主题：展示 3 种代码实现方案的并列对比。

候选组件：
- [ ] **approach-grid**（layout，3 列）—— 可能可以复用 grid-3
- [ ] **approach-card**（每个方案的卡片）
  - slots: approachNum, approachTitle, approachBody, approachPros (list), approachCons (list), approachCode (code)
- [ ] **prompt-box**（顶部的 prompt 提示框）
  - slots: promptLabel, promptText
- [ ] **code-snippet**（带语言标签的 code 块）—— 评估是否能融入现有 code 组件

### 02-exploration-visual-designs.html

主题：3 种视觉设计方案对比。

候选组件：
- [ ] **design-mockup-card**（每种设计的预览卡）
  - slots: designLabel, designTitle, designBody, designPreview (data/image)
- [ ] **rationale-block**（设计理由说明）

### 03-code-review-pr.html

主题：PR review 报告。

候选组件：
- [ ] **pr-summary**（PR 总览，含标题/作者/状态/diff stats）
- [ ] **diff-block**（代码 diff，+/- 着色）
- [ ] **review-comment**（每条 review 评论）
- [ ] **file-changed-row**（变更文件行，含 +/- 数字）
- [ ] **review-verdict**（approve / request changes 状态条）

### 04-code-understanding.html

主题：代码理解报告。

候选组件：
- [ ] **code-walkthrough**（带行号注释的 code）
- [ ] **call-graph**（调用关系图）—— 可考虑用 ```flow
- [ ] **concept-callout**（关键概念高亮块）

### 05-design-system.html

主题：设计系统文档。

候选组件：
- [ ] **token-swatch**（颜色 token 块：色块 + 名 + 值）
- [ ] **token-grid**（layout）
- [ ] **type-scale-row**（字号示例行）
- [ ] **spacing-grid**（间距可视化）
- [ ] **radius-sample**（圆角示例）

### 06-component-variants.html

主题：组件变体展示（hover/focus/disabled 等）。

候选组件：
- [ ] **variant-card**（每个变体的预览 + 说明）
- [ ] **variant-state-pill**（状态标签：hover/focus/...）

### 07-prototype-animation.html

主题：动画原型规格。

候选组件：
- [ ] **animation-frame**（关键帧预览）
- [ ] **motion-spec**（duration / easing 规格表）
- [ ] **timing-curve**（缓动曲线可视化）

### 08-prototype-interaction.html

主题：交互流程图。

候选组件：
- [ ] **interaction-state**（状态节点）
- [ ] **state-transition**（状态转换箭头）—— 可能用 ```flow

### 09-slide-deck.html

主题：幻灯片样式。

候选组件：
- [ ] **slide**（单页 slide，分 cover / content 两种）
- [ ] **slide-cover**（封面 slide）
- [ ] **slide-section-divider**（分节 slide）

### 10-svg-illustrations.html

主题：SVG 插图集合。

候选组件：
- [ ] **svg-frame**（SVG 包装容器，含说明）
- [ ] **illustration-grid**（layout）

### 11-status-report.html

主题：项目状态周报。

候选组件：
- [ ] **status-band**（顶部状态总览条：on track / at risk / blocked）
- [ ] **kpi-grid**（KPI 网格，可能用现有 metrics）
- [ ] **status-update-item**（每条更新）
- [ ] **risk-item**（风险项）

### 12-incident-report.html

主题：事故报告。

候选组件：
- [ ] **incident-summary**（事故总览：严重程度/影响/时长）
- [ ] **incident-timeline**（事故时间线）—— 评估是否能复用 timeline
- [ ] **root-cause**（根因分析块）
- [ ] **action-item**（后续行动）—— 可能用现有 actions

### 13-flowchart-diagram.html

主题：流程图。注：与 `\`\`\`flow` 代码块图表可能重叠，**先评估能否扩展现有 ```flow 而不是新增组件**。

候选组件：
- [ ] **flowchart-canvas**（如真需要更复杂的图，再独立成组件）
- [ ] **flowchart-node** / **flowchart-edge**（按需）

### 14-research-feature-explainer.html

主题：功能讲解。

候选组件：
- [ ] **feature-anatomy**（功能解剖图：标注每个部分的作用）
- [ ] **feature-step**（步骤说明）
- [ ] **feature-comparison**（前后对比，可能复用 before-after）

### 15-research-concept-explainer.html

主题：概念讲解。

候选组件：
- [ ] **concept-card**（概念定义卡）
- [ ] **analogy-block**（类比说明块）
- [ ] **diagram-block**（示意图）

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
已完成：25
进度：21%
```

更新本文件时同步：
1. 在已完成区添加条目
2. 在待完成区勾掉对应条目
3. 更新进度数字
