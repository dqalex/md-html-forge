# 今日冲刺 Phase 2 并行派发（2026-05-10 下午）

> 本文档是产品方向调整后**第二批**派发任务。
>
> Phase 1 已完成 6 个原子组件合并（card / info-panel / list-item / list-row / timeline / table / callout / panel）。
> Phase 2 处理剩下未合并的 ~20 个组件。

## 重要前置知识

每个 agent 在开始前**必读**：

1. `/data/workspace/md-html-forge/docs/product/positioning.md` — 产品定位
2. `/data/workspace/md-html-forge/docs/product/direction.md` — 方向决策（特别是决策 1 和 7）
3. `/data/workspace/md-html-forge/docs/product/component-package.md` — `.forge.md` 格式规范
4. `/data/workspace/md-html-forge/docs/engine/design-tokens.md` — token 规范
5. **样板参考**：`/data/workspace/md-html-forge/src/builtin/components/list/list-row.forge.md` — 已 Approve 的标准产物

## ⚠️ 新增格式要求（Phase 1 之后增加的硬约束）

### 变体切片标记必须是 `<!-- variant: xxx -->`

Phase 1 用了 `<!-- xxx variant -->`，Phase 2 起**统一为** `<!-- variant: xxx -->`，因为 loader 按这个格式切片。

正确示例：

```html
<div class="comp-xxx" data-section="xxx" data-variant="{{variant}}">
  <!-- variant: standard -->
  <div class="xxx-standard">
    <h3 data-slot="title"></h3>
  </div>

  <!-- variant: compact -->
  <div class="xxx-compact">
    <span data-slot="title"></span>
  </div>
</div>
```

引擎运行时只会输出当前 variant 对应的片段，**绝对不要让所有变体都渲染靠 CSS 隐藏**。

### CSS 不要写 `.xxx-standard { display: none }` 这种 hack

由于引擎只输出对应 variant 的 HTML，CSS 里**不需要**写 `display:none` 隐藏其他变体。直接给每个变体写正向样式即可。

### 每个变体的 CSS 用注释清晰分组

```css
/* ===== variant: standard ===== */
.comp-xxx[data-variant="standard"] { ... }

/* ===== variant: compact ===== */
.comp-xxx[data-variant="compact"] { ... }
```

---

## 派发清单

### 任务 J：合并 data category 的指标类组件 → `metric.forge.md`

▶▶▶ 复制以下整段发给 Agent J ▶▶▶

> 任务文件：`/data/workspace/md-html-forge/docs/prompts/forge-md-component-merge.md`
>
> 占位符填充：
> - `{{TARGET_ID}}` = `metric`
> - `{{TARGET_CATEGORY}}` = `data`
> - `{{REFERENCE_FILE}}` = `list/list-row.forge.md`（标准样板）
> - `{{SOURCE_COMPONENTS}}` =
>   ```
>   - summary-band  → variant: band（顶部状态条 / 多列指标横排）
>   - metrics       → variant: hero（大号 hero 指标 + 趋势）
>   - slide-metric  → variant: slide（幻灯片用大数值 + 标签 + 趋势）
>   ```
>
> ⚠️ 必读：`docs/prompts/today-sprint-phase2-dispatch.md` 顶部"⚠️ 新增格式要求"小节
>
> 注意事项：
> 1. variant 切片必须用 `<!-- variant: xxx -->` 注释
> 2. CSS 不要用 `display:none` 隐藏其他 variant
> 3. data slot 的 DSL 统一为"每行 + `|` 分隔"
> 4. 旧组件的 .ts 不要删除，由主 agent 统一处理

▶▶▶ END ▶▶▶

---

### 任务 K：合并 data category 的 PR/file 类 → 已并入 `list-row`

PR-summary 和 key-files 不需要合并到现有 list-row，但需要单独迁移：

▶▶▶ 复制以下整段发给 Agent K ▶▶▶

> 任务文件：`/data/workspace/md-html-forge/docs/prompts/forge-md-component-merge.md`
>
> 占位符填充：
> - `{{TARGET_ID}}` = `pr-summary`
> - `{{TARGET_CATEGORY}}` = `data`
> - `{{REFERENCE_FILE}}` = `list/list-row.forge.md`（标准样板）
> - `{{SOURCE_COMPONENTS}}` =
>   ```
>   - pr-summary  → variant: standard（PR 总览：标题 / 作者 / diff stats）
>   - key-files   → variant: keyfiles（关键文件路径 + 描述面板）
>   ```
>
> ⚠️ 必读：`docs/prompts/today-sprint-phase2-dispatch.md` 顶部"⚠️ 新增格式要求"小节
>
> 这两个组件视觉差异较大但都是"PR/code review 场景的数据展示面板"，合并为一个 `pr-summary` 组件的 2 个变体。
>
> 如果你 Step 1 分析后觉得不该合并（视觉骨架完全不同），停下来报告，不要硬合。

▶▶▶ END ▶▶▶

---

