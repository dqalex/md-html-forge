# 产品方向决策

> 基于 [`positioning.md`](./positioning.md) 的核心定位，下面是所有执行工作的依据。
>
> 决策确认日期：2026-05-10

## 决策 1：组件库的规模与形态

**结论**：B 主导 — 组件丰富 + 同类可切换变体 + 支持交互。

- **原子组件数量**：不追求数量膨胀，目标 **25-30 个原子组件**
- **变体数量**：每个组件 **2-4 个变体**（紧凑/标准/详细 或 左/中/右对齐等）
- **核心交互**：用户在预览中点击组件 → 切换变体 → 即时预览（这是本产品的标志性交互）
- **组件可带 JS**：组件可以在渲染后具备交互（折叠/tab/勾选/拖拽/表单等），不再是静态 HTML

"组件要丰富" 指的是**变体的丰富度**和**交互的丰富度**，不是组件数量。

### 合并方向（当前 77 → 目标 ~30）

| 目标原子组件 | 当前散在的组件（应合并为变体） |
|---|---|
| `card`（通用卡片） | feature-card, stat-card, approach-card, variant-card, decision-card, detail-panel, sample-card, ticket-card |
| `list-item`（列表项） | ship-item, carryover-item, focus-item, shipped-row, file-changed-row, file-entry, action-row |
| `callout`（提示块） | concept-callout, callout-note, warn-banner, open-questions, recommendation |
| `panel`（信息面板） | snippet-panel, glossary-panel, detail-panel, prompt-box |
| `table-like`（表格类） | table, risk-table, impact-table, flag-row |
| `timeline`（时间线） | timeline, milestones, incident-timeline-entry |

## 决策 2：主语言

**结论**：A 主导 — Markdown 是主语言。

- 用户主要通过 MD 表达内容
- `@compose` 等指令尽量自动推断，能不写就不写
- 组件变体、主题、字体配色通过 **UI 操作**，不要求用户手写指令
- 源 MD 文件在任何 MD 编辑器打开都必须合理可读
- **双向绑定**：用户在预览里的交互（勾选、拖拽、编辑）自动回写 MD

## 决策 3：模板 + 组件包 —— 产品三层架构

### 3.1 渲染配方三层

| 层次 | 内容 | 面向用户 |
|---|---|---|
| L1 渲染预设 | 组件变体选择 + 字体 + 配色 + 主题 | 内置，新手用 |
| L2 品牌包 | L1 + 自定义组件（如品牌 logo） | 商务用户主要使用 |
| L3 文档模板 | L2 + 固定文档结构 | 高阶用户，需要严格结构化的团队 |

**商务用户主要形态是 L2（品牌包）**。L1 是内置预设，L3 是进阶。

**核心承诺**：**"下次同样的内容进来，同样的 HTML 样式出去"** — 这是品牌包对用户的根本承诺。

### 3.2 组件包格式（`.forge.md`）

用户自定义组件、AI 生成的组件、甚至内置组件，都采用**统一的单文件 md 格式**。一个 md 文件 = 一个组件包，可导入、可分发、可编辑。

参考 teamclaw 的 `landingpage-template.md` 范式，扩展到四件套：

```markdown
<!-- 组件元信息 -->
# <Component Name>
id: kebab-case-id
category: card | list-item | callout | panel | table-like | timeline | ...
variants: standard, compact, detailed

<!-- 变体说明 -->
## Variants
- `standard`: 默认布局，三行
- `compact`: 紧凑一行
- `detailed`: 带附加信息

## Slots
```yaml
cardTitle: { label: 标题, type: text, placeholder: 功能名称, bind: h3 }
cardBody:  { label: 描述, type: content, placeholder: 一段介绍 }
```

## HTML
```html
<div class="comp-xxx" data-variant="{{variant}}">
  <h3 data-slot="cardTitle"></h3>
  <div data-slot="cardBody" data-slot-type="content"></div>
