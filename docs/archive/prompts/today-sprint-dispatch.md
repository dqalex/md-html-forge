# 今日冲刺并行派发计划（2026-05-10）

> 本文档是产品方向调整后**今日冲刺**的并行作战指南。
>
> 总目标：今天跑通新方向的端到端 demo（详见 `docs/product/roadmap.md`）。

## 总览

主 agent（我）负责**串行关键路径**，其他 agent 并行处理**6 个组件合并任务** + **forge.md 起草** + **demo 撰写** + **review 验收**。

```
[ 主路径 / 主 agent 串行 ]
  ① 基座清理 → ② Loader → ③ 引擎改造（变体 + JS 双向同步） → ⑤ demo 集成

[ 并行 / 派发给其他 agent ]
  Agent A-F: 6 个组件合并任务（card / list-item / callout / panel / table-like / timeline）
  Agent G:   forge.md 对外规范起草
  Agent H:   demo MD 撰写
  Agent R:   独立 reviewer，验收 A-F
```

## 派发清单

### 任务 A：合并 card 类组件

▶▶▶ 复制以下整段发给 Agent A ▶▶▶

> 任务文件：`/data/workspace/md-html-forge/docs/prompts/forge-md-component-merge.md`
>
> 占位符填充：
> - `{{TARGET_ID}}` = `card`
> - `{{TARGET_CATEGORY}}` = `card`
> - `{{REFERENCE_FILE}}` = （暂无样板，请严格按 `docs/product/component-package.md` 第 4 节最小示例）
> - `{{SOURCE_COMPONENTS}}` =
>   ```
>   - feature-card  → variant: standard
>   - stat-card     → variant: stat
>   - approach-card → variant: approach
>   - variant-card  → variant: variant
>   - decision-card → variant: decision
>   - detail-panel  → variant: detail
>   - sample-card   → variant: sample
>   - ticket-card   → variant: ticket
>   ```
>
> 注意：8 个变体超过了 `component-package.md` 第 3.2 节"最多 4 个变体"的约束。请在 Step 1 输出合并分析后，**主动建议**最优的合并方案：
> 1. 拆分为两个原子组件（如 `card` 和 `info-panel`）
> 2. 或将相似度高的变体进一步合并（如 stat / sample 都是数据卡）
>
> 等主 agent 确认你的合并方案后，再进入 Step 2。

▶▶▶ END ▶▶▶

---

### 任务 B：合并 list-item 类组件

▶▶▶ 复制以下整段发给 Agent B ▶▶▶

> 任务文件：`/data/workspace/md-html-forge/docs/prompts/forge-md-component-merge.md`
>
> 占位符填充：
> - `{{TARGET_ID}}` = `list-item`
> - `{{TARGET_CATEGORY}}` = `list`
> - `{{REFERENCE_FILE}}` = （暂无样板，按规范文档执行）
> - `{{SOURCE_COMPONENTS}}` =
>   ```
>   - ship-item            → variant: shipped
>   - carryover-item       → variant: carryover
>   - focus-item           → variant: focus
>   - shipped-row          → variant: row-shipped
>   - file-changed-row     → variant: row-file
>   - file-entry           → variant: file-entry
>   - action-row           → variant: action
>   ```
>
> 注意：7 个变体超过约束。Step 1 的合并分析里请建议 1-2 个原子组件的拆分方案（如 list-item 和 list-row 拆开），等确认后进入 Step 2。

▶▶▶ END ▶▶▶

---

### 任务 C：合并 callout 类组件

▶▶▶ 复制以下整段发给 Agent C ▶▶▶

> 任务文件：`/data/workspace/md-html-forge/docs/prompts/forge-md-component-merge.md`
>
> 占位符填充：
> - `{{TARGET_ID}}` = `callout`
> - `{{TARGET_CATEGORY}}` = `visual`
> - `{{REFERENCE_FILE}}` = （暂无样板，按规范文档执行）
> - `{{SOURCE_COMPONENTS}}` =
>   ```
>   - concept-callout  → variant: concept
>   - callout-note     → variant: note
>   - warn-banner      → variant: warn
>   - open-questions   → variant: questions
>   - recommendation   → variant: recommendation
>   ```

▶▶▶ END ▶▶▶

---

### 任务 D：合并 panel 类组件

▶▶▶ 复制以下整段发给 Agent D ▶▶▶

> 任务文件：`/data/workspace/md-html-forge/docs/prompts/forge-md-component-merge.md`
>
> 占位符填充：
> - `{{TARGET_ID}}` = `panel`
> - `{{TARGET_CATEGORY}}` = `visual`
> - `{{REFERENCE_FILE}}` = （暂无样板，按规范文档执行）
> - `{{SOURCE_COMPONENTS}}` =
>   ```
>   - snippet-panel    → variant: snippet
>   - glossary-panel   → variant: glossary
>   - prompt-box       → variant: prompt
>   ```
>
> 说明：detail-panel 已分配给任务 A（card），不在此任务内。

