# 提示词：组件合并迁移到 `.forge.md` 单文件多变体格式

> **使用方式**：今天的产品方向变更后，我们要把现有 TypeScript 形式的多个相似组件合并为**一个 `.forge.md` 单文件**，每个原组件成为新组件的一个变体。把以下整段（`<task>` 之间的内容）作为 prompt 发给 agent，把 `{{...}}` 占位符替换成实际值。

---

<task>

# 角色

你是 **md-html-forge** 项目的资深组件架构师。项目位于 `/data/workspace/md-html-forge`。

本次任务：**把若干个 TypeScript 形式的相似组件合并为一个 `.forge.md` 单文件**，每个原组件成为该新组件的一个变体。这是产品方向调整后的核心重构工作（详见 `docs/product/direction.md` 决策 1）。

# 必读文档（按顺序，不可跳过）

1. `/data/workspace/md-html-forge/docs/product/positioning.md` — 产品定位（5 分钟）
2. `/data/workspace/md-html-forge/docs/product/direction.md` — **重点**：方向决策，特别是决策 1 和 7（10 分钟）
3. `/data/workspace/md-html-forge/docs/product/component-package.md` — **重点**：`.forge.md` 格式规范（15 分钟）
4. `/data/workspace/md-html-forge/docs/engine/design-tokens.md` — 颜色 / 字体 token（5 分钟）
5. `/data/workspace/md-html-forge/docs/engine/syntax.md` — slot / bind 等语法（10 分钟）

读完后参考一份**已迁移的样板**作为格式范本：

6. `/data/workspace/md-html-forge/src/builtin/components/_examples/{{REFERENCE_FILE}}` （由主 agent 提供。如不存在，参考 `docs/product/component-package.md` 第 4 节的最小示例）

# 任务输入

- **目标组件 id**：`{{TARGET_ID}}`（kebab-case）
- **目标组件分类**：`{{TARGET_CATEGORY}}`
- **要合并的源组件**（每个变成一个变体）：
  ```
  {{SOURCE_COMPONENTS}}
  ```
  示例格式：
  ```
  - feature-card  → variant: standard
  - stat-card     → variant: stat
  - approach-card → variant: approach
  - decision-card → variant: decision
  ```
- **目标 `.forge.md` 路径**：`/data/workspace/md-html-forge/src/builtin/components/{{TARGET_CATEGORY}}/{{TARGET_ID}}.forge.md`

# 工作步骤

## Step 1：理解每个源组件（30 min）

依次 `read_file` 所有源组件文件（`src/builtin/components/<category>/<id>.ts`），对每个组件梳理：

- 它的 slot 列表（合并时哪些是公共的、哪些是变体特有的）
- 它的 CSS 视觉特征（颜色、间距、布局）
- 它的 HTML 结构骨架
- 它有没有 sample / 特殊渲染逻辑

输出**合并分析表**给主 agent 确认：

```markdown
## 合并分析：{{TARGET_ID}}

### 公共 slot（所有变体共享）
| slot | type | bind | placeholder | 说明 |

### 变体特有 slot
| variant | 仅它有的 slot |

### 变体视觉差异（决定 CSS 怎么写）
| variant | 颜色 / 布局 / 关键差异 |

### 风险点
- 如果某个源组件结构差异太大，无法用变体统一，**停下来报告**
```

**等主 agent 确认后再进入 Step 2**。

## Step 2：写 `.forge.md` 单文件（90 min）

严格按 `docs/product/component-package.md` 第 2-3 节的结构，编写完整的 `.forge.md` 文件，包含 5 个区段：

1. 一级标题 + 元信息（id / category / tags / trust=builtin / defaultVariant）
2. `## Variants` — 列出每个变体（与源组件一一对应）
3. `## Slots` — 用 YAML 声明所有 slot（公共 + 变体特有）
4. `## HTML` — 一份骨架 HTML，根元素带 `data-section` + `data-variant="{{variant}}"`，用 CSS 控制变体差异
5. `## CSS` — `.comp-{{TARGET_ID}}` 命名空间 + `[data-variant="xxx"]` 表达差异
6. `## JS` — 如果原组件有交互（checkbox / 折叠等）需要保留，写在这里；否则写空 `export function mount() {}`
7. `## Sample` — 演示**默认变体 + 至少一个非默认变体**的 MD 片段

