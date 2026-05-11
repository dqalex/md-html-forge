# 提示词：单组件迁移

> **使用方式**：把以下整段（包括 `<task>` 之间的内容）作为 prompt 发给 agent。把 `{{...}}` 占位符替换成具体值。

---

<task>

# 角色

你是 **md-html-forge** 项目的组件迁移工程师。项目位于 `/data/workspace/md-html-forge`。

你的本次任务：把源 HTML 中的某个视觉单元，迁移为一个 forge 组件。

# 必读文档（按顺序）

执行任务前，**必须依次读完**以下文件，建立完整心智模型：

1. `/data/workspace/md-html-forge/docs/engine/architecture.md` —— 编译器架构（5 分钟）
2. `/data/workspace/md-html-forge/docs/engine/syntax.md` —— 完整语法（10 分钟）
3. `/data/workspace/md-html-forge/docs/engine/component-api.md` —— **重点**：组件 API（15 分钟）
4. `/data/workspace/md-html-forge/docs/engine/design-tokens.md` —— 颜色/字体 token（5 分钟）
5. `/data/workspace/md-html-forge/docs/migration/workflow.md` —— **重点**：标准 7 步迁移流程（10 分钟）
6. `/data/workspace/md-html-forge/docs/migration/checklist.md` —— **重点**：12 项验收清单（5 分钟）
7. `/data/workspace/md-html-forge/docs/migration/examples/stat-card-walkthrough.md` —— **重点**：完整示例（10 分钟）

读完上面 7 个文件后，再额外参考一个"已迁移组件"作为代码模板：

8. `/data/workspace/md-html-forge/src/builtin/components/card/feature-card.ts`

# 任务输入

- **源 HTML 文件**：`/data/workspace/md-html-forge/src/templates/html-effectiveness/{{HTML_FILE}}`
- **目标视觉单元**：{{UNIT_DESCRIPTION}}
- **建议组件 id**：`{{COMPONENT_ID}}`（kebab-case，最终由你判断是否合适）
- **建议 category**：`{{CATEGORY}}`（参考 component-api.md 的 category 枚举）

# 工作步骤

严格按 `docs/migration/workflow.md` 的 7 步：

1. **识别**：在源 HTML 中找到 {{UNIT_DESCRIPTION}}，确认它是合理的"可复用单元"。如果不是（太小 / 太大 / 一次性），停下来报告原因。

2. **设计 slot**：列出该单元里所有"会变化的内容"，为每个变化点设计一个 slot。slot 命名 camelCase（`cardTitle` / `statValue`），type 选对（text / content / data / image），尽量加 `bind`。

3. **提取 CSS**：
   - 删除源 HTML 里的全局 reset 和 token 定义
   - 给所有选择器加 `.comp-{{COMPONENT_ID}}` 命名空间
   - 把所有 hardcode 颜色替换为 `var(--xxx)`（参考 design-tokens.md）

4. **写 html(slots)**：
   - 顶部 `if (!any(...)) return '';`
   - 每个可选 slot 用 `!isEmpty(s.x) ? ... : ''` 包条件
   - 每个 slot 输出处加 `data-slot="<name>"`
   - 块级 content slot 加 `data-slot-type="content"`
   - 根元素加 `data-section="{{COMPONENT_ID}}"`

5. **注册**：
   - 创建文件 `src/builtin/components/{{CATEGORY}}/{{COMPONENT_ID}}.ts`
   - 在该 category 的 `index.ts` 里 import 并加入 `XXX_COMPONENTS` 数组
   - 写 `sample` 字段（每个 slot 都给真实示例值）

6. **验证**：
   - 跑 `npx tsc --noEmit`，必须 0 错误
   - 跑 lint 检查，必须 0 错误
   - 写一段最小 demo MD（在你脑中或临时文件），描述：
     - 该 demo 用 @compose 引用新组件
     - 用 @item 或显式 slot 填入示例数据
   - **不需要**真的启动浏览器，但你必须在脑中确认：渲染结果与源 HTML 视觉一致

7. **报告**：完成后输出一段总结，包含：
   - 新组件 id / category
   - slot 列表（含 type 和 bind）
   - CSS 行数
   - HTML 函数行数
   - 12 项验收清单的勾选状态
   - 一段最小 demo MD（用户可以贴进编辑器测试）

# 边界

- **只动这些文件**：
  - 新建 `src/builtin/components/{{CATEGORY}}/{{COMPONENT_ID}}.ts`
  - 修改 `src/builtin/components/{{CATEGORY}}/index.ts`（加 import + 加入数组）
  - 必要时更新 `docs/migration/inventory.md`（勾选完成项）

- **不要动**：
  - `src/builtin/compiler/` 任何文件
  - `src/builtin/components/_base.ts`、`shared-tokens.ts`
  - 其他组件文件
  - `src/components/` 任何文件（这是编辑器 UI）
  - `src/lib/` 任何文件
  - `src/templates/html-effectiveness/` 源 HTML（保持不变作为参考）

- **不要引入新的 npm 依赖**

- **不要改 shared-tokens.ts**（如果你认为需要新 token，停下来报告）

- **如果发现源 HTML 里这个单元实际上和某个已迁移组件等价**，停下来报告，不要重复迁移

# 验收门槛

完成时必须满足 `docs/migration/checklist.md` 的全部 must 项（13 项）。任何一项未通过 = 任务未完成。

# 报告格式

完成后输出（中文）：

```
## 迁移完成：{{COMPONENT_ID}}

### 文件变更
- 新建：src/builtin/components/{{CATEGORY}}/{{COMPONENT_ID}}.ts
- 修改：src/builtin/components/{{CATEGORY}}/index.ts
- 更新：docs/migration/inventory.md

### Slot 列表
| name | type | bind | placeholder |
|---|---|---|---|
| ... | ... | ... | ... |

### 代码量
- CSS: {{N}} 行
- html(): {{N}} 行

### 12 项验收
- [x] / [ ] ...

### 最小 demo（用于验证）

\`\`\`md
<!-- @compose: ... -->
...
\`\`\`

### 备注
- 任何特殊处理 / 与源 HTML 的差异说明
```

如有任何阻塞（slot 设计不确定、CSS 必须破坏 token 等），**停下来报告**，不要硬编码绕过。

</task>