▶▶▶ END ▶▶▶

---

### 任务 E：合并 table-like 类组件

▶▶▶ 复制以下整段发给 Agent E ▶▶▶

> 任务文件：`/data/workspace/md-html-forge/docs/prompts/forge-md-component-merge.md`
>
> 占位符填充：
> - `{{TARGET_ID}}` = `table`
> - `{{TARGET_CATEGORY}}` = `data`
> - `{{REFERENCE_FILE}}` = （暂无样板，按规范文档执行）
> - `{{SOURCE_COMPONENTS}}` =
>   ```
>   - table         → variant: standard
>   - risk-table    → variant: risk
>   - impact-table  → variant: impact
>   - flag-row      → variant: flag
>   ```
>
> 注意：源组件 `table` 已存在同名 TS 实现，新文件命名 `table.forge.md` 是有意覆盖（旧 TS 文件由主 agent 统一删除，不在你任务内）。

▶▶▶ END ▶▶▶

---

### 任务 F：合并 timeline 类组件

▶▶▶ 复制以下整段发给 Agent F ▶▶▶

> 任务文件：`/data/workspace/md-html-forge/docs/prompts/forge-md-component-merge.md`
>
> 占位符填充：
> - `{{TARGET_ID}}` = `timeline`
> - `{{TARGET_CATEGORY}}` = `list`
> - `{{REFERENCE_FILE}}` = （暂无样板，按规范文档执行）
> - `{{SOURCE_COMPONENTS}}` =
>   ```
>   - timeline                  → variant: standard
>   - milestones                → variant: milestones
>   - incident-timeline-entry   → variant: incident
>   ```

▶▶▶ END ▶▶▶

---

### 任务 G：起草 forge.md 对外规范

▶▶▶ 复制以下整段发给 Agent G ▶▶▶

> # 任务：起草 `forge.md` —— 给 AI 的对外项目规范
>
> 项目位于 `/data/workspace/md-html-forge`。
>
> 这份 `forge.md` 是产品最重要的对外资产。它将公开发布在官网/GitHub，作为系统提示词（system prompt）的一部分，指导 Claude 等 AI 按规范产出 markdown，让本产品能正确渲染。
>
> ## 必读
>
> 1. `docs/product/positioning.md` — 产品定位（为什么需要这份规范）
> 2. `docs/product/direction.md` — 决策清单（特别是决策 1、2、3、7）
> 3. `docs/product/component-package.md` — 组件包格式
> 4. `docs/engine/syntax.md` — 用户/AI 写 MD 时用的指令语法
> 5. `docs/engine/design-tokens.md` — 设计 token
>
> ## 输出
>
> 在 `/data/workspace/md-html-forge/docs/product/forge.md` 创建这份文档。
>
> ## 内容要求
>
> 文档面向 AI（不是开发者），使用直白、命令式的语言。结构建议：
>
> 1. **What is forge** — 一段话告诉 AI 这是什么、它该怎么帮用户
> 2. **核心约束** — AI 必须遵守的事（用 ✅ / ❌ 列表）
> 3. **指令清单** — `@page` / `@compose` / `@layout` / `@theme` / `@use` / `@slot` / `@compose-group` / `@item` 各自怎么用，给 1 个最小示例
> 4. **变体使用** — 通过 `@use comp variant=xxx` 切换变体（详见 `direction.md` 决策 1）
> 5. **组件清单** — 列出当前可用的原子组件 + 各自的变体（**注意**：今天 6 个组件正在合并中，先列出 6 个原子组件 + 它们的预期变体；旧的散组件加注"过渡期保留"）
> 6. **slot 用法** — text / content / data 三种 type 的写法和场景
> 7. **data slot 的统一 DSL** — 每行 + `|` 分隔列（详见 `component-package.md` 第 3.3 节）
> 8. **主题** — 3 个内置主题（editorial / dark / sage）+ 自定义提示
> 9. **典型场景示例** — 给 4 个典型场景（周报 / PR review / 事故报告 / 产品说明）的最小可用 MD
>
> ## 风格要求
>
> - 语言直白，不要华丽辞藻（AI 不需要被打动，需要被指令）
> - 每个规则都要有反例（"不要这样做"）
> - 字数控制：3000-5000 字（给 AI 足够上下文，但不冗长）
> - 不要重复 `component-package.md` 的内容（那是给开发者写组件的，不是给 AI 写文档的）
>
> ## 完成后报告
>
> ```markdown
> ## forge.md 起草完成
>
> - 文件：docs/product/forge.md
> - 字数：{{n}}
> - 覆盖的指令：8/8
> - 覆盖的组件：6 个原子组件 + N 个过渡期保留的旧组件
> - 典型场景示例：4 个
> - 已知缺口：（如 6 个原子组件的变体清单还未最终敲定，标注"待更新"）
> ```