### 任务 L：合并 visual category 的"对比类" → `comparison.forge.md`

▶▶▶ 复制以下整段发给 Agent L ▶▶▶

> 任务文件：`/data/workspace/md-html-forge/docs/prompts/forge-md-component-merge.md`
>
> 占位符填充：
> - `{{TARGET_ID}}` = `comparison`
> - `{{TARGET_CATEGORY}}` = `visual`
> - `{{REFERENCE_FILE}}` = `list/list-row.forge.md`（标准样板）
> - `{{SOURCE_COMPONENTS}}` =
>   ```
>   - before-after  → variant: ba（前后对比，左右两栏）
>   - options       → variant: options（多个选项卡片对比，首项高亮）
>   - mockup-card   → variant: mockup（设计方案预览卡）
>   ```
>
> ⚠️ 必读：`docs/prompts/today-sprint-phase2-dispatch.md` 顶部"⚠️ 新增格式要求"小节

▶▶▶ END ▶▶▶

---

### 任务 M：合并 visual category 的"进度类" → `progress.forge.md`

▶▶▶ 复制以下整段发给 Agent M ▶▶▶

> 任务文件：`/data/workspace/md-html-forge/docs/prompts/forge-md-component-merge.md`
>
> 占位符填充：
> - `{{TARGET_ID}}` = `progress`
> - `{{TARGET_CATEGORY}}` = `visual`
> - `{{REFERENCE_FILE}}` = `list/list-row.forge.md`（标准样板）
> - `{{SOURCE_COMPONENTS}}` =
>   ```
>   - progress   → variant: bars（多行进度条列表）
>   - prog-item  → variant: item（单个进度条 + 标题 + 百分比 + 备注）
>   - rollout    → variant: rollout（分阶段灰度发布步骤）
>   ```
>
> ⚠️ 必读：`docs/prompts/today-sprint-phase2-dispatch.md` 顶部"⚠️ 新增格式要求"小节

▶▶▶ END ▶▶▶

---

### 任务 N：合并 visual category 的"代码 + diff" → `code-block.forge.md`

▶▶▶ 复制以下整段发给 Agent N ▶▶▶

> 任务文件：`/data/workspace/md-html-forge/docs/prompts/forge-md-component-merge.md`
>
> 占位符填充：
> - `{{TARGET_ID}}` = `code-block`
> - `{{TARGET_CATEGORY}}` = `visual`
> - `{{REFERENCE_FILE}}` = `list/list-row.forge.md`（标准样板）
> - `{{SOURCE_COMPONENTS}}` =
>   ```
>   - diff-block       → variant: diff（带颜色的 +/- 行）
>   - code-walkthrough → variant: walkthrough（编号步骤 + 文件位置 + 代码）
>   ```
>
> ⚠️ 必读：`docs/prompts/today-sprint-phase2-dispatch.md` 顶部"⚠️ 新增格式要求"小节

▶▶▶ END ▶▶▶

---

### 任务 O：合并 visual category 的"chip / pill 标签类" → `chip.forge.md`

▶▶▶ 复制以下整段发给 Agent O ▶▶▶

> 任务文件：`/data/workspace/md-html-forge/docs/prompts/forge-md-component-merge.md`
>
> 占位符填充：
> - `{{TARGET_ID}}` = `chip`
> - `{{TARGET_CATEGORY}}` = `visual`
> - `{{REFERENCE_FILE}}` = `list/list-row.forge.md`（标准样板）
> - `{{SOURCE_COMPONENTS}}` =
>   ```
>   - risk-chip      → variant: risk（风险等级胶囊）
>   - incident-pill  → variant: incident（事件标签 sev/resolved/neutral）
>   - flow-legend    → variant: legend（图例条 chipType + 标签）
>   ```
>
> ⚠️ 必读：`docs/prompts/today-sprint-phase2-dispatch.md` 顶部"⚠️ 新增格式要求"小节

▶▶▶ END ▶▶▶

---

### 任务 P：合并 visual category 的"设计系统展示类" → `design-spec.forge.md`

▶▶▶ 复制以下整段发给 Agent P ▶▶▶

> 任务文件：`/data/workspace/md-html-forge/docs/prompts/forge-md-component-merge.md`
>
> 占位符填充：
> - `{{TARGET_ID}}` = `design-spec`
> - `{{TARGET_CATEGORY}}` = `visual`
> - `{{REFERENCE_FILE}}` = `list/list-row.forge.md`（标准样板）
> - `{{SOURCE_COMPONENTS}}` =
>   ```
>   - token-swatch       → variant: swatch（颜色色板）
>   - spacing-grid       → variant: spacing（间距标尺）
>   - radius-sample      → variant: radius（圆角/阴影示例）
>   - animation-keyframe → variant: keyframe（动画关键帧时间线）
>   ```
>
> ⚠️ 必读：`docs/prompts/today-sprint-phase2-dispatch.md` 顶部"⚠️ 新增格式要求"小节
>
> **重要例外说明**：这 4 个组件是"展示设计 token 的元组件"，本质就是把用户输入的颜色值/像素数/百分比等转化为视觉效果。**inline `style="..."` 在这里允许使用**（已在 component-package.md 中标注）。但 inline style 只用于 slot 用户输入的动态值（如 `style="background:{{value}}"`），不允许硬编码颜色。

