# 语法规范

> 一句话：**所有 forge 扩展是 HTML 注释，内容永远是原生 Markdown**。

## 指令分类

| 指令 | 作用域 | 形态 |
|---|---|---|
| `@page` | 文档级（一次性） | `<!-- @page width=wide band=full-bleed -->` |
| `@compose` | 文档级（一次性） | `<!-- @compose: header, body, footer -->` |
| `@layout` | 段级（直到下一个） | `<!-- @layout: stack -->` 或 `<!-- @layout grid-3 -->` |
| `@theme` | 段级（直到下一个） | `<!-- @theme: dark -->` 或 `<!-- @theme dark -->` |
| `@use` | 组件级（下一个 MD 块归属） | `<!-- @use header -->` |
| `@slot:name`...`@/slot` | 块级 | 显式包裹 slot 内容 |
| `@compose-group`...`@/compose-group` | 块级 | 同一布局下循环多个组件 |
| `@item`...`@/item` | 块级（在 group 内） | 一个循环项 |

## `@page` —— 文档级页面配置

```md
<!-- @page: wide -->                          冒号式
<!-- @page wide -->                           positional
<!-- @page width=wide band=full-bleed -->     全属性式
<!-- @page: 960 -->                           纯数字 → 960px
<!-- @page: 100% -->                          CSS 宽度
```

**预设宽度**：

| id | 宽度 | 场景 |
|---|---|---|
| `mobile` | 420px | 移动预览 |
| `narrow` | 680px | 博客文章 |
| `reading` | 760px | 阅读器 |
| `default` | 880px | 平衡（默认） |
| `wide` | 1080px | PC 优化 |
| `xwide` | 1280px | 数据看板 |
| `full` | 100% | 通栏 |

**Band 样式**：
- `contained`（默认）：主题段背景受页宽约束 → 视觉协调
- `full-bleed`：主题段背景铺满视口两侧，内容仍按页宽居中 → banner 感

## `@compose` —— 声明文档使用的组件

```md
<!-- @compose: header, tldr, body, footer -->
```

- 列表顺序 = 渲染顺序
- 同一组件可以多次出现（按段切割决定每次出现归到哪段）
- 模板的 `componentIds` 会被 `@compose` 完全覆盖

## `@layout` / `@theme` —— 段切割

```md
<!-- @theme: editorial -->
<!-- @layout: stack -->

# 段 1 内容（editorial 主题，stack 布局）

<!-- @theme: dark -->

段 2 内容（dark 主题，仍是 stack 布局）

<!-- @layout: grid-3 -->

段 3 内容（dark 主题，grid-3 布局）
```

**段 = 由第一个 `@theme` 或 `@layout` 起始，到下一个 `@theme`/`@layout` 之前**。

## `@use` —— 显式组件归属

```md
<!-- @compose: header, tldr, body -->

<!-- @use header -->
# md-html-forge          ← 自动绑定 header.title (h1)
## 副标题                 ← 自动绑定 header.subtitle (h2)

<!-- @use tldr -->
- 要点一                  ← 自动绑定 tldr.tldr (list)
- 要点二

<!-- @use body -->

## 工作方式
任意原生 MD 内容 ...     ← 全部归入 body.body (content 兜底)
```

## `@slot:name` —— 显式 slot 内容

```md
<!-- @slot:eyebrow -->PLAYGROUND · DEMO<!-- @/slot -->

<!-- @slot:cardBody -->
一段含 **加粗** 和换行的
富文本内容。
<!-- @/slot -->
```

**何时用**：
- 同一组件的同一 slot 需要明确指定（不依赖原生 MD 自动绑定）
- 该 slot 是 `text` 或 `content` 类型，需要内联 markdown
- 该 slot 在裸 MD 里没有合适的对应块

## `@compose-group` / `@item` —— 循环

```md
<!-- @compose-group: layout-grid-4 -->

<!-- @item: stat-card -->
<!-- @slot:statValue -->30+<!-- @/slot -->
<!-- @slot:statLabel -->Components<!-- @/slot -->
<!-- @/item -->

<!-- @item: stat-card -->
<!-- @slot:statValue -->8<!-- @/slot -->
<!-- @slot:statLabel -->Templates<!-- @/slot -->
<!-- @/item -->

<!-- @/compose-group -->
```

**紧凑属性式**（推荐用于纯文本 slot 简写）：

```md
<!-- @compose-group layout-grid-4 -->
<!-- @item stat-card statValue="30+" statLabel="Components" --><!-- @/item -->
<!-- @item stat-card statValue="8"   statLabel="Templates"  --><!-- @/item -->
<!-- @/compose-group -->
```

**注意**：`@item` / `@compose-group` 的属性是**组件 id + 简单键值**，不算"内容藏入注释"，所以保留。

## 原生 MD → Slot 自动绑定

每个 slot 在 `defineComponent` 里可声明 `bind`：

```ts
slots: {
  title:    { type: 'text',    bind: 'h1' },
  subtitle: { type: 'content', bind: 'h2' },
  tldr:     { type: 'content', bind: 'list' },
  lead:     { type: 'content', bind: 'blockquote' },
  body:     { type: 'content', bind: 'content' },   // 兜底：吃所有剩余块
}
```

**支持的 bind 类型**：

| bind | 匹配 |
|---|---|
| `h1` / `h2` / `h3` | 一/二/三级标题 |
| `blockquote` | `> ...` 引用块 |
| `ul` | `- ...` 无序列表 |
| `ol` | `1. ...` 有序列表 |
| `list` | 任意列表（ul 或 ol） |
| `code` | ` ``` lang ... ``` ` 代码块 |
| `table` | `\| ... \|` 表格 |
| `paragraph` | 普通段落 |
| `content` | **兜底**：吸收段内所有剩余未被占用的块 |

**匹配规则**：
1. 在 `@use <componentId>` 之后的 MD 块中，按声明类型匹配第一个合适的块
2. 匹配到的块"被消费"，不再分配给同组件的其他 slot
3. 显式 `<!-- @slot:name -->` **总是优先**，被显式提供的 slot 不会再被自动绑定覆盖

## 内联语法

| 写法 | 渲染 |
|---|---|
| `**bold**` | `<strong>bold</strong>` |
| `*italic*` | `<em>italic</em>` |
| `` `code` `` | `<code>code</code>` |
| `[link](url)` | `<a href="url">link</a>` |
| `:lucide:zap:` | `<i data-lucide="zap"></i>` → 渲染为 SVG 图标 |

## 声明式图表（在代码块里）

````md
```flow
用户写 Markdown
  ▼
Lexer · 单遍扫描
  ▼
Parser · Token → AST
  ▼
✅ HTML
```

```compare
✅ Markdown 原生
- 可读性好
- 学习成本低

❌ 属性藏内容
- 裸 MD 看不到
```

```steps
1. Step one
2. Step two
3. Step three
```
````

每种图表的 CSS **按需注入**：HTML 里没出现 `data-diagram="flow"` 就不会有 `.sd-flow` 选择器。

## Checkbox 双向同步

```md
- [ ] 待办一
- [x] 已完成
```

预览里点击 checkbox → 通过 `postMessage` 回写到 MD（`- [ ]` ↔ `- [x]`）。

## 优先级总览

```
1. 显式 <!-- @slot:name -->...<!-- @/slot -->         （最高，手动精准）
2. @item 属性式 key=value                              （仅 group/item 用）
3. 原生 MD 块（# / > / - 等）按 slot.bind 自动绑定      （推荐，可读性最好）
4. 模板默认 + 内置默认                                  （兜底）
```
