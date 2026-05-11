# 组件包格式规范（`.forge.md`）

> 本文档定义 md-html-forge 的**组件包格式**：一份单 md 文件即一个完整组件。
>
> 这是产品最底层的契约。**内置组件、用户自定义组件、AI 生成组件都使用这个格式**。
>
> 初版：2026-05-10

## 1. 设计原则

| 原则 | 说明 |
|---|---|
| 单文件 | 一个 `.forge.md` 文件 = 一个完整组件包，便于分享/导入/AI 输出 |
| 人可读 | 在任何 MD 编辑器打开都是合理文档，能直接读懂 |
| AI 友好 | 结构固定，AI 易学易写 |
| 可插拔 | 用户和 AI 可生产新组件，引擎统一加载 |
| 多变体 | 每个组件用配置式声明可用变体，UI 与 AI 都能枚举 |

## 2. 文件结构

一份 `.forge.md` 由 **5 个固定区段** 组成（顺序固定，全部必填）：

```markdown
# <ComponentDisplayName>

<前导元信息>

## Variants
<变体清单>

## Slots
<slot 定义>

## HTML
<HTML 模板>

## CSS
<CSS 样式>

## JS
<JS 交互（可选，但区段必须存在，可为空代码块）>

## Sample
<示范 MD，给 AI 学习 + 给开发预览>
```

## 3. 各区段规范

### 3.1 前导元信息（紧跟一级标题）

紧随 `# <Name>` 之后，用键值对（每行一项）声明组件的元信息：

```markdown
# 通用卡片

id: card
category: card
tags: card, common
trust: builtin
defaultVariant: standard
```

| 字段 | 必填 | 说明 |
|---|---|---|
| `id` | ✅ | kebab-case，全局唯一 |
| `category` | ✅ | `card` / `list-item` / `callout` / `panel` / `table-like` / `timeline` / `header` / `summary` / `content` / `data` / `visual` / `layout` / `footer` / `special` |
| `tags` | ❌ | 逗号分隔，用于搜索 |
| `trust` | ✅ | `builtin`（内置，JS 主文档运行）/ `user`（用户导入，JS iframe 隔离） |
| `defaultVariant` | ❌ | 默认变体 id，缺省即第一个 |
| `description` | ❌ | 一句话用途 |

### 3.2 `## Variants`（变体声明）

**配置式**：必须显式列出所有可用变体。AI 与 UI 据此枚举。

```markdown
## Variants

- `standard` — 默认布局，三行（标题 + 描述 + 元数据）
- `compact` — 紧凑一行（标题 + 描述合并）
- `detailed` — 详细，附加图标和 chip
```

约束：
- 每个变体 = 一行 `` `id` — 中文/英文描述 ``
- 至少 1 个变体（即使只有 `standard`）
- 最多 4 个变体（认知负担考虑）
- 变体 id：kebab-case
- 描述用于 UI 切换面板的提示和 AI 的选择依据

### 3.3 `## Slots`（slot 定义）

用 YAML 声明 slot：

````markdown
## Slots

```yaml
cardTitle:
  label: 标题
  type: text
  bind: h3
  placeholder: 功能名称
cardBody:
  label: 描述
  type: content
  placeholder: 一段介绍
cardMeta:
  label: 元数据（可选）
  type: text
  placeholder: 2026-05-10
```
````

支持的 slot type（**精简到 3 种**）：

| type | 用途 | 渲染 |
|---|---|---|
| `text` | 单行文本（标题/徽章/日期） | 内联 markdown 渲染 |
| `content` | 块级 markdown（段落/列表/引用/代码块/表格） | 完整 markdown 渲染 |
| `data` | 结构化数据，组件自己解析 | 原值传入 |

`bind` 字段用于"原生 MD 块自动绑定"（详见 [`docs/engine/syntax.md`](../engine/syntax.md)），可选值：
`h1` / `h2` / `h3` / `blockquote` / `ul` / `ol` / `list` / `code` / `table` / `paragraph` / `content`（兜底）。

`data` 类型 slot 的 DSL **必须统一为"每行 + `|` 分隔列"**：