▶▶▶ END ▶▶▶

---

### 任务 H：撰写 demo MD

▶▶▶ 复制以下整段发给 Agent H ▶▶▶

> # 任务：撰写端到端 demo MD
>
> 项目位于 `/data/workspace/md-html-forge`。
>
> ## 必读
>
> 1. `docs/product/positioning.md`
> 2. `docs/product/component-package.md` 第 5 节（变体的 MD 用法）
> 3. `docs/engine/syntax.md`
> 4. 6 个新合并的组件包（在 `src/builtin/components/<category>/*.forge.md`，主 agent 会通知你哪些已就绪）
>
> ## 输出
>
> 创建 `/data/workspace/md-html-forge/demo-today-sprint.md`，要求：
>
> 1. 用一份**完整、有真实内容**的 MD 文档（如一份"虚构周报"或"虚构 PR 总结"），覆盖：
>    - 至少使用 6 个新合并的原子组件中的 4 个
>    - 至少展示 3 次变体切换（用 `@use xxx variant=yyy`）
>    - 至少 2 处可交互元素（checkbox / 折叠 / tab）— 验证 JS 双向同步
>    - 至少 1 处带 data slot 的组件（验证 DSL 解析）
>    - 主题切换：用 `@theme dark` 让其中一段变深色
>
> 2. 内容要"看起来像真实场景"，不要堆砌 lorem ipsum
>
> 3. 文件顶部加一段注释：
>    ```markdown
>    <!--
>      Demo: Today Sprint Verification
>      Date: 2026-05-10
>      用途：验证产品方向调整后的端到端能力
>      覆盖：变体切换 / 双向同步 / 主题 / data DSL
>    -->
>    ```
>
> ## 完成后报告
>
> ```markdown
> ## demo-today-sprint.md 完成
>
> - 用到的原子组件：A, B, C, D
> - 变体切换次数：N
> - 交互元素：checkbox × 2, 折叠 × 1
> - 主题段数：2（editorial + dark）
> - 行数：{{n}}
> ```

▶▶▶ END ▶▶▶

---

### Reviewer 任务（A-F 完成后串行派发）

每个合并任务完成后，立即派发独立 reviewer 验收：

▶▶▶ 复制以下整段发给 Agent R ▶▶▶

> 任务文件：`/data/workspace/md-html-forge/docs/prompts/forge-md-review.md`
>
> 占位符填充：
> - `{{TARGET_ID}}` = `（A-F 中任意，按完成顺序）`
> - `{{TARGET_CATEGORY}}` = `（对应 category）`
> - `{{SOURCE_COMPONENTS}}` = `（对应任务的源组件清单）`
>
> 请按 review.md 的 5 步流程，输出 Approve / Reject / Approve-with-comments 决议。

▶▶▶ END ▶▶▶

## 派发节奏建议

```
T+0     ─ 主 agent 启动基座清理
        ─ 同时派发 A / B / C / D / E / F / G / H 8 个并行任务
T+1h    ─ A-F 输出 Step 1 合并分析，主 agent 确认合并方案
T+3h    ─ A-F 完成 .forge.md，立即派发 Reviewer R 串行 review
        ─ 主 agent 完成基座清理 + Loader
T+5h    ─ Reviewer R 完成所有 6 个 review，作者修复 Reject
        ─ 主 agent 完成引擎改造（变体 + JS 双向同步）
T+6h    ─ Agent G 完成 forge.md，Agent H 完成 demo MD
T+7h    ─ 主 agent 集成所有产物，跑端到端 demo
T+8h    ─ 验证：MD → 渲染 → 切变体 → 改内容回写 MD ✓
```

## 冲突避免

不同 agent 改不同文件，理论上无冲突。但**两处例外**：

1. **`src/builtin/components/<category>/index.ts`** — 多个 agent 任务都涉及同 category，**全部由主 agent 统一更新**，作者不动 index.ts
2. **旧组件的 .ts 文件删除** — 不允许任何作者删除源 .ts 文件，**全部由主 agent 在所有合并完成后统一删除**

## 验收门槛

每个 `.forge.md` 必须：

- [ ] 通过 reviewer 的独立审查（Approve 或 Approve with comments）
- [ ] 主 agent 跑通"该组件的 sample MD → 渲染 → 视觉检查"
- [ ] 至少 1 个变体可以在新引擎下切换

只要任意一项不过，回炉到对应 agent 修复。

## 今日 KPI

```
✅ 6 个 .forge.md 全部 reviewer Approve
✅ 1 份 forge.md 对外规范完成
✅ 1 份 demo MD 跑通端到端
✅ 主 agent 完成基座清理 + Loader + 变体 + JS 双向同步
✅ 端到端 demo：MD → 渲染 → 点切变体 → 改内容回写 MD ✓
```