▶▶▶ END ▶▶▶

---

### 任务 Q：合并 visual category 的"插画 + 注解" → `illustration.forge.md`

▶▶▶ 复制以下整段发给 Agent Q ▶▶▶

> 任务文件：`/data/workspace/md-html-forge/docs/prompts/forge-md-component-merge.md`
>
> 占位符填充：
> - `{{TARGET_ID}}` = `illustration`
> - `{{TARGET_CATEGORY}}` = `visual`
> - `{{REFERENCE_FILE}}` = `list/list-row.forge.md`（标准样板）
> - `{{SOURCE_COMPONENTS}}` =
>   ```
>   - svg-frame         → variant: frame（SVG 外框 + 标题说明）
>   - interaction-notes → variant: notes（交互注解面板）
>   ```
>
> ⚠️ 必读：`docs/prompts/today-sprint-phase2-dispatch.md` 顶部"⚠️ 新增格式要求"小节

▶▶▶ END ▶▶▶

---

### 任务 R：迁移 summary category 的"导语类" → `lead.forge.md`

▶▶▶ 复制以下整段发给 Agent R ▶▶▶

> 任务文件：`/data/workspace/md-html-forge/docs/prompts/forge-md-component-merge.md`
>
> 占位符填充：
> - `{{TARGET_ID}}` = `lead`
> - `{{TARGET_CATEGORY}}` = `summary`
> - `{{REFERENCE_FILE}}` = `list/list-row.forge.md`（标准样板）
> - `{{SOURCE_COMPONENTS}}` =
>   ```
>   - lead          → variant: lead（导语段落）
>   - tldr          → variant: tldr（要点列表 TL;DR）
>   - phase-header  → variant: phase（阶段标题，含编号 + 时间范围）
>   ```
>
> ⚠️ 必读：`docs/prompts/today-sprint-phase2-dispatch.md` 顶部"⚠️ 新增格式要求"小节

▶▶▶ END ▶▶▶

---

## Reviewer 任务（每个完成后立即派发）

每个 J-R 完成后立即派发独立 reviewer：

▶▶▶ 复制以下整段发给独立 reviewer ▶▶▶

> 任务文件：`/data/workspace/md-html-forge/docs/prompts/forge-md-review.md`
>
> 占位符填充：
> - `{{TARGET_ID}}` = `（J-R 中任意，按完成顺序）`
> - `{{TARGET_CATEGORY}}` = `（对应 category）`
> - `{{SOURCE_COMPONENTS}}` = `（对应任务的源组件清单）`
>
> **额外检查项**（Phase 2 强制）：
> - [ ] HTML 中变体切片用 `<!-- variant: xxx -->` 注释（不是 `<!-- xxx variant -->`）
> - [ ] CSS **没有** `.xxx-foo { display: none }` 这种隐藏不同变体的 hack
> - [ ] 每个变体在 CSS 里有清晰的 `/* ===== variant: xxx ===== */` 分组注释
>
> 任何格式不达标 = Reject。

▶▶▶ END ▶▶▶

---

## 冲突避免

不同 agent 改不同文件，理论上无冲突。但：

1. **`src/builtin/components/<category>/index.ts`** — 由主 agent 统一更新
2. **删除旧 .ts 文件** — 由主 agent 统一处理（每个 agent 在报告里列出"可删除文件清单"即可）

## 节奏

```
T+0    主 agent 完成核心架构（loader / runtime / 5 个 .forge.md 格式标准化）
       同时派发 J/K/L/M/N/O/P/Q/R 9 个并行任务

T+2h   J-R 输出 .forge.md，立即派 reviewer
       主 agent 完成 5 个老 .forge.md 改为 <!-- variant: xxx --> 格式

T+3h   reviewer 决议陆续返回，主 agent 把通过的 forge 文件接入 index.ts

T+4h   主 agent 跑 tsc + 端到端 demo
```

## 不在派发范围内的（保留 .ts 形态）

以下组件保留为 TypeScript `defineComponent` 形态，引擎兼容两种格式：

- `header/`: header, meta-pills
- `content/`: body, code, qa
- `footer/`: footer
- `layout/`: grid-2/3/4, flex-row
- `summary/`: prompt-box, recommendation（已合并到 callout/panel 的变体，由主 agent 删除 .ts）
- `card/`: review-comment, drag-list-item（功能特殊，暂不合并）
- `list/`: actions, checklist, highlights, setup-steps, slide-agenda, collapse-section, faq-item（这些是真正的"列表类"组件，与 list-item 性质不同，保留独立）
- `special/`: slide-cover

这些不影响今日冲刺验收。