```
描述|严重度|缓解措施
描述2|严重度2|缓解2
```

如果列含义需要说明，在 `description` 字段写清楚每列含义。

### 3.4 `## HTML`（HTML 模板）

````markdown
## HTML

```html
<div class="comp-card" data-section="card" data-variant="{{variant}}">
  <h3 data-slot="cardTitle"></h3>
  <div data-slot="cardBody" data-slot-type="content"></div>
  <span class="meta" data-slot="cardMeta"></span>
</div>
```
````

约束：
- 根元素必须有 `data-section="<id>"`
- 根元素**必须包含** `data-variant="{{variant}}"`，引擎会替换为实际变体值
- 每个 slot 输出处必须有 `data-slot="<name>"`
- 块级 content slot 必须有 `data-slot-type="content"`
- data slot 必须有 `data-slot-type="data"`
- 不要在 HTML 里硬编码内容文本，**所有可变内容走 slot**
- 内置全局 token 不必写 `<style>`，CSS 单独写在下一节

### 3.5 `## CSS`（样式）

````markdown
## CSS

```css
.comp-card {
  background: var(--white);
  border: var(--border);
  border-radius: var(--radius-panel);
  padding: 22px 24px;
}

/* 变体差异 */
.comp-card[data-variant="compact"] {
  padding: 12px 16px;
}
.comp-card[data-variant="detailed"] .meta {
  display: block;
  margin-top: 8px;
}
```
````

约束：
- 所有选择器必须以 `.comp-<id>` 开头（命名空间隔离）
- 变体差异用 `[data-variant="xxx"]` 表达
- 颜色 / 字体 / 圆角 / 边框**必须用 token**（`var(--xxx)`），禁止硬编码
- 长度建议 < 150 行

### 3.6 `## JS`（交互 + 双向同步，可选区段）

````markdown
## JS

```js
// 组件挂载后调用一次。引擎注入 forge api。
// el: 组件根元素
// api: { slots, emit, on, brand }
//   - slots: 当前 slot 值（只读）
//   - emit('slotUpdate', { name, value }): 用户改了内容，触发 MD 回写
//   - emit('variantChange', variantId): 切换变体（也会回写 MD）
//   - on('slotChange', cb): 监听其他来源对 slot 的更新（保持双向同步）
//   - brand: 当前激活的品牌包配置（如 logo/color）
export function mount(el, api) {
  // 例：让 .meta 可双击编辑
  const meta = el.querySelector('[data-slot="cardMeta"]');
  meta?.addEventListener('dblclick', () => {
    meta.contentEditable = 'true';
    meta.focus();
  });
  meta?.addEventListener('blur', () => {
    meta.contentEditable = 'false';
    api.emit('slotUpdate', { name: 'cardMeta', value: meta.textContent.trim() });
  });
}

// 可选：组件卸载前清理
export function unmount(el) {
  // 移除 listener、清理副作用
}
```
````

约束：
- 必须有 `## JS` 区段，但代码块可以为空（`export function mount() {}`）
- 必须导出 `mount(el, api)`，可选导出 `unmount(el)`
- **不允许直接 `document.querySelector`** —— 只能在 `el` 子树内操作（保证组件隔离）
- **不允许全局污染**（不要挂 `window.xxx`、不要用全局事件总线）
- 通信全部走 `api.emit` / `api.on`

#### `trust: builtin` 与 `trust: user` 的区别

| trust | 加载方式 | 性能 | 隔离 | 适用 |
|---|---|---|---|---|
| `builtin` | JS 直接注入预览主文档运行 | 0ms 同步 | 弱（受 CSS 命名空间约束） | 内置组件 + 用户信任组件 |
| `user` | JS 在 iframe 内运行，通过 postMessage 与主文档双向同步 | 10-50ms | 强 | 用户导入第三方组件 |

引擎根据 `trust` 字段自动选择运行方式，组件作者无需关心。

### 3.7 `## Sample`（示范 MD）

````markdown
## Sample

```markdown
<!-- @use card variant=standard -->

### 极速渲染

从 Markdown 到样式 HTML，**纯前端、零后端**。

<!-- @slot:cardMeta -->
2026-05-10
<!-- @/slot -->
```
````

