# md-html-forge 文档中心

## 文档结构

```
docs/
├── README.md                              ← 你在这里
│
├── engine/                                ← 引擎参考（长青文档）
│   ├── architecture.md                   编译器架构（lexer/parser/resolver/emitter）
│   ├── syntax.md                         完整语法规范（指令、slot、原生 MD 绑定）
│   ├── component-api.md                  组件 API（defineComponent / SlotDef / bind）
│   ├── theme-api.md                      主题 API
│   ├── design-tokens.md                  颜色/字体/阴影 token 规范
│   └── extensibility.md                  扩展点（registerXxx）
│
├── migration/                             ← 迁移规范
│   ├── overview.md                       从 html-effectiveness 迁移的总览
│   ├── workflow.md                       标准 7 步迁移流程
│   ├── checklist.md                      12 项验收清单
│   ├── inventory.md                      已完成 + 待完成清单（动态更新）
│   └── examples/
│       └── stat-card-walkthrough.md      完整迁移示例（必读）
│
└── prompts/                               ← 给 agent 的任务提示词
    ├── component-migration.md            单组件迁移
    ├── batch-migration.md                整个 HTML 批量迁移
    └── review.md                         独立交叉审查
```

## 谁该读什么

### 我是引擎 contributor / 主框架开发者

- 读 `engine/architecture.md` 建立心智模型
- 改 compiler 前必须先理解 `engine/syntax.md`
- 加新扩展点时参考 `engine/extensibility.md`

### 我要迁移一个组件

1. 先读 `engine/component-api.md`（核心）
2. 再读 `engine/design-tokens.md`（避免 hardcode）
3. 然后看 `migration/workflow.md` 了解 7 步流程
4. 看完 `migration/examples/stat-card-walkthrough.md` 这个完整案例
5. 按 `migration/checklist.md` 自检

### 我要派发任务给其他 agent

复制 `prompts/component-migration.md` 或 `prompts/batch-migration.md` 的内容（`<task>` 之间）发给 agent，把 `{{...}}` 占位符替换成实际值。

### 我要 review 别人的迁移

复制 `prompts/review.md` 内容发给一个独立 agent。reviewer 不能信任作者的自我报告。

### 我是用户 / 文档作者

读 `engine/syntax.md` 学完整语法。

## 如何派发任务

### 单组件任务

```
打开 docs/prompts/component-migration.md
复制 <task>...</task> 之间的内容
替换：
  {{HTML_FILE}}            → 例如 11-status-report.html
  {{UNIT_DESCRIPTION}}     → 例如 "顶部 4 列 KPI 网格中的卡片单元"
  {{COMPONENT_ID}}         → 例如 stat-card
  {{CATEGORY}}             → 例如 card
发给 agent
```

### 批量任务（整个 HTML）

```
打开 docs/prompts/batch-migration.md
复制 <task>...</task> 之间的内容
替换：
  {{HTML_FILE}}                → 例如 11-status-report.html
  {{HTML_THEME_DESCRIPTION}}   → 例如 "项目状态周报：状态总览 + KPI + 更新列表 + 风险"
发给资深 agent
```

### Review 任务

```
打开 docs/prompts/review.md
复制 <task>...</task> 之间的内容
替换：
  {{COMPONENT_ID}}   → 要 review 的组件 id
  {{CATEGORY}}       → 该组件的 category
  {{HTML_FILE}}      → 它来源的 HTML 文件
发给独立 reviewer agent（不能是写它的同一个 agent）
```

## 工作流推荐

```
[用户]
  ↓
  按 inventory.md 选 1-2 个 HTML 任务
  ↓
[Agent A] ← 派发 prompts/batch-migration.md
  ↓
  按 workflow.md 7 步法迁移
  ↓
  自检 checklist.md 12 项
  ↓
  报告
  ↓
[Agent B] ← 派发 prompts/review.md（独立 agent）
  ↓
  独立验证 12 项 + 视觉对比 + 主题测试
  ↓
  Approve / Reject / Approve with comments
  ↓
[用户]
  ↓
  Reject → 把 review 反馈给 Agent A 修改
  Approve → 合并并更新 inventory.md
```

## 文档约定

- 所有路径用绝对路径（`/data/workspace/md-html-forge/...`）方便 agent 直接 read_file
- 提示词中的 `{{XXX}}` 是必填占位符
- 文档之间引用统一用相对路径（如 `[component-api.md](../engine/component-api.md)`）

## 不在文档里的隐式契约

这些是项目级约定，所有人**默认遵守**：

1. **不破坏向后兼容**：组件 id 一旦发布不可改名（用户的 @compose 会断）
2. **不引入新依赖**：除非经过明确讨论
3. **不改 shared-tokens**：除非新增 token 经过明确讨论
4. **不改 compiler 主框架**：迁移组件不需要改任何编译器代码
5. **0 hardcode 颜色**：所有颜色都走 token

## 反馈

如果某个文档让你感到困惑或缺失，直接修改对应文件然后 commit 即可。文档是项目的一等公民。