</div>
```

## CSS
```css
.comp-xxx { ... }
.comp-xxx[data-variant="compact"] { ... }
```

## JS
```js
// 可选。组件挂载后运行，通过 forge 注入的 api 做交互 + MD 双向同步
export function mount(el, { slots, emit }) {
  // emit('slotUpdate', { name, value }) 触发 MD 回写
}
```

## Sample
```markdown
<!-- 示例 MD，用于开发预览和 AI 学习 -->
```
```

**这个格式的意义**：
- 用户想加品牌组件：写一份 `logo-header.forge.md`，导入即用
- AI 按规范生成组件：直接输出符合这个格式的 md，可插拔
- 内置组件也可以用这个格式（后续迁移目标），做到一视同仁

## 决策 4：主题的商业价值

**结论**：B 方向 — 同一份内容在不同品牌/产品线复用。

- **预设主题数量**：精简到 3 个（editorial 默认 + dark + 一个对比色）
- **自定义能力**：重点投入。主题编辑器支持：
  - 完整的颜色/字体/圆角配置
  - 品牌 logo 植入
  - 多品牌快速切换（一键换皮）
- **不做的**：不追求大量花哨的预设主题

## 决策 5：AI 的产品定位

**结论**：短期是开发工具，长期可能纳入产品能力。

- **当前**：`docs/prompts/` 里的提示词用于组件迁移的内部开发流程，不是产品能力
- **未来潜在**：用户通过对话让 AI 按规范（`forge.md`）生成新组件，产出标准 `.forge.md` 文件供用户导入

## 决策 6：开源与变现

**结论**：完整开源 + 仅卖 API 服务。

| 维度 | 决策 |
|---|---|
| 代码 | 完整开源（MIT 或 Apache 2.0） |
| 内置组件库 | 开源 |
| 主题、组件包格式 | 开源 |
| `forge.md` 规范 | 开源，公开发布 |
| 免费自托管 | 是 |
| 变现 | 云端渲染 API + CLI，面向不想折腾的用户/企业 |
| **不做** | 组件付费解锁、模板市场抽成、主题订阅 |

## 决策 7：JS 交互与双向同步

**结论**：C 级 — 完整双向同步。

- **级别 C**：用户在预览里的操作（勾选/编辑/拖拽）自动回写 MD；用户改 MD 的同时预览的交互态同步
- 覆盖场景：checkbox、折叠、tab、拖拽排序、行内编辑、表单等
- 引擎层面需要：
  - 组件可带 JS 片段，运行在隔离作用域
  - 注入标准 API：`emit(slotUpdate, …)` 等
  - 引擎监听并回写 MD，保持 MD 与 UI 态一致

## 关键能力差距（当前代码缺失，按优先级）

| 能力 | 重要性 | 当前状态 |
|---|---|---|
| AI 可读的项目规范（`forge.md`） | ⭐⭐⭐⭐⭐ | 不存在 |
| 组件变体系统 | ⭐⭐⭐⭐⭐ | 不存在 |
| JS 交互 + 双向同步 | ⭐⭐⭐⭐⭐ | 部分存在（仅 checkbox） |
| `.forge.md` 组件包格式 + 加载器 | ⭐⭐⭐⭐⭐ | 不存在 |
| "品牌包"保存与复用 | ⭐⭐⭐⭐ | 不存在 |
| 主题自定义编辑器 | ⭐⭐⭐⭐ | 不存在 |
| AI 按规范生成组件 | ⭐⭐⭐ | 不存在 |

## 必须放弃的方向

- ❌ 120 个组件的数量目标（用变体替代）
- ❌ 大量主题预设（3 个够用，重心转向自定义）
- ❌ 让用户手写 `@compose` 的完整语法
- ❌ `docs/migration/inventory.md` 的人工维护（改为从代码自动生成）
- ❌ 付费分层（全开源，只靠 API 服务变现）
- ❌ 静态渲染（必须支持交互）
