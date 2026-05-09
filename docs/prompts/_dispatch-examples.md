# 派发示例

> 拿来就能用的 5 个示例。直接复制 ▶▶▶ 之间的内容发给 agent。

---

## 示例 1：批量迁移 11-status-report.html

▶▶▶ 复制以下整段发给 agent ▶▶▶

> 任务文件：`/data/workspace/md-html-forge/docs/prompts/batch-migration.md`
>
> 占位符填充：
> - `{{HTML_FILE}}` = `11-status-report.html`
> - `{{HTML_THEME_DESCRIPTION}}` = "项目状态周报：顶部状态总览条 + 4 列 KPI 网格 + 多组更新列表 + 风险条目 + 行动项"
>
> 请按 `batch-migration.md` 的 task 内容执行：先读完所有必读文档，然后输出 Phase 1 迁移计划，等我确认后再写代码。

▶▶▶ END ▶▶▶

---

## 示例 2：批量迁移 03-code-review-pr.html

▶▶▶ 复制以下整段发给 agent ▶▶▶

> 任务文件：`/data/workspace/md-html-forge/docs/prompts/batch-migration.md`
>
> 占位符填充：
> - `{{HTML_FILE}}` = `03-code-review-pr.html`
> - `{{HTML_THEME_DESCRIPTION}}` = "PR review 报告：PR 总览（标题/作者/diff stats）+ 文件变更列表 + 多个 review 评论 + 代码 diff 块 + 最终 verdict"
>
> 请按 `batch-migration.md` 的 task 内容执行：先读完所有必读文档，然后输出 Phase 1 迁移计划，等我确认后再写代码。

▶▶▶ END ▶▶▶

---

## 示例 3：单组件迁移 - prompt-box

▶▶▶ 复制以下整段发给 agent ▶▶▶

> 任务文件：`/data/workspace/md-html-forge/docs/prompts/component-migration.md`
>
> 占位符填充：
> - `{{HTML_FILE}}` = `01-exploration-code-approaches.html`
> - `{{UNIT_DESCRIPTION}}` = "顶部的 prompt 提示框：含 mono 字体的 'PROMPT' 标签 + 一段 prompt 文本，灰色底 + 灰色边框"
> - `{{COMPONENT_ID}}` = `prompt-box`
> - `{{CATEGORY}}` = `summary`
>
> 请按 `component-migration.md` 的 task 内容执行。完成后按指定格式报告。

▶▶▶ END ▶▶▶

---

## 示例 4：Review 一个新组件

▶▶▶ 复制以下整段发给 reviewer agent（不能是写它的同一个 agent） ▶▶▶

> 任务文件：`/data/workspace/md-html-forge/docs/prompts/review.md`
>
> 占位符填充：
> - `{{COMPONENT_ID}}` = `prompt-box`
> - `{{CATEGORY}}` = `summary`
> - `{{HTML_FILE}}` = `01-exploration-code-approaches.html`
>
> 请独立验证这个组件，按 review.md 的 5 步流程，输出 Approve / Reject / Approve-with-comments 决议。

▶▶▶ END ▶▶▶

---

## 示例 5：批量并发（多个 agent 同时干）

如果你有多个 agent 同时工作，**强烈建议每个 agent 负责不同 category 或不同 HTML 文件**，避免冲突：

```
Agent 1: 11-status-report.html        →  src/builtin/components/data/, list/
Agent 2: 06-component-variants.html   →  src/builtin/components/card/
Agent 3: 18-editor-triage-board.html  →  src/builtin/components/card/, layout/
Agent 4: 05-design-system.html        →  src/builtin/components/data/, visual/
```

如果两个 agent 都要改同一个 `index.ts`：
1. 先让 agent 1 完成并 commit
2. 再让 agent 2 重新 read_file 一遍 index.ts 后 commit

或者：
- 各自 commit 自己新建的组件文件
- 最后由人工 / 协调 agent 统一更新 index.ts

---

## 占位符快速参考

| 占位符 | 在哪个 prompt 用 | 示例值 |
|---|---|---|
| `{{HTML_FILE}}` | component-migration.md / batch-migration.md / review.md | `11-status-report.html` |
| `{{UNIT_DESCRIPTION}}` | component-migration.md | "顶部 4 列 KPI 网格中的卡片单元" |
| `{{COMPONENT_ID}}` | component-migration.md / review.md | `stat-card` |
| `{{CATEGORY}}` | component-migration.md / review.md | `card` |
| `{{HTML_THEME_DESCRIPTION}}` | batch-migration.md | "PR review 报告：含 PR 总览 + diff + 评论 + verdict" |

---

## 验收节奏建议

```
day 1   ─ Agent 全部读完文档 + 完成 inventory 中前 5 个 HTML 的 Phase 1 计划
day 2-3 ─ Phase 2 执行（人工每天 review 一次 progress）
day 4   ─ 全部组件通过 reviewer agent 的独立审查
day 5   ─ 人工最终 review + merge + 更新 inventory.md
```

20 个 HTML 拆给 4-5 个 agent 并行，**预计 2 周完成全部 ~120 个组件**。
