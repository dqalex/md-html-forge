# 任务提示词目录索引

本目录存放派发给 agent 的任务 prompt。**用前先确认你要走哪条路径**。

## 路径 A：当前主推 — Post-review follow-ups（2026-05-11）

review 后整理的 7 个独立任务包，每个自带验收标准 + 提示词 + 参考文件。

**入口**：[`post-review-followups.md`](./post-review-followups.md)

任务清单（按优先级）：
- **F1** P1 中 — `findContentSlot` 多 content slot 支持
- **F2** P1 中 — `@item` 块内支持 md-binding 自动绑定
- **F3** P2 大 — 实现 18 个未实现组件（按优先级分批）
- **F4** P2 中 — `@item` 支持 variant 透传
- **F5** P2 小 — 移除 starter generator 的装饰注释
- **F6** P3 中 — 跨段绑定（`@theme` / `@layout` 切段后保留 `@use` 上下文）
- **F7** P3 小 — audit 脚本增强（HTML 平衡 / a11y / heading 层级）

每个任务**独立可分发**，agent 拿到后可以单干而不影响其他任务。

## 路径 B：今日冲刺（旧文档，仅保留参考）

| 文件 | 用途 |
|---|---|
| [`today-sprint-dispatch.md`](./today-sprint-dispatch.md) | 旧的并行作战 prompt（已完成的部分） |
| [`forge-md-component-merge.md`](./forge-md-component-merge.md) | 合并组件的执行模板 |
| [`forge-md-review.md`](./forge-md-review.md) | reviewer 审查流程 |
| [`template-audit.md`](./template-audit.md) | 模板审查 prompt（已被 `npm run audit:templates` 替代） |

## 路径 C：旧组件迁移（已弃用）

从 `html-effectiveness/` HTML 迁移为 TypeScript `defineComponent` 的旧 prompt。**不要再启动新任务**。

| 文件 | 状态 |
|---|---|
| `component-migration.md` | 🟡 已弃用 |
| `batch-migration.md` | 🟡 已弃用 |
| `review.md` | 🟡 已弃用 |
| `_dispatch-examples.md` | 🟡 已弃用 |

## 派发原则

- 每个 agent 拿到 prompt 后，第一件事必须是 **`read_file` 必读文档**，而不是直接动手
- 不同 agent 改不同文件，避免冲突；改公共文件（如 `index.ts`）由主 agent 统一处理
- Reviewer 必须是**独立 agent**，不能是写它的同一个 agent
- 任何阻塞**立即停下来报告**，不要硬编码绕过
- 任务完成后**必须**跑通：`npm run typecheck` + `npm run audit:templates`（21/21）

