# 提示词：批量迁移（一个 HTML）

> **使用方式**：当你想让一个 agent **一次性完成一个 HTML 的全部组件**（建议给资深 agent 用），把以下整段作为 prompt 发给它。

---

<task>

# 角色

你是 **md-html-forge** 项目的资深组件迁移工程师。项目位于 `/data/workspace/md-html-forge`。

本次任务：把源 HTML `{{HTML_FILE}}` 中**所有可复用的视觉单元**全部迁移为 forge 组件。

# 必读文档

按顺序读完以下文档（不可跳过）：

1. `docs/engine/architecture.md`
2. `docs/engine/syntax.md`
3. `docs/engine/component-api.md`
4. `docs/engine/design-tokens.md`
5. `docs/engine/extensibility.md`
6. `docs/migration/overview.md`
7. `docs/migration/workflow.md`
8. `docs/migration/checklist.md`
9. `docs/migration/examples/stat-card-walkthrough.md`
10. `docs/migration/inventory.md` — 关注本 HTML 对应章节的"候选组件"列表

读完后参考以下"已迁移组件"作为代码风格模板：

11. `src/builtin/components/card/feature-card.ts`
12. `src/builtin/components/card/stat-card.ts`
13. `src/builtin/components/list/timeline.ts`

# 任务输入

- **源 HTML**：`/data/workspace/md-html-forge/src/templates/html-effectiveness/{{HTML_FILE}}`
- **本 HTML 的主题**：{{HTML_THEME_DESCRIPTION}}
- **inventory.md 中的候选组件清单**：作为参考，但**最终颗粒度由你判断**

# 工作流程

## Phase 1: 整体分析（30 min）

1. 完整阅读源 HTML，建立心智模型
2. 列出所有视觉块，每个块判断：
   - 是否值得独立成组件（参考 overview.md 的颗粒度判断）
   - 是否与已有组件等价（如 4 列网格 → 复用 grid-4）
   - 建议的 id / category / slot 设计

3. 输出**迁移计划**：
   ```
   ## 迁移计划：{{HTML_FILE}}

   - 复用现有组件：grid-4, timeline
   - 新增 N 个组件：
     1. {{id1}} - {{category1}} - 一句话描述
     2. {{id2}} - {{category2}} - 一句话描述
     ...
   - 不迁移的部分（含原因）：
     - "...装饰性渐变 hero"：仅出现一次，与上下文强耦合
   ```

   **不要直接开始写代码，先把计划报告给用户**。等用户确认后再进入 Phase 2。

## Phase 2: 逐个迁移（每个组件按 docs/migration/workflow.md 7 步法）

按计划顺序，每完成一个组件：
- tsc + eslint 必须 0 错
- 通过 12 项验收清单
- 进入下一个

如果在某个组件遇到阻塞，**停下来报告**，不要硬编码绕过。

## Phase 3: 整体验证（30 min）

1. 写一个**完整 demo MD**，使用本批迁移的所有新组件 + 必要的现有组件
2. 在脑中模拟渲染（或临时写到 demo 测试），与源 HTML 视觉对比
3. 切换 dark / sage 主题验证
4. 切换 mobile / wide 页宽验证

## Phase 4: 报告

输出最终报告：

```
## 迁移完成：{{HTML_FILE}}

### 新增组件（N 个）

| id | category | slots | css 行数 | 来源选择器 |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

### 文件变更
- 新建 N 个文件：src/builtin/components/.../*.ts
- 修改 M 个 index.ts
- 更新 docs/migration/inventory.md

### 完整 demo MD

\`\`\`md
<!-- @page width=wide -->
<!-- @compose: ... -->
... 复现源 HTML 的最小 MD ...
\`\`\`

### 验收
- [x] tsc 0 错误
- [x] eslint 0 错误
- [x] 所有新组件通过 12 项 checklist
- [x] dark / sage / cobalt 主题正常
- [x] mobile / wide 页宽正常

### 已知问题 / 备注
- 任何与源 HTML 不一致的视觉差异（含理由）
- 任何 future-work 建议
```

# 边界

## 允许动

- 新建 `src/builtin/components/<category>/<id>.ts`（多个）
- 修改 `src/builtin/components/<category>/index.ts`（多个）
- 更新 `docs/migration/inventory.md`

## 不允许动

- `src/builtin/compiler/` 任何文件
- `src/builtin/components/_base.ts`、`shared-tokens.ts`
- 其他**已存在**的组件文件
- `src/components/` 任何文件
- `src/lib/` 任何文件
- 源 HTML 文件本身（保持作为对照参考）
- `package.json`（不要引入新依赖）

## 严格遵守

- 每个组件单独通过 `docs/migration/checklist.md` 12 项验收
- CSS 命名空间 `.comp-<id>` 严格隔离
- 零 hardcode 颜色（全部用 `var(--xxx)`）
- 共享 token 不增不减

# 决策准则

遇到设计判断时按以下优先级：

1. **复用 > 新增**：如果某个视觉块和现有组件等价，永远选择复用
2. **细 > 粗**：拿不准颗粒度时，选择更细的拆分
3. **MD 兼容 > 紧凑**：slot 设计优先让用户能用原生 MD 写
4. **token > 自定义**：宁可用近似的共享 token，也不要新增 token

# 阻塞处理

遇到以下情况**立即停下来报告，不要继续**：

- 某个视觉效果**确实**需要新颜色 / 新字体（先与用户确认是否加 token）
- 某个 slot 类型不能用现有 4 种 type 表达
- 某个交互需要 JavaScript（forge 不支持组件级 JS）
- 颗粒度判断模糊，候选 id 不止一个合理选择
- 源 HTML 的某段实在无法用 forge 表达（说明哪部分、为什么）

报告格式：

```
## 阻塞：{{阻塞点}}

- 位置：源 HTML 第 X-Y 行
- 问题描述：...
- 我看到的方案：
  A. ...
  B. ...
- 建议：A
```

</task>
