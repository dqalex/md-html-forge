# 迁移总览

把 `src/templates/html-effectiveness/` 下的 **20 个完整 HTML 模板**（每个 ~400-800 行）拆解为可复用的 **forge 组件**。

## 目标

| 当前 | 目标 |
|---|---|
| 20 个独立 HTML，每个文件 400-800 行 | ~120 个细粒度组件 |
| 每个 HTML 自带 CSS（重复定义 token） | 共享 token + 组件专属 CSS（命名空间隔离） |
| 内容硬编码在 HTML 里 | MD slot 驱动，可循环、可主题切换、可分享 |
| 无法被其他模板复用 | 任何用户 `@compose` 引用 |

## 范围

`src/templates/html-effectiveness/` 下的 HTML 文件：

```
01-exploration-code-approaches.html      → exploration / approach-card / prompt-box ...
02-exploration-visual-designs.html       → design-mockup-card ...
03-code-review-pr.html                   → diff-block / review-comment / pr-summary ...
04-code-understanding.html               → code-walk-through / call-graph ...
05-design-system.html                    → token-swatch / type-scale / spacing-grid ...
06-component-variants.html               → variant-grid / variant-card ...
07-prototype-animation.html              → animation-frame / motion-spec ...
08-prototype-interaction.html            → interaction-state / state-machine ...
09-slide-deck.html                       → slide / slide-cover ...
10-svg-illustrations.html                → svg-frame / illustration-grid ...
11-status-report.html                    → status-band / kpi-grid ...
12-incident-report.html                  → incident-summary / incident-timeline ...
13-flowchart-diagram.html                → flowchart-node / flowchart-edge ...（可能与 ```flow 重叠）
14-research-feature-explainer.html       → feature-explainer / feature-anatomy ...
15-research-concept-explainer.html       → concept-card / analogy-block ...
16-implementation-plan.html              → plan-phase / plan-task / plan-risk ...
17-pr-writeup.html                       → change-summary / commit-list ...
18-editor-triage-board.html              → kanban-column / kanban-card ...
19-editor-feature-flags.html             → flag-row / flag-state ...
20-editor-prompt-tuner.html              → prompt-comparison / prompt-version ...
index.html                               → （无需迁移：是导航页）
```

## 已完成（25 个）

```
header/      header, meta-pills
summary/     tldr, lead
content/     body, code, qa
card/        feature-card, stat-card
list/        actions, checklist, highlights, milestones, timeline
visual/      before-after, options, progress, rollout
data/        metrics, summary-band, table
layout/      flex-row, grid-2, grid-3, grid-4
footer/      footer
```

## 工作分配建议

每个 HTML 文件作为**一个独立任务**派发给一个 agent。每个任务：
- 输入：1 个 HTML 文件
- 输出：3–8 个新组件（按颗粒度估算）
- 工时：约 1–2 小时（含 review）

20 个 HTML × 平均 6 个组件 ≈ **120 个新组件**。

## 总流程

```
1. 阅读源 HTML，识别"可复用单元"   ← 拆解颗粒度判断（详见 workflow.md）
2. 为每个单元写 ComponentDef
3. 提取共享 CSS 到 shared-tokens（如有需要）
4. 注册到对应 category 的 index.ts
5. 写一个 demo MD 验证组件渲染正确
6. tsc + eslint 0 错误
7. 在浏览器看预览，与原 HTML 对比像素级一致
```

## 颗粒度判断（关键）

✅ **应该独立成组件**：
- 在多个 HTML 中重复出现的视觉单元
- 单个 HTML 中重复 2+ 次（典型循环单元）
- 有清晰的"槽位"（标题 + 内容 + 元数据）
- 大小适中（30-150 行 CSS / HTML）

❌ **不应独立成组件**：
- 仅出现一次且与其他元素强耦合的装饰
- 太小（< 20 行 CSS）—— 应作为父组件的一部分
- 太大（> 250 行 CSS）—— 应继续拆分
- 实际上是布局容器 —— 应该用现有的 layout 组件

## 文件命名

`src/builtin/components/<category>/<id>.ts`

- id 用 kebab-case
- 文件名 = id（不要单数/复数变化）
- 优先选择源 HTML 里 CSS class 的命名（去掉前缀），保持可追溯性

例：源 HTML 用 `.approach-card` → 文件 `card/approach-card.ts`，id `approach-card`

## 评估"完成"

每个组件通过 [`checklist.md`](./checklist.md) 的 12 项验收。每个 HTML 任务通过 review 后才能合并。