### 关键约束

- ❌ 不要硬编码颜色 / 字体 / 圆角，全部用 `var(--xxx)` token
- ❌ 不要写裸全局选择器，所有 CSS 必须 `.comp-{{TARGET_ID}}` 开头
- ❌ 不要遗漏任何源组件能力 — 用户用旧组件能做的事，新组件加 variant 也要能做
- ❌ 不要使用 inline `style="..."`，除非是用户输入的动态值（如展示型组件的字号样例）
- ✅ 变体差异优先用 CSS（`[data-variant="x"]`），不要写两套 HTML
- ✅ 每个 slot 输出处必须有 `data-slot="<name>"`
- ✅ 块级 content slot 加 `data-slot-type="content"`，data slot 加 `data-slot-type="data"`
- ✅ 根元素必须有 `data-section="{{TARGET_ID}}"` 和 `data-variant="{{variant}}"`

## Step 3：自检（15 min）

按 `docs/product/component-package.md` 第 7 节的校验清单逐项检查：

- [ ] 一级标题非空
- [ ] id / category / trust 三项必填
- [ ] id 是合法 kebab-case
- [ ] `## Variants` 至少 1 个变体
- [ ] `## Slots` 区段存在
- [ ] `## HTML` 根元素含 `data-section` + `data-variant`
- [ ] `## CSS` 选择器以 `.comp-<id>` 开头
- [ ] `## JS` 区段存在（可空）
- [ ] `## Sample` 区段存在
- [ ] 0 处硬编码颜色

## Step 4：报告

完成后输出：

```markdown
## 合并完成：{{TARGET_ID}}

### 文件
- 新建：src/builtin/components/{{TARGET_CATEGORY}}/{{TARGET_ID}}.forge.md
- 行数：HTML {{n}} 行 / CSS {{n}} 行 / JS {{n}} 行

### 变体清单
| variant | 来自源组件 | 视觉差异关键点 |

### Slot 列表
| name | type | bind | 公共/变体特有 |

### 自检结果
- [x] 11 项校验全过
- 0 处硬编码颜色
- {{m}} 处 var(--xxx) 引用

### 已知差异 / 备注
- 与源组件 X 的差异：...（如有）

### 旧文件处理
**不要删除**源组件的 .ts 文件 — 留给主 agent 统一删除（避免破坏 index.ts）。
仅在报告里列出"以下文件可由主 agent 删除"清单：
- src/builtin/components/<cat>/<id>.ts
- ...
```

# 边界

## 允许动

- 新建 `src/builtin/components/{{TARGET_CATEGORY}}/{{TARGET_ID}}.forge.md`

## 不允许动

- ❌ 不要删除源组件 .ts 文件（主 agent 会统一处理）
- ❌ 不要修改 `src/builtin/components/<category>/index.ts`（主 agent 会统一处理）
- ❌ 不要修改任何 compiler / engine 代码
- ❌ 不要修改 `shared-tokens.ts`
- ❌ 不要引入新依赖
- ❌ 不要在 `.forge.md` 里使用源组件没有的颜色 / 字体

## 阻塞处理

遇到以下情况**立即停下来报告**，不要硬编码绕过：

- 某个源组件的视觉与其他变体差异巨大，无法在同一 HTML 骨架下用 CSS 表达
- 某个源组件需要的 slot 与其他变体冲突（同名但 type 不同）
- 某个源组件含复杂 JS 交互，不确定如何放进 `## JS`
- 源组件用了 `shared-tokens.ts` 没有的颜色

报告格式：

```
## 阻塞：{{阻塞点}}
- 涉及组件：{{源组件 id}}
- 问题描述：...
- 我看到的方案：A. ... B. ...
- 建议：A
```

</task>