作用：
- 开发预览：渲染这段 MD 看组件效果
- AI 学习：AI 读 sample 就知道组件怎么用
- 兜底文档：用户不知道组件怎么写时，复制 sample 即可

约束：
- 必须演示**默认变体** + 至少一个非默认变体（如有多个变体）
- slot 值要"真实"，不是 `[placeholder]`

## 4. 完整最小示例

参见 `examples/card.forge.md`（待建）。

## 5. 变体的 MD 用法

用户/AI 在内容 MD 里通过 `variant` 参数声明：

```markdown
<!-- @use card variant=compact -->

### 紧凑卡片

紧凑展示。
```

或在 `@compose-group` 的 `@item` 里：

```markdown
<!-- @item card variant=detailed -->
<!-- @slot:cardTitle -->详细卡片<!-- @/slot -->
<!-- @/item -->
```

不写 `variant=` 时使用 `defaultVariant`（缺省即第一个）。

## 6. 加载与注册

### 6.1 内置组件

工程内的内置组件按本格式书写，存放路径：

```
src/builtin/components/<category>/<id>.forge.md
```

构建期/运行期统一通过 loader 解析为 `ComponentDef`。

### 6.2 用户自定义组件

用户在 UI 中"导入组件包" → 上传 `.forge.md` → 引擎解析 + 校验（参见第 7 节）→ 注册为 `trust: user` 组件 → 在当前文档可用 `@use` 引用。

可选：用户保存到"个人组件库"，跨文档复用。

### 6.3 品牌包内的自定义组件

L2 品牌包可携带自定义组件（如 `<brand>-header.forge.md`），随品牌包一起导入。

## 7. 引擎校验规则（loader 必须执行）

加载组件包时，引擎必须执行以下校验，任何一项失败即拒绝加载：

- [ ] 一级标题存在且非空
- [ ] 元信息里 `id` / `category` / `trust` 三项必填
- [ ] `id` 是合法 kebab-case
- [ ] `## Variants` 区段存在，至少 1 个变体
- [ ] `## Slots` 区段存在（可空对象 `{}`）
- [ ] `## HTML` 区段存在，根元素含 `data-section` + `data-variant`
- [ ] `## CSS` 所有选择器以 `.comp-<id>` 开头
- [ ] `## JS` 区段存在（代码块可为空）
- [ ] `## Sample` 区段存在
- [ ] data slot 的 DSL 列数与 `description` 描述一致（如能解析）
- [ ] 用户上传组件（`trust: user`）：JS 不含 `document.` / `window.` / `top.` / `parent.` 等危险全局引用（语法层面静态扫描）

## 8. AI 生成组件的提示词约束（forge.md 中体现）

当用户让 AI 按规范生成组件时，提示词必须强制：

- 输出**完整的单 md 文件**，包含全部 5 个区段
- 不允许跳过任何区段
- `id` 必须 kebab-case 且不与已有冲突
- 所有 CSS 选择器必须 `.comp-<id>` 开头
- 颜色 / 字体必须用 `var(--xxx)` token
- JS 不允许全局污染、不允许访问 `el` 子树外的 DOM
- `## Sample` 必须能渲染出有意义的视觉效果

## 9. 与现有架构的迁移

当前 `src/builtin/components/<category>/<id>.ts`（TypeScript `defineComponent` 形式）是过渡形态。**目标终局**：所有内置组件改写为 `.forge.md` 单文件，引擎只保留 loader。

迁移节奏：
- Phase 1（今日）：定义 loader + 改造引擎以同时支持两种格式
- Phase 2（本周）：把核心 6-8 个原子组件迁移到 `.forge.md`，作为参考实现
- Phase 3（后续）：批量迁移剩余内置组件

## 10. 参考

- [`positioning.md`](./positioning.md)
- [`direction.md`](./direction.md) 决策 1、3、7
- teamclaw 的 `landingpage-template.md`（启发本格式的早期范式）
- `docs/engine/component-api.md`（当前 TypeScript 形式的组件定义）
